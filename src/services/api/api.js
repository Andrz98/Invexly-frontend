import axios from 'axios'
import { clearCsrfToken, ensureCsrfToken, isMutationMethod } from './csrf'

const DEFAULT_TIMEOUT_MS = 45000
const rawBaseUrl = import.meta.env.VITE_API_BASE ?? ''
const timeoutFromEnv = Number(import.meta.env.VITE_API_TIMEOUT_MS)

// Normalizamos la URL base para evitar errores por espacios o barras sobrantes.
const BASE_URL = rawBaseUrl.trim().replace(/\/$/, '')

// Permitimos personalizar el timeout por entorno y usamos un valor alto por defecto
// para tolerar el cold-start del backend en plataformas serverless.
const REQUEST_TIMEOUT_MS = Number.isFinite(timeoutFromEnv)
  ? timeoutFromEnv
  : DEFAULT_TIMEOUT_MS

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Adjuntamos CSRF en todas las mutaciones para soportar entornos cross-site.
api.interceptors.request.use(async (config) => {
  if (!isMutationMethod(config.method)) {
    return config
  }

  const hasCsrfHeader =
    config.headers?.['x-csrf-token'] ||
    config.headers?.['X-CSRF-Token'] ||
    config.headers?.['x-xsrf-token'] ||
    config.headers?.['X-XSRF-TOKEN']

  if (hasCsrfHeader) {
    return config
  }

  const csrfToken = await ensureCsrfToken(api)

  if (csrfToken) {
    config.headers = {
      ...config.headers,
      'x-csrf-token': csrfToken,
    }
  }

  return config
})

// Reintentamos una sola vez si el backend rechaza por CSRF para renovar token automáticamente.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config
    const isCsrfError =
      error?.response?.status === 403 &&
      typeof error?.response?.data?.message === 'string' &&
      error.response.data.message.toLowerCase().includes('csrf')

    if (isCsrfError && originalRequest && !originalRequest._csrfRetried) {
      originalRequest._csrfRetried = true
      clearCsrfToken()
      const freshToken = await ensureCsrfToken(api, true)

      if (freshToken) {
        originalRequest.headers = {
          ...originalRequest.headers,
          'x-csrf-token': freshToken,
        }
        return api.request(originalRequest)
      }
    }

    if (error?.code === 'ECONNABORTED') {
      console.error(
        `[API] Timeout excedido (${REQUEST_TIMEOUT_MS} ms):`,
        error.config?.url
      )
    }

    return Promise.reject(error)
  }
)

export default api

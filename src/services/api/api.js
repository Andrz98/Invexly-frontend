import axios from 'axios'

// En esta rama mantenemos la URL del entorno de desarrollo puesto que la ruta del entorno de producción supone una interferencia en el login del usuario y este no puede hacer un correcto logout, Si en el entonorno de producción se genera el mismo fallo, entonces se debe actuar sobre el componente authController (logout) y ver exactamente que puede generar el fallo en producción.
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
  baseURL: BASE_URL, // Utilizamos
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Añadimos telemetría mínima para diagnosticar timeouts y errores de conexión.
api.interceptors.response.use(
  (response) => response,
  (error) => {
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

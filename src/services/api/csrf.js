const CSRF_COOKIE_NAME = 'XSRF-TOKEN'
const DEFAULT_CSRF_ENDPOINT = '/auth/csrf-token'

// Conservamos el token en memoria para evitar pedirlo en cada request mutante.
let cachedCsrfToken = null
let pendingCsrfRequest = null

// Lee una cookie del documento cuando el navegador permite acceso (mismo dominio o dominio compartido).
const readCookieValue = (cookieName) => {
  if (typeof document === 'undefined' || typeof document.cookie !== 'string') {
    return null
  }

  const cookieEntry = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${cookieName}=`))

  if (!cookieEntry) {
    return null
  }

  return decodeURIComponent(cookieEntry.slice(cookieName.length + 1))
}

// Intenta resolver el token CSRF desde las posibles formas de respuesta del backend.
const getTokenFromPayload = (payload) => {
  if (!payload) {
    return null
  }

  if (typeof payload === 'string' && payload.trim().length > 0) {
    return payload.trim()
  }

  if (typeof payload === 'object') {
    const directToken = payload.csrfToken || payload.token
    if (typeof directToken === 'string' && directToken.trim().length > 0) {
      return directToken.trim()
    }

    const nestedToken = payload.data?.csrfToken || payload.data?.token
    if (typeof nestedToken === 'string' && nestedToken.trim().length > 0) {
      return nestedToken.trim()
    }
  }

  return null
}

// Permite configurar el endpoint de emisión de CSRF sin acoplarlo al código.
const getCsrfEndpoint = () => {
  const configuredEndpoint = import.meta.env.VITE_CSRF_ENDPOINT
  return (configuredEndpoint || DEFAULT_CSRF_ENDPOINT).trim()
}

// Solicita un token CSRF nuevo al backend y lo guarda en caché de memoria.
export const fetchCsrfToken = async (apiClient) => {
  const endpoint = getCsrfEndpoint()

  if (!endpoint) {
    return null
  }

  const response = await apiClient.get(endpoint, {
    withCredentials: true,
  })

  const responseToken = getTokenFromPayload(response?.data)
  const cookieToken = readCookieValue(CSRF_COOKIE_NAME)
  const resolvedToken = responseToken || cookieToken

  cachedCsrfToken = resolvedToken || null
  return cachedCsrfToken
}

// Obtiene token CSRF reutilizable; si no existe, lo solicita una única vez concurrente.
export const ensureCsrfToken = async (apiClient, forceRefresh = false) => {
  if (!forceRefresh && cachedCsrfToken) {
    return cachedCsrfToken
  }

  if (!forceRefresh) {
    const cookieToken = readCookieValue(CSRF_COOKIE_NAME)
    if (cookieToken) {
      cachedCsrfToken = cookieToken
      return cachedCsrfToken
    }
  }

  if (!pendingCsrfRequest || forceRefresh) {
    pendingCsrfRequest = fetchCsrfToken(apiClient).finally(() => {
      pendingCsrfRequest = null
    })
  }

  return pendingCsrfRequest
}

// Limpia el token en memoria para obligar una renovación tras logout o errores CSRF.
export const clearCsrfToken = () => {
  cachedCsrfToken = null
}

// Determina si un método HTTP requiere validación CSRF del backend.
export const isMutationMethod = (method) => {
  return ['post', 'put', 'patch', 'delete'].includes((method || '').toLowerCase())
}

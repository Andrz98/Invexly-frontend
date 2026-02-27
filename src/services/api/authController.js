import api from './api'
import { clearCsrfToken } from './csrf'

/**
 * Cierra la sesión del usuario autenticado.
 * @returns {Promise<boolean>} true cuando el backend cierra sesión correctamente.
 */
export const logout = async () => {
  try {
    const response = await api.post('/auth/logout', {}, { withCredentials: true })
    clearCsrfToken()
    return response.status === 200
  } catch (error) {
    console.error('Logout fallido:', error)
    return false
  }
}

/**
 * Inicia sesión enviando credenciales al backend.
 * @param {string} email - Correo del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<object>} Respuesta con los datos del usuario autenticado.
 */
export const login = async (email, password) => {
  try {
    const response = await api.post(
      '/auth/login',
      { email, password },
      { withCredentials: true }
    )
    return response.data
  } catch (error) {
    const isTimeout = error?.code === 'ECONNABORTED'

    console.error('Error en login:', error.response?.data || error.message)

    if (isTimeout) {
      throw new Error(
        'El servidor tardó demasiado en responder. Intenta nuevamente en unos segundos.'
      )
    }

    throw error
  }
}

/**
 * Obtiene la sesión del usuario autenticado desde el backend.
 * @returns {Promise<object|null>} Datos del usuario o null si no está autenticado.
 */
export const getUserSession = async () => {
  try {
    const response = await api.get('/auth/validate-token', {
      withCredentials: true,
    })
    console.log('Sesión validada:', response.data)
    return response.data
  } catch (error) {
    console.error(
      'Error validando token:',
      error.response?.data || error.message
    )

    if (error.response?.status === 401) {
      console.warn('Token inválido o no proporcionado, sesión no iniciada.')
      return null
    }

    return null
  }
}

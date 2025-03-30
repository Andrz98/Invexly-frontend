import api from './api'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE
/**
 * Inicia sesión enviando credenciales al backend.
 * @param {string} email - Correo del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<object>} - Respuesta con los datos del usuario autenticado.
 */
export const logout = async () => {
  try {
    const response = await axios.post(
      `${API_BASE.replace(/\/$/, '')}/auth/logout`,
      {},
      {
        withCredentials: true,
      }
    )
    return response.status === 200
  } catch (error) {
    console.error('Logout fallido:', error)
    return false
  }
}

export const login = async (email, password) => {
  try {
    const response = await api.post(
      '/auth/login',
      { email, password },
      { withCredentials: true }
    )
    return response.data
  } catch (error) {
    console.error('Error en login:', error.response?.data || error.message)
    throw error
  }
}
/**
 * Obtiene la sesión del usuario autenticado desde el backend.
 * @returns {Promise<object|null>} - Datos del usuario o null si no está autenticado.
 */
export const getUserSession = async () => {
  try {
    // Si no hay cookies en el cliente, no llamar al backend
    if (!document.cookie.includes('token')) {
      console.warn(
        'No hay token en las cookies, evitando solicitud innecesaria.'
      )
      return null
    }

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
      return null // NO ejecutar logout si simplemente no hay sesión activa
    }

    return null
  }
}

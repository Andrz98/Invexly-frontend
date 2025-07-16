import { useEffect, useState, useCallback } from 'react'
import { login as loginRequest, logout } from '@/services/api/authController'
import { AuthContext } from './AuthContext'
import { useNavigate } from 'react-router-dom'

/**
 * Proveedor de Autenticación que gestiona el estado global de la sesión del usuario.
 */
const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  const API_BASE = import.meta.env.VITE_API_BASE

  /**
   * Función para iniciar sesión.
   * - Actualiza el estado global del usuario y la sesión.
   */
  const login = (userData) => {
    setUser({ ...userData })
    setIsLoggedIn(true)
  }

  /**
   * Función para cerrar sesión.
   * - Llama al backend para eliminar la sesión
   * - Limpia el estado global del usuario
   * - Redirige al login
   */
  const handleLogout = useCallback(async () => {
    const success = await logout()
    if (success) {
      setUser(null)
      setIsLoggedIn(false)
      setChecking(false)
      navigate('/', { replace: true }) // 🔚 Redirige a la raiz
    } else {
      console.error('Error en el logout.')
    }
  }, [navigate])

  /**
   * Función para verificar la sesión del usuario.
   * - Llama al backend para validar la sesión
   * - Actualiza el estado global de la sesión
   *
   */
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(
          `${API_BASE.replace(/\/$/, '')}/auth/refresh-token`,
          {
            method: 'POST',
            credentials: 'include',
          }
        )

        if (response.ok) {
          const data = await response.json()
          setUser(data.user) // Aseguramos que se reciba el usuario
          setIsLoggedIn(true)
        }
      } catch (error) {
        console.error('Error al validar sesión:', error)
      } finally {
        setChecking(false)
      }
    }

    const timeout = setTimeout(checkSession, 150)

    return () => clearTimeout(timeout)
  }, [API_BASE])

  if (checking) {
    return <div>Cargando usuario...</div>
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn, checking, login, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider

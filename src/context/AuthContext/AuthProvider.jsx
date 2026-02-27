import { useEffect, useState, useCallback } from 'react'
import { login as loginRequest, logout } from '@/services/api/authController'
import { AuthContext } from './AuthContext'
import { useNavigate } from 'react-router-dom'

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const API_BASE = import.meta.env.VITE_API_BASE
  const ABORT_REASON = 'Validación de sesión cancelada por timeout.'

  // Identifica de forma consistente los abortos de peticiones para tratarlos como cancelaciones esperadas.
  const isAbortError = (error) => {
    return (
      error?.name === 'AbortError' ||
      error?.message === ABORT_REASON ||
      error === ABORT_REASON
    )
  }

  const login = (userData) => {
    setUser({ ...userData })
    setIsLoggedIn(true)
  }

  const handleLogout = useCallback(async () => {
    try {
      const success = await logout()
      if (success) {
        setUser(null)
        setIsLoggedIn(false)
        setChecking(false)
        navigate('/', { replace: true })
      } else {
        console.error('Error en el logout.')
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      setUser(null)
      setIsLoggedIn(false)
      navigate('/')
    }
  }, [navigate])

  const checkSession = async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(ABORT_REASON), 7000)

    try {
      const response = await fetch(
        `${API_BASE.replace(/\/$/, '')}/auth/refresh-token`,
        {
          method: 'POST',
          credentials: 'include',
          signal: controller.signal,
        }
      )

      if (!response.ok) {
        setUser(null)
        setIsLoggedIn(false)
        return
      }

      const data = await response.json()
      setUser(data.user)
      setIsLoggedIn(true)
    } catch (err) {
      if (isAbortError(err)) {
        return
      }

      console.error('Error al validar sesión:', err)
      setError('No se pudo conectar con el servidor. Intenta nuevamente.')
      setUser(null)
      setIsLoggedIn(false)
    } finally {
      clearTimeout(timeoutId)
      setChecking(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(checkSession, 150)
    return () => clearTimeout(timeout)
  }, [API_BASE])

  if (error) {
    return (
      <div className="text-center text-red-500 p-10">
        {error}
        <br />
        <button
          onClick={() => {
            setChecking(true)
            setError(null)
            checkSession()
          }}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
        >
          Reintentar
        </button>
      </div>
    )
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

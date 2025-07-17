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
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 7000)

      const response = await fetch(
        `${API_BASE.replace(/\/$/, '')}/auth/refresh-token`,
        {
          method: 'POST',
          credentials: 'include',
          signal: controller.signal,
        }
      )

      clearTimeout(timeout)

      if (!response.ok) {
        setUser(null)
        setIsLoggedIn(false)
        return
      }

      const data = await response.json()
      setUser(data.user)
      setIsLoggedIn(true)
    } catch (err) {
      console.error('Error al validar sesión:', err)
      setError('No se pudo conectar con el servidor. Intenta nuevamente.')
      setUser(null)
      setIsLoggedIn(false)
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(checkSession, 150)
    return () => clearTimeout(timeout)
  }, [API_BASE])

  useEffect(() => {
    if (!checking && isLoggedIn && user) {
      navigate('/dashboard')
    }
  }, [checking, isLoggedIn, user, navigate])

  if (checking) {
    return <div>Cargando usuario...</div>
  }

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

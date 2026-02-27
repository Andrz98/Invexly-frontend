import { useEffect, useState, useCallback } from 'react'
import { logout } from '@/services/api/authController'
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

  // Normaliza la detección de cancelaciones para que los abortos esperados no rompan el flujo de autenticación.
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

  // Verifica la sesión inicial sin bloquear la UI de login si el backend falla temporalmente.
  const checkSession = async () => {
    // Crea un timeout controlado para evitar requests colgadas durante la validación de sesión.
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(ABORT_REASON), 7000)

    try {
      if (!API_BASE) {
        console.log('[AuthProvider] VITE_API_BASE no está definido, se omite checkSession.')
        setUser(null)
        setIsLoggedIn(false)
        return
      }

      const refreshUrl = `${API_BASE.replace(/\/$/, '')}/auth/refresh-token`
      console.log('[AuthProvider] Iniciando checkSession:', { refreshUrl })

      const response = await fetch(refreshUrl, {
        method: 'POST',
        credentials: 'include',
        signal: controller.signal,
      })

      console.log('[AuthProvider] checkSession status:', response.status)

      if (!response.ok) {
        console.log('[AuthProvider] Sesión no válida o no existente; se mantiene usuario deslogueado.')
        setUser(null)
        setIsLoggedIn(false)
        return
      }

      const data = await response.json()
      console.log('[AuthProvider] checkSession OK, usuario recuperado:', data?.user)
      setError(null)
      setUser(data.user)
      setIsLoggedIn(true)
    } catch (err) {
      if (isAbortError(err)) {
        console.log('[AuthProvider] checkSession abortado de forma esperada:', ABORT_REASON)
        return
      }

      console.error('[AuthProvider] Error al validar sesión:', {
        name: err?.name,
        message: err?.message,
        stack: err?.stack,
      })

      // No bloqueamos el modal de auth con una pantalla de error global: degradamos a estado deslogueado.
      setError(null)
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

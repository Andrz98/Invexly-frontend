import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { login as loginRequest, logout } from '@/services/api/authController'
import { AuthContext } from './AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '@/services/api/api'

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const API_BASE = import.meta.env.VITE_API_BASE
  const SESSION_TIMEOUT_MS = Number(import.meta.env.VITE_SESSION_TIMEOUT_MS) || 45000
  const SESSION_VALIDATION_ENDPOINT = '/auth/validate-token'

  // Detecta cancelaciones esperadas para no tratarlas como errores funcionales.
  const isAbortError = (requestError) => {
    return (
      axios.isCancel(requestError) ||
      requestError?.name === 'AbortError' ||
      requestError?.name === 'CanceledError' ||
      requestError?.code === 'ERR_CANCELED'
    )
  }

  // Convierte errores desconocidos en un formato legible para depuración consistente.
  const getReadableError = (requestError) => {
    if (!requestError) {
      return {
        name: 'UnknownError',
        message: 'Error desconocido durante la validación de sesión.',
      }
    }

    return {
      name: requestError?.name || 'UnknownError',
      message: requestError?.message || 'Sin mensaje de error disponible.',
      code: requestError?.code,
      status: requestError?.response?.status,
      responseData: requestError?.response?.data,
      stack: requestError?.stack,
    }
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
    } catch (logoutError) {
      console.error('Error al cerrar sesión:', logoutError)
      setUser(null)
      setIsLoggedIn(false)
      navigate('/')
    }
  }, [navigate])

  // Valida sesión contra backend y evita abortos manuales que generan falsos positivos de cancelación.
  const checkSession = async () => {
    try {
      if (!API_BASE) {
        console.log(
          '[AuthProvider] VITE_API_BASE no está definido, se omite checkSession.'
        )
        setUser(null)
        setIsLoggedIn(false)
        return
      }

      const response = await api.get(SESSION_VALIDATION_ENDPOINT, {
        withCredentials: true,
        timeout: SESSION_TIMEOUT_MS,
      })

      if (response.status !== 200) {
        setUser(null)
        setIsLoggedIn(false)
        return
      }

      setError(null)
      setUser(response.data.user)
      setIsLoggedIn(true)
    } catch (requestError) {
      if (isAbortError(requestError)) {
        console.log(
          '[AuthProvider] checkSession cancelado por navegación o ciclo de vida.'
        )
        return
      }

      const readableError = getReadableError(requestError)
      console.error('[AuthProvider] Error al validar sesión:', readableError)

      // Si no hubo respuesta HTTP, informamos posible bloqueo CORS/cookies para diagnóstico rápido.
      const hasNetworkOrCorsIssue =
        !requestError?.response && requestError?.code === 'ERR_NETWORK'

      setError(
        hasNetworkOrCorsIssue
          ? 'No se pudo validar la sesión por un bloqueo de red/CORS. Revisa CORS y cookies del backend.'
          : null
      )

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
      value={{
        isLoggedIn,
        checking,
        user,
        error,
        login,
        loginRequest,
        handleLogout,
        checkSession,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
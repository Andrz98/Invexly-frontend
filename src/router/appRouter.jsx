import { Navigate, createBrowserRouter } from 'react-router-dom'
import App from '../App'
import ProfilePage from '../pages/ProfilePage/ProfilePage'
import DashboardPage from '../pages/DashboardPage'
import AuthProvider from '../context/AuthContext/AuthProvider'
import { AuthContext } from '../context/AuthContext/AuthContext'
import { useContext } from 'react'

/**
 * Renderiza una pantalla de carga mientras se valida la sesión.
 * @returns {JSX.Element} Indicador visual de carga de autenticación.
 */
const AuthLoader = () => (
  <div className="flex justify-center items-center min-h-screen">
    <span className="animate-spin border-t-4 border-primary-dark h-10 w-10 rounded-full"></span>
  </div>
)

/**
 * Protege rutas privadas en función del estado de autenticación global.
 * @param {{ children: React.ReactNode }} props Contenido protegido.
 * @returns {JSX.Element} Ruta protegida o redirección al inicio.
 */
const PrivateRoute = ({ children }) => {
  const { isLoggedIn, checking } = useContext(AuthContext)

  if (checking) {
    return <AuthLoader />
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace />
  }

  return children
}

/**
 * Controla el comportamiento de la ruta raíz según el estado de sesión.
 * @returns {JSX.Element} Redirección al dashboard o vista pública de inicio.
 */
const HomeRoute = () => {
  const { isLoggedIn, checking } = useContext(AuthContext)

  if (checking) {
    return <AuthLoader />
  }

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />
  }

  return <div>Inicio</div>
}

/**
 * Agrupa proveedores globales que deben envolver todas las rutas.
 * @returns {JSX.Element} Árbol de aplicación con contexto de autenticación.
 */
const AppProviders = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
)

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppProviders />,
    children: [
      {
        index: true,
        element: <HomeRoute />,
      },
      {
        path: 'profile',
        element: (
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        ),
      },
      {
        path: '*',
        element: (
          <div className="text-center mt-10 text-lg font-medium">
            Página no encontrada
          </div>
        ),
      },
    ],
  },
])

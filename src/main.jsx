import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { appRouter } from './router/appRouter'

try {
  const root = createRoot(document.getElementById('root'))
  root.render(
    <StrictMode>
      <RouterProvider router={appRouter} />
    </StrictMode>
  )
} catch (error) {
  console.error('Error al iniciar la aplicación:', error)
}

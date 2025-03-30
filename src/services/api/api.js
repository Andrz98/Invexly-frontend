import axios from 'axios'

// En esta rama mantenemos la URL del entorno de desarrollo puesto que la ruta del entorno de producción supone una interferencia en el login del usuario y este no puede hacer un correcto logout, Si en el entonorno de producción se genera el mismo fallo, entonces se debe actuar sobre el componente authController (logout) y ver exactamente que puede generar el fallo en producción.
const BASE_URL = import.meta.env.API_BASE

const api = axios.create({
  baseURL: BASE_URL, // Utilizamos
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export default api

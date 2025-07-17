import axios from 'axios'

const cloudinaryApi = axios.create({
  baseURL: 'https://api.cloudinary.com/v1_1/dxdvc7uoe/image/',
  timeout: 30000,
  headers: {}, // sin Content-Type global (axios lo infiere con FormData)
})

export default cloudinaryApi

import axios from 'axios'

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://195.133.39.254'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api

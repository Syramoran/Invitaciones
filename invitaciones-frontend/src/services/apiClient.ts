import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { env } from '@/config/env'

// Clave donde guardamos el JWT en localStorage
export const JWT_KEY = 'inv_token'

const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15s — suficiente para uploads lentos
})

/* ── REQUEST INTERCEPTOR ──────────────────────
   Agrega el JWT a cada request si existe        */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(JWT_KEY)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/* ── RESPONSE INTERCEPTOR ─────────────────────
   401 → limpia JWT y redirige a /admin/login     */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(JWT_KEY)
      // Solo redirige si estamos en una ruta /admin
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
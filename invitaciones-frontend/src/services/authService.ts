import apiClient, { JWT_KEY } from './apiClient'

interface LoginPayload {
  username: string
  password: string
}

interface LoginResponse {
  access_token: string
  user: { id: number; username: string; email: string; role: string }
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', payload)
    localStorage.setItem(JWT_KEY, data.access_token)
    return data
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      localStorage.removeItem(JWT_KEY)
    }
  },

  async me() {
    const { data } = await apiClient.get('/auth/me')
    return data
  },

  getToken(): string | null {
    return localStorage.getItem(JWT_KEY)
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(JWT_KEY)
  },
}
import apiClient, { JWT_KEY } from './apiClient'

// ─── Tipos ───────────────────────────────────────────────

interface LoginPayload {
  username: string
  password: string
}

interface LoginResponse {
  access_token: string
  user: { id: number; username: string; email: string; role: string }
}

interface RegisterPayload {
  username: string
  email: string
  password: string
}

interface RegisterResponse {
  userId: number
  email: string
}

// ─── Servicio ─────────────────────────────────────────────

export const authService = {
  // ── Login ──────────────────────────────────────────────
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', payload)
    localStorage.setItem(JWT_KEY, data.access_token)
    return data
  },

  // ── Register ───────────────────────────────────────────
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const { data } = await apiClient.post<RegisterResponse>('/auth/register', payload)
    return data
  },

  // ── Verificar email con OTP ────────────────────────────
  async verifyEmail(userId: number, codigo: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/verify-email', {
      userId,
      codigo,
    })
    localStorage.setItem(JWT_KEY, data.access_token)
    return data
  },

  // ── Reenviar código OTP ────────────────────────────────
  async resendVerification(userId: number): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      '/auth/resend-verification',
      { userId },
    )
    return data
  },

  // ── Logout ─────────────────────────────────────────────
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      localStorage.removeItem(JWT_KEY)
    }
  },

  // ── Perfil actual ──────────────────────────────────────
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

  // ── Forgot password ────────────────────────────────────
  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      '/auth/forgot-password',
      { email },
    )
    return data
  },

  // ── Verify reset token ─────────────────────────────────
  async verifyResetToken(token: string): Promise<{ isValid: boolean; message: string }> {
    const { data } = await apiClient.get<{ isValid: boolean; message: string }>(
      `/auth/verify-reset-token/${token}`,
    )
    return data
  },

  // ── Reset password ─────────────────────────────────────
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      '/auth/reset-password',
      { token, password },
    )
    return data
  },
}
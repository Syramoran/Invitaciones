import { useState, useEffect, type ReactNode } from 'react'
import { authService } from '@/services/authService'
import { AuthContext, type User } from '@/context/authContextInstance'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Al montar: verificar si ya hay sesión activa
  useEffect(() => {
    const checkSession = async () => {
      if (!authService.isAuthenticated()) {
        setIsLoading(false)
        return
      }
      try {
        const userData = await authService.me()
        setUser(userData)
      } catch {
        // Token inválido o expirado — el interceptor ya limpió el localStorage
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    checkSession()
  }, [])

  const login = async (username: string, password: string) => {
    const data = await authService.login({ username, password })
    setUser(data.user)
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  const register = async (username: string, email: string, password: string, nombreCompleto?: string) => {
    await authService.register({ username, email, password, nombreCompleto })
    // We don't automatically log in yet, waiting for verification
  }

  const verifyEmail = async (token: string) => {
    await authService.verifyEmail(token)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout, register, verifyEmail }}>
      {children}
    </AuthContext.Provider>
  )
}

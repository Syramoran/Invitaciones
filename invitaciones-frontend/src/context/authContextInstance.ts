import { createContext } from 'react'

export interface User {
  id: number
  username: string
  email: string
  role: string
}

export interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login(username: string, password: string): Promise<void>
  logout(): Promise<void>
  register(username: string, email: string, password: string, name?: string): Promise<void>
  verifyEmail(token: string): Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

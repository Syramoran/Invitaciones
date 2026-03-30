import { useContext } from 'react'
import { AuthContext } from '@/context/authContextInstance'

// Hook — usarlo en cualquier componente: const { user, login } = useAuth()
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}

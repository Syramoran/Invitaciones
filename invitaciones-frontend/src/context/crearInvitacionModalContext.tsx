import { createContext, useContext, useState, ReactNode } from 'react'
import { CrearInvitacionModal } from '../components/landing/CrearInvitacionModal'

interface CrearInvitacionModalContextType {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

const CrearInvitacionModalContext = createContext<CrearInvitacionModalContextType | undefined>(
  undefined
)

export function CrearInvitacionModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return (
    <CrearInvitacionModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
      <CrearInvitacionModal isOpen={isOpen} onClose={closeModal} />
    </CrearInvitacionModalContext.Provider>
  )
}

export function useCrearInvitacionModal() {
  const context = useContext(CrearInvitacionModalContext)
  if (!context) {
    throw new Error('useCrearInvitacionModal must be used within CrearInvitacionModalProvider')
  }
  return context
}

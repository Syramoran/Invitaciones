import { useLocation } from 'react-router-dom'
import { Menu, Bell, Search } from 'lucide-react'
import { useAuth } from '@/context/useAuth'

const TITLES: Record<string, string> = {
  '/admin/dashboard':           'Dashboard',
  '/admin/pedidos':             'Pedidos',
  '/admin/invitaciones':        'Invitaciones',
  '/admin/invitaciones/crear':  'Crear Invitación',
  '/admin/servicios':           'Servicios',
  '/admin/templates':           'Templates',
  '/admin/reportes':            'Reportes',
}

interface Props {
  onMenuClick: () => void
}

export function AdminTopbar({ onMenuClick }: Props) {
  const { pathname } = useLocation()
  const { user }     = useAuth()

  // Detectar editar invitación (:id)
  const isEditar = /^\/admin\/invitaciones\/\w+$/.test(pathname) && pathname !== '/admin/invitaciones/crear'
  const title = isEditar ? 'Editar Invitación' : (TITLES[pathname] ?? 'Admin')

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'A'

  return (
    <header className="bg-white border-b border-black/[.06] px-7 flex items-center gap-4 min-h-[60px]">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-[#6b7280] hover:text-[#2d2926] p-1 transition-colors"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Title */}
      <span className="text-[1.1rem] font-semibold flex-1">{title}</span>

      {/* Search */}
      <div className="relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
        <input
          type="search"
          placeholder="Buscar..."
          className="pl-9 pr-4 py-2 border-[1.5px] border-[#d1d5db] rounded-full text-[.82rem] w-[220px] outline-none transition-all focus:border-[#c5a572] focus:w-[280px]"
        />
      </div>

      {/* Bell */}
      <button className="relative p-1.5 text-[#6b7280] hover:text-[#2d2926] transition-colors" aria-label="Notificaciones">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-[#dc2626] rounded-full border-2 border-white" />
      </button>

      {/* User */}
      <div className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg hover:bg-[#f4f5f7] transition-colors">
        <div className="w-8 h-8 rounded-full bg-[#c5a572] text-white flex items-center justify-center text-[.75rem] font-semibold shrink-0">
          {initials}
        </div>
        <span className="text-[.85rem] font-medium hidden sm:block">{user?.username ?? 'Admin'}</span>
      </div>
    </header>
  )
}

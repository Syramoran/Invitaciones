import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, Mail, PlusCircle,
  Settings, Layers, BarChart2, LogOut, X,
} from 'lucide-react'
import { useAuth } from '@/context/useAuth'

interface Props {
  open: boolean
  onClose: () => void
  pendingCount?: number
}

const NAV_ITEMS = [
  { label: 'Dashboard',    path: '/admin/dashboard',            icon: LayoutDashboard },
  { label: 'Pedidos',      path: '/admin/pedidos',              icon: ClipboardList,   badge: true },
  { label: 'Invitaciones', path: '/admin/invitaciones',         icon: Mail },
]

const NAV_BOTTOM = [
  { label: 'Servicios',   path: '/admin/servicios',  icon: Settings },
  { label: 'Templates',   path: '/admin/templates',  icon: Layers },
  { label: 'Reportes',    path: '/admin/reportes',   icon: BarChart2 },
]

export function AdminSidebar({ open, onClose, pendingCount = 0 }: Props) {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  const base = 'flex items-center gap-3 px-3.5 py-[11px] rounded-lg text-[.88rem] font-normal cursor-pointer transition-all relative mb-0.5'
  const inactive = 'text-[#a0a8ba] hover:bg-[#252b3d] hover:text-[#d0d5e0]'

  function itemClass({ isActive }: { isActive: boolean }) {
    if (isActive) return `${base} bg-[#2e3650] text-white font-medium sidebar-active-item`
    return `${base} ${inactive}`
  }

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-60 min-w-[240px]
          flex flex-col h-screen overflow-y-auto
          bg-[#1a1f2e] text-[#c8cdd8] transition-transform duration-250
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/[.06]">
          <span className="font-display text-[1.4rem] font-semibold text-white">
            festejá<span className="text-[#c5a572] italic">.</span>
          </span>
          <button onClick={onClose} className="lg:hidden text-[#a0a8ba] hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3">
          {NAV_ITEMS.map(({ label, path, icon: Icon, badge }) => (
            <NavLink key={path} to={path} className={itemClass} onClick={onClose}>
              <Icon className="w-5 h-5 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && pendingCount > 0 && (
                <span className="bg-[#c5a572] text-white text-[.65rem] font-semibold px-2 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}

          {/* Crear Invitación — highlight */}
          <NavLink
            to="/admin/invitaciones/crear"
            className={({ isActive }) =>
              `${base} border mt-1 ${isActive
                ? 'bg-[rgba(197,165,114,.25)] text-[#c5a572] border-[rgba(197,165,114,.35)]'
                : 'bg-[linear-gradient(135deg,rgba(197,165,114,.15),rgba(197,165,114,.05))] text-[#c5a572] border-[rgba(197,165,114,.2)] hover:bg-[linear-gradient(135deg,rgba(197,165,114,.25),rgba(197,165,114,.1))]'
              }`
            }
            onClick={onClose}
          >
            <PlusCircle className="w-5 h-5 shrink-0" />
            <span>Crear Invitación</span>
          </NavLink>

          {/* Separator */}
          <div className="h-px bg-white/[.06] my-3 mx-1" />

          {NAV_BOTTOM.map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} className={itemClass} onClick={onClose}>
              <Icon className="w-5 h-5 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}

          {/* Separator */}
          <div className="h-px bg-white/[.06] my-3 mx-1" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`${base} w-full text-left text-[#f87171] hover:bg-[rgba(248,113,113,.1)]`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Cerrar Sesión</span>
          </button>
        </nav>
      </aside>

      {/* Gold left bar on active item via CSS */}
      <style>{`
        .sidebar-active-item::before {
          content: '';
          position: absolute;
          left: 0; top: 8px; bottom: 8px;
          width: 3px;
          border-radius: 0 3px 3px 0;
          background: #c5a572;
        }
      `}</style>
    </>
  )
}

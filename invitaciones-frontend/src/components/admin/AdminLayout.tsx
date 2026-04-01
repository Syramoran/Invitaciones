import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopbar } from './AdminTopbar'

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f5f7]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <AdminTopbar onMenuClick={() => setSidebarOpen(v => !v)} />
        <main className="flex-1 overflow-y-auto p-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/authContext'
import { useAuth } from '@/context/useAuth'
import { Suspense, lazy } from 'react'

// Lazy loading — cada chunk se carga solo cuando se navega a esa ruta
const LandingPage          = lazy(() => import('@/pages/public/LandingPage'))
const SolicitarPage        = lazy(() => import('@/pages/public/SolicitarPage'))
const InvitacionPage       = lazy(() => import('@/pages/public/InvitacionPage'))
const GaleriaPage          = lazy(() => import('@/pages/public/GaleriaPage'))
const AsistentesPage       = lazy(() => import('@/pages/public/AsistentesPage'))
const PedidoEnviadoPage    = lazy(() => import('@/pages/public/PedidoEnviadoPage'))
const EmprendePage         = lazy(() => import('@/pages/public/EmprendePage'))
const TemplatesShowcasePage= lazy(() => import('@/pages/public/TemplatesShowcasePage'))
const TerminosServicio     = lazy(() => import('@/pages/legal/TerminosServicio'))
const PoliticaPrivacidad   = lazy(() => import('@/pages/legal/PoliticaPrivacidad'))
const AvisoCookies         = lazy(() => import('@/pages/legal/AvisoCookies'))
const Disclaimer           = lazy(() => import('@/pages/legal/Disclaimer'))
const NotFoundPage         = lazy(() => import('@/pages/public/NotFoundPage'))
const AdminLayout          = lazy(() => import('@/components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })))
const LoginPage            = lazy(() => import('@/pages/admin/LoginPage'))
const DashboardPage        = lazy(() => import('@/pages/admin/DashboardPage'))
const PedidosPage          = lazy(() => import('@/pages/admin/PedidosPage'))
const InvitacionesPage     = lazy(() => import('@/pages/admin/InvitacionesPage'))
const CrearInvitacionPage  = lazy(() => import('@/pages/admin/CrearInvitacionPage'))
const EditarInvitacionPage = lazy(() => import('@/pages/admin/EditarInvitacionPage'))
const ServiciosPage        = lazy(() => import('@/pages/admin/ServiciosPage'))
const TemplatesPage        = lazy(() => import('@/pages/admin/TemplatesPage'))
const ReportesPage         = lazy(() => import('@/pages/admin/ReportesPage'))

// Client pages
const ClientLoginPage      = lazy(() => import('@/pages/client/ClientLoginPage'))
const ClientRegisterPage   = lazy(() => import('@/pages/client/ClientRegisterPage'))
const ClientVerifyEmailPage= lazy(() => import('@/pages/client/ClientVerifyEmailPage'))
const ClientPanelPage      = lazy(() => import('@/pages/client/ClientPanelPage'))

/* Guard de rutas privadas */
function PrivateRoute({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <div className="page-loading">Cargando...</div>
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />
}

const PageLoader = () => <div className="page-loading"></div>

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* ── PÚBLICAS ── */}
            <Route path="/"                        element={<LandingPage />} />
            <Route path="/crear"                   element={<SolicitarPage />} />
            <Route path="/pedido-enviado"          element={<PedidoEnviadoPage />} />
            <Route path="/emprende"                element={<EmprendePage />} />
            <Route path="/templates"               element={<TemplatesShowcasePage />} />
            <Route path="/:eventoId"               element={<InvitacionPage />} />
            <Route path="/:eventoId/galeria"       element={<GaleriaPage />} />
            <Route path="/:eventoId/asistentes"   element={<AsistentesPage />} />

            {/* ── LEGALES ── */}
            <Route path="/terminos"               element={<TerminosServicio />} />
            <Route path="/privacidad"             element={<PoliticaPrivacidad />} />
            <Route path="/cookies"               element={<AvisoCookies />} />
            <Route path="/disclaimer"            element={<Disclaimer />} />

            {/* ── CLIENTE ── */}
            <Route path="/client/login"            element={<ClientLoginPage />} />
            <Route path="/client/register"         element={<ClientRegisterPage />} />
            <Route path="/client/verify-email"     element={<ClientVerifyEmailPage />} />
            <Route path="/client/panel"            element={<PrivateRoute><ClientPanelPage /></PrivateRoute>} />

            {/* ── ADMIN ── */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"              element={<DashboardPage />} />
              <Route path="pedidos"                element={<PedidosPage />} />
              <Route path="invitaciones"           element={<InvitacionesPage />} />
              <Route path="invitaciones/crear"     element={<CrearInvitacionPage />} />
              <Route path="invitaciones/:id"       element={<EditarInvitacionPage />} />
              <Route path="servicios"              element={<ServiciosPage />} />
              <Route path="templates"              element={<TemplatesPage />} />
              <Route path="reportes"               element={<ReportesPage />} />
            </Route>

            {/* ── 404 ── */}
            <Route path="*"                        element={<NotFoundPage />} />

          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
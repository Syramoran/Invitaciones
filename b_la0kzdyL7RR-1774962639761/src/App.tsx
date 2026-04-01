import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'

// Lazy loading for code splitting
const LandingPage = lazy(() => import('@/pages/public/LandingPage'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-cream">
    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Placeholder routes - you can add more pages later */}
          <Route path="/crear" element={<PlaceholderPage title="Crear Invitacion" />} />
          <Route path="/terminos" element={<PlaceholderPage title="Terminos de Servicio" />} />
          <Route path="/privacidad" element={<PlaceholderPage title="Politica de Privacidad" />} />
          <Route path="/cookies" element={<PlaceholderPage title="Aviso de Cookies" />} />
          
          {/* 404 */}
          <Route path="*" element={<PlaceholderPage title="Pagina no encontrada" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold text-charcoal mb-4">{title}</h1>
        <p className="text-warm-gray">Esta pagina esta en construccion</p>
        <a href="/" className="inline-block mt-6 text-rose-deep hover:text-charcoal transition-colors">
          ← Volver al inicio
        </a>
      </div>
    </div>
  )
}

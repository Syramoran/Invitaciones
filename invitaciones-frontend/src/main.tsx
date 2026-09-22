import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Registrar Service Worker para soporte offline y caché de invitaciones.
// Solo en producción: en dev interfiere con los módulos/HMR que sirve Vite.
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => console.warn('[SW] Registro fallido:', err))
    })
  } else {
    // Saca cualquier SW que haya quedado registrado de antes (cuando se
    // registraba también en dev), para que no siga sirviendo cachés viejas.
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister())
    })
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

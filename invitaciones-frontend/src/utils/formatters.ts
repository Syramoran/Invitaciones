// Fecha → DD/MM/YYYY (formato SRS NFR-5.3)
export function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00') // evita desfase de timezone
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Fecha larga → "Sábado 14 de junio de 2025"
export function formatDateLong(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Precio → "$12.500" (ARS sin decimales)
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Hora → "20:30 hs"
export function formatTime(time: string): string {
  return time.slice(0, 5) + ' hs'
}

// Tamaño de archivo → "2.3 MB"
export function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`
}
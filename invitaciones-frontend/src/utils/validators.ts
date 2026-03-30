// Replica las reglas del backend (validación en capas — SRS)

export const validators = {
  nombre(v: string): string | null {
    if (!v.trim()) return 'El nombre es requerido'
    if (v.trim().length > 200) return 'Máximo 200 caracteres'
    return null
  },

  email(v: string): string | null {
    if (!v) return 'El email es requerido'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Email inválido'
    if (v.length > 255) return 'Máximo 255 caracteres'
    return null
  },

  telefono(v: string): string | null {
    if (!v) return 'El teléfono es requerido'
    if (!/^[\d\s+\-()?]+$/.test(v)) return 'Solo números y caracteres de teléfono'
    if (v.length > 30) return 'Máximo 30 caracteres'
    return null
  },

  // Validación MIME para imágenes — antes de subir
  imageFile(file: File): string | null {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) return 'Solo JPG, PNG o WebP'
    if (file.size > 15 * 1024 * 1024) return 'Máximo 15 MB por foto'
    return null
  },

  // Validación MIME para MP3 — antes de subir
  audioFile(file: File): string | null {
    const allowed = ['audio/mpeg', 'audio/mp3']
    if (!allowed.includes(file.type)) return 'Solo archivos MP3'
    if (file.size > 20 * 1024 * 1024) return 'Máximo 20 MB'
    return null
  },
}
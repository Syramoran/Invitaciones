import type { WizardFormState } from '@/types/crearInvitacion'

export interface ValidationError {
  step: number
  stepLabel: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export function validateWizardPayload(formState: WizardFormState): ValidationResult {
  const errors: ValidationError[] = []
  const { step1, step2 } = formState

  // ── Step 1: Diseño ────────────────────────────────────────────────────────────
  if (!step1.tipoEventoId) {
    errors.push({ step: 1, stepLabel: 'Diseño', message: 'Seleccioná el tipo de evento.' })
  }
  if (!step1.templateId) {
    errors.push({ step: 1, stepLabel: 'Diseño', message: 'Seleccioná un diseño de invitación.' })
  }
  if (!step1.titulo.trim()) {
    errors.push({ step: 1, stepLabel: 'Diseño', message: 'Ingresá el título de la invitación.' })
  }

  // ── Step 2: Evento ────────────────────────────────────────────────────────────
  if (!step2.fechaEvento) {
    errors.push({ step: 2, stepLabel: 'Evento', message: 'Seleccioná la fecha del evento.' })
  }
  if (!step2.horaEvento) {
    errors.push({ step: 2, stepLabel: 'Evento', message: 'Ingresá la hora del evento.' })
  }

  if (step2.ubicacion === 'multiple') {
    if (step2.ubicaciones.length === 0) {
      errors.push({ step: 2, stepLabel: 'Evento', message: 'Agregá al menos un lugar para el evento.' })
    } else if (step2.ubicaciones.some(u => !u.nombre.trim() || !u.direccion.trim())) {
      errors.push({ step: 2, stepLabel: 'Evento', message: 'Completá el nombre y dirección de todos los lugares.' })
    }
  } else {
    if (!step2.ubicacion.trim()) {
      errors.push({ step: 2, stepLabel: 'Evento', message: 'Ingresá el lugar del evento.' })
    }
    if (!step2.direccion.trim()) {
      errors.push({ step: 2, stepLabel: 'Evento', message: 'Ingresá la dirección del evento.' })
    }
  }

  // Campos específicos requeridos por tipo de evento
  if (step1.tipoEventoId === 1) {
    if (!step2.camposEspecificos.novio1?.trim()) {
      errors.push({ step: 2, stepLabel: 'Evento', message: 'Ingresá el nombre del/la novio/a (campo 1).' })
    }
    if (!step2.camposEspecificos.novio2?.trim()) {
      errors.push({ step: 2, stepLabel: 'Evento', message: 'Ingresá el nombre del/la novio/a (campo 2).' })
    }
  } else if (step1.tipoEventoId === 2 || step1.tipoEventoId === 3) {
    if (!step2.camposEspecificos.nombre?.trim()) {
      errors.push({ step: 2, stepLabel: 'Evento', message: 'Ingresá el nombre del/la festejado/a.' })
    }
  }

  return { isValid: errors.length === 0, errors }
}

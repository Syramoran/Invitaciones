import { useEffect, useRef, useCallback } from 'react'
import type { WizardFormState, WizardStep4 } from '@/types/crearInvitacion'

// Step4 without File objects — safe to JSON.stringify
type SerializableHistoria = Omit<WizardStep4['historias'][number], 'imagen' | 'imagenPreview'> & {
  imagen: null
  imagenPreview: null
}

type SerializableStep4 = Omit<WizardStep4, 'fotos' | 'fotosPreviews' | 'musica' | 'historias'> & {
  fotos: never[]
  fotosPreviews: never[]
  musica: null
  historias: SerializableHistoria[]
}

export type SerializableWizardState = Omit<WizardFormState, 'step4'> & {
  step4: SerializableStep4
}

function storageKey(userId: number): string {
  return `inv_wizard_draft_${userId}`
}

function stripFiles(formState: WizardFormState): SerializableWizardState {
  return {
    ...formState,
    step4: {
      ...formState.step4,
      fotos: [],
      fotosPreviews: [],
      musica: null,
      historias: formState.step4.historias.map(h => ({
        ...h,
        imagen: null,
        imagenPreview: null,
      })),
    },
  }
}

/** Read the persisted draft for the given user. Returns null if nothing saved. */
export function loadSavedDraft(userId: number): SerializableWizardState | null {
  if (!userId) return null
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return null
    return JSON.parse(raw) as SerializableWizardState
  } catch {
    return null
  }
}

/**
 * Auto-saves formState to localStorage (debounced 500ms).
 * Does NOT save when `paused` is true (e.g. while the resume-modal is open or
 * while loading, so we never overwrite a saved draft with an empty state).
 */
export function useWizardPersistence(
  userId: number,
  formState: WizardFormState,
  paused: boolean,
): { clearSavedDraft: () => void } {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!userId || paused) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey(userId), JSON.stringify(stripFiles(formState)))
      } catch {
        // quota exceeded or disabled
      }
    }, 500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [formState, userId, paused])

  const clearSavedDraft = useCallback(() => {
    if (!userId) return
    localStorage.removeItem(storageKey(userId))
  }, [userId])

  return { clearSavedDraft }
}

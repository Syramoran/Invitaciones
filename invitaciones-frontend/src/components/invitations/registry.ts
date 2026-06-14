import { lazy } from 'react'
import type { ComponentType } from 'react'
import type { InvitacionPublica } from '@/types/invitation'

export interface InvitationViewProps {
  invitacion: InvitacionPublica
  invitadoParam?: string
  previewMode?: boolean
}

// Vite discovers all invitation-view.tsx files at build time.
// Each subfolder name corresponds to a template slug in the DB.
// Convention: /src/components/invitations/[slug]/invitation-view.tsx
const modules = import.meta.glob<{ InvitationView: ComponentType<InvitationViewProps> }>(
  './**/invitation-view.tsx',
)

/** All slugs with a local component (build-time list, used in admin create form) */
export const registeredSlugs: string[] = Object.keys(modules).map(
  p => p.replace(/^\.\//, '').replace(/\/invitation-view\.tsx$/, ''),
)

/**
 * Returns a lazy-loaded React component for the given slug.
 * Returns null if no component folder is registered for that slug.
 */
export function getInvitationComponent(slug: string) {
  const path = `./${slug}/invitation-view.tsx`
  const loader = modules[path]
  if (!loader) return null
  return lazy(async () => {
    const mod = await loader()
    return { default: mod.InvitationView }
  })
}

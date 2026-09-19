import { useRef } from 'react'
import type { GuestEntry } from '@/types/crearInvitacion'

interface Props {
  guests: GuestEntry[]
  onChange: (guests: GuestEntry[]) => void
  bulkFile: File | null
  onBulkFileChange: (file: File | null) => void
  variant?: 'admin' | 'client'
}

const ACCEPTED_EXTENSIONS = ['.xlsx', '.csv']

export function GuestListEditor({ guests, onChange, bulkFile, onBulkFileChange, variant = 'client' }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isAdmin = variant === 'admin'
  const inputBase = isAdmin
    ? 'px-3 py-2 border-[1.5px] border-[#d1d5db] rounded-lg text-[.85rem] focus:border-[#c5a572] focus:outline-none transition-colors'
    : 'px-3 py-2.5 border-[1.5px] border-[#d1d5db] rounded-xl text-[.9rem] focus:border-[#c5a572] focus:outline-none transition-colors'

  function updateGuest(index: number, field: keyof GuestEntry, value: string) {
    const next = guests.map((g, i) => (i === index ? { ...g, [field]: value } : g))
    onChange(next)
  }

  function removeGuest(index: number) {
    onChange(guests.filter((_, i) => i !== index))
  }

  function addGuest() {
    onChange([...guests, { nombre: '', apellido: '' }])
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    onBulkFileChange(file)
  }

  function clearFile() {
    onBulkFileChange(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validCount = guests.filter(g => g.nombre.trim() && g.apellido.trim()).length

  return (
    <div>
      {/* Carga masiva por archivo */}
      <div className="mb-5 p-3 bg-[#fdf8f0] border border-[#e8d9b5] rounded-lg">
        <div className="flex items-center justify-between gap-2 mb-2">
          <label className={isAdmin
            ? 'text-[.75rem] font-semibold uppercase tracking-wide text-[#6b7280]'
            : 'text-[.8rem] font-medium text-[#2d2926]'}>
            Carga masiva por archivo
          </label>
          <a
            href="/plantilla-invitados.csv"
            download
            className="text-[.78rem] font-medium text-[#c5a572] hover:text-[#a88a5d] transition-colors"
          >
            ⬇ Descargar plantilla
          </a>
        </div>
        <p className="text-[.78rem] text-[#6b7280] mb-2">
          Subí un archivo .xlsx o .csv con columnas <code className="px-1 py-0.5 bg-white border border-[#e5e7eb] rounded text-[.75rem]">Nombre, Apellido, Grupo, PuedePlusOne, MaxIntegrantesGrupo</code>. Individuales y grupos en el mismo archivo.
        </p>
        {bulkFile ? (
          <div className="flex items-center justify-between gap-2 bg-white border-[1.5px] border-[#d1d5db] rounded-lg px-3 py-2">
            <span className="text-[.82rem] text-[#2d2926] truncate">📄 {bulkFile.name}</span>
            <button
              type="button"
              onClick={clearFile}
              className="text-[.78rem] font-medium text-[#dc2626] hover:underline shrink-0"
            >
              Quitar
            </button>
          </div>
        ) : (
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(',')}
            onChange={handleFileSelect}
            className="block w-full text-[.82rem] text-[#6b7280] file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-[#2d2926] file:text-white file:text-[.8rem] file:font-medium hover:file:bg-[#4a4441] file:cursor-pointer cursor-pointer"
          />
        )}
      </div>

      <label className={isAdmin
        ? 'block mb-3 text-[.75rem] font-semibold uppercase tracking-wide text-[#6b7280]'
        : 'block mb-3 text-[.8rem] font-medium text-[#2d2926]'}>
        O cargá invitados uno por uno
      </label>

      {guests.length === 0 ? (
        <div className="border-[1.5px] border-dashed border-[#d1d5db] rounded-lg px-4 py-6 text-center text-[.82rem] text-[#6b7280]">
          Todavía no agregaste invitados. Hacé clic en <strong>+ Agregar invitado</strong> o subí un archivo arriba.
        </div>
      ) : (
        <div className="space-y-2">
          {guests.map((g, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[.75rem] text-[#9ca3af] w-6 text-right tabular-nums">{i + 1}.</span>
              <input
                type="text"
                value={g.nombre}
                onChange={e => updateGuest(i, 'nombre', e.target.value)}
                placeholder="Nombre"
                className={`${inputBase} flex-1`}
              />
              <input
                type="text"
                value={g.apellido}
                onChange={e => updateGuest(i, 'apellido', e.target.value)}
                placeholder="Apellido"
                className={`${inputBase} flex-1`}
              />
              <button
                type="button"
                onClick={() => removeGuest(i)}
                aria-label={`Eliminar invitado ${i + 1}`}
                className="w-9 h-9 flex items-center justify-center rounded-lg border-[1.5px] border-[#e5e7eb] text-[#6b7280] hover:border-[#dc2626] hover:text-[#dc2626] transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addGuest}
        className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 border-[1.5px] border-dashed border-[#c5a572] text-[#a88a5d] rounded-lg text-[.85rem] font-medium hover:bg-[#fdf8f0] transition-colors"
      >
        <span className="text-base leading-none">+</span> Agregar invitado
      </button>

      {validCount > 0 && (
        <p className="mt-3 text-[.8rem] text-[#16a34a] font-medium">
          ✓ {validCount} invitado{validCount !== 1 ? 's' : ''} listo{validCount !== 1 ? 's' : ''} para recibir URL personalizada
        </p>
      )}
    </div>
  )
}

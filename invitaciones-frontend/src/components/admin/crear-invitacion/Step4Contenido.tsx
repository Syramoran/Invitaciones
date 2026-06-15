import { useRef } from 'react'
import { X, Music, ImagePlus, PlusCircle, Trash2 } from 'lucide-react'
import type { WizardStep4, WizardStep3, HistoriaSeccion } from '@/types/crearInvitacion'
import { FieldTooltip } from './FieldTooltip'

interface Props {
  state: WizardStep4
  onChange: (updates: Partial<WizardStep4>) => void
  servicios: WizardStep3['servicios']
  onNext: () => void
  onPrev: () => void
}

function normalize(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function hasService(servicios: WizardStep3['servicios'], name: string) {
  return servicios.some(s => s.enabled && normalize(s.nombre).includes(normalize(name)))
}

// ─── Fotos del anfitrión ───────────────────────────────────────────────────────

function FotosSection({
  fotos, fotosPreviews, existingFotos, removedFotoIds, onChange,
}: Pick<WizardStep4, 'fotos' | 'fotosPreviews' | 'existingFotos' | 'removedFotoIds'> & { onChange: Props['onChange'] }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const activeExisting = existingFotos.filter(f => !removedFotoIds.includes(f.id))
  const totalCount = activeExisting.length + fotos.length
  const canAdd = totalCount < 5

  function handleFiles(files: FileList | null) {
    if (!files) return
    const newFiles = Array.from(files).slice(0, 5 - totalCount)
    const newPreviews = newFiles.map(f => URL.createObjectURL(f))
    onChange({ fotos: [...fotos, ...newFiles], fotosPreviews: [...fotosPreviews, ...newPreviews] })
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    handleFiles(e.dataTransfer.files)
  }

  function removeNewPhoto(idx: number) {
    URL.revokeObjectURL(fotosPreviews[idx])
    onChange({
      fotos: fotos.filter((_, i) => i !== idx),
      fotosPreviews: fotosPreviews.filter((_, i) => i !== idx),
    })
  }

  function removeExistingFoto(id: number) {
    onChange({ removedFotoIds: [...removedFotoIds, id] })
  }

  function undoRemoveExistingFoto(id: number) {
    onChange({ removedFotoIds: removedFotoIds.filter(x => x !== id) })
  }

  return (
    <div className="bg-white border border-[#f0f0f0] rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-semibold text-[.9rem]">📷 Fotos del Anfitrión</h3>
        <span className="text-[.63rem] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide bg-red-50 text-[#dc2626]">
          Obligatorio
        </span>
        <FieldTooltip text="Al menos una foto del anfitrión es necesaria. La primera foto se usa como imagen principal de la invitación" />
      </div>

      {/* Existing (server) fotos */}
      {existingFotos.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {existingFotos.map((foto, i) => {
            const removed = removedFotoIds.includes(foto.id)
            return (
              <div key={foto.id} className={['relative w-20 h-20 rounded-lg overflow-hidden bg-[#f4f5f7] shrink-0', removed ? 'opacity-40' : ''].join(' ')}>
                <img src={foto.url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                {i === 0 && !removed && (
                  <span className="absolute bottom-0 left-0 right-0 text-[.6rem] text-center bg-black/50 text-white py-0.5">Header</span>
                )}
                {removed ? (
                  <button type="button" onClick={() => undoRemoveExistingFoto(foto.id)}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-[.6rem] font-medium">
                    Deshacer
                  </button>
                ) : (
                  <button type="button" onClick={() => removeExistingFoto(foto.id)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-[#dc2626] text-white flex items-center justify-center hover:bg-[#b91c1c]">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {canAdd && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center w-full py-6 border-2 border-dashed border-[#d1d5db] rounded-lg hover:border-[#c5a572] hover:bg-[rgba(197,165,114,.03)] transition-colors text-[#6b7280] mb-3"
        >
          <ImagePlus className="w-6 h-6 mb-1.5" />
          <span className="text-[.82rem]">Arrastrá fotos acá o hacé click para subir</span>
          <span className="text-[.7rem] text-[#9ca3af] mt-0.5">JPG, PNG, WebP · Máx. 5 MB c/u · {5 - totalCount} restante{5 - totalCount !== 1 ? 's' : ''}</span>
        </button>
      )}

      <input
        ref={inputRef} type="file" accept="image/*" multiple hidden
        onChange={e => handleFiles(e.target.files)}
      />

      {fotosPreviews.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {fotosPreviews.map((src, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#f4f5f7] shrink-0">
              <img src={src} alt={`Nueva ${i + 1}`} className="w-full h-full object-cover" />
              <span className="absolute top-0 left-0 bg-[#c5a572] text-white text-[.55rem] px-1 py-0.5">Nueva</span>
              <button
                type="button" onClick={() => removeNewPhoto(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-[#dc2626] text-white flex items-center justify-center hover:bg-[#b91c1c]"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Música ───────────────────────────────────────────────────────────────────

function MusicaSection({
  musica, musicaNombre, existingMusica, removeMusica, onChange,
}: Pick<WizardStep4, 'musica' | 'musicaNombre' | 'existingMusica' | 'removeMusica'> & { onChange: Props['onChange'] }) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(files: FileList | null) {
    if (!files?.[0]) return
    onChange({ musica: files[0], musicaNombre: files[0].name, removeMusica: false })
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    handleFile(e.dataTransfer.files)
  }

  return (
    <div className="bg-white border border-[#f0f0f0] rounded-xl p-4 mb-4">
      <h3 className="font-semibold text-[.9rem] mb-1">🎵 Música</h3>
      <p className="text-[.76rem] text-[#6b7280] mb-3">
        Se reproduce automáticamente al abrir la invitación. MP3 · Máx. 20 MB.
      </p>

      {/* Existing music from server */}
      {existingMusica && !removeMusica && !musica && (
        <div className="flex items-center gap-3 px-3 py-2.5 bg-[#f4f5f7] rounded-lg mb-2">
          <Music className="w-4 h-4 text-[#c5a572] shrink-0" />
          <span className="text-[.82rem] flex-1 truncate text-[#2d2926]">Música actual (ya subida)</span>
          <button type="button" onClick={() => onChange({ removeMusica: true })}
            className="text-[#9ca3af] hover:text-[#dc2626] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {removeMusica && !musica && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#fee2e2] text-[#dc2626] rounded-lg mb-2 text-[.8rem]">
          <span className="flex-1">La música se eliminará al guardar.</span>
          <button type="button" onClick={() => onChange({ removeMusica: false })} className="underline shrink-0">Deshacer</button>
        </div>
      )}

      {musica ? (
        <div className="flex items-center gap-3 px-3 py-2.5 bg-[#f4f5f7] rounded-lg">
          <Music className="w-4 h-4 text-[#c5a572] shrink-0" />
          <span className="text-[.82rem] flex-1 truncate">{musicaNombre}</span>
          <button type="button" onClick={() => onChange({ musica: null, musicaNombre: '' })}
            className="text-[#9ca3af] hover:text-[#dc2626] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center w-full py-5 border-2 border-dashed border-[#d1d5db] rounded-lg hover:border-[#c5a572] hover:bg-[rgba(197,165,114,.03)] transition-colors text-[#6b7280]">
          <Music className="w-5 h-5 mb-1.5" />
          <span className="text-[.82rem]">{existingMusica ? 'Reemplazar música' : 'Arrastrá un archivo MP3'}</span>
          <span className="text-[.7rem] text-[#9ca3af] mt-0.5">MP3 · Máx. 20 MB</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept=".mp3,audio/mpeg" hidden onChange={e => handleFile(e.target.files)} />
    </div>
  )
}

// ─── Historia ─────────────────────────────────────────────────────────────────

function HistoriaSection({
  historias, onChange,
}: Pick<WizardStep4, 'historias'> & { onChange: Props['onChange'] }) {
  function updateSeccion(id: string, updates: Partial<HistoriaSeccion>) {
    onChange({ historias: historias.map(h => h.id === id ? { ...h, ...updates } : h) })
  }

  function removeSeccion(id: string) {
    const h = historias.find(x => x.id === id)
    if (h?.imagenPreview) URL.revokeObjectURL(h.imagenPreview)
    onChange({ historias: historias.filter(h => h.id !== id) })
  }

  function addSeccion() {
    if (historias.length >= 3) return
    const id = crypto.randomUUID()
    onChange({ historias: [...historias, { id, texto: '', orden: historias.length + 1, imagen: null, imagenPreview: null }] })
  }

  function handleImage(id: string, files: FileList | null) {
    if (!files?.[0]) return
    const prev = historias.find(h => h.id === id)
    if (prev?.imagenPreview) URL.revokeObjectURL(prev.imagenPreview)
    // Replacing image: drop any existingImagenUrl marker so save uploads the new file.
    updateSeccion(id, {
      imagen: files[0],
      imagenPreview: URL.createObjectURL(files[0]),
      existingImagenUrl: null,
    })
  }

  function clearImage(id: string) {
    const prev = historias.find(h => h.id === id)
    if (prev?.imagenPreview) URL.revokeObjectURL(prev.imagenPreview)
    // Setting existingImagenUrl to null flags "remove on save" for server-side images.
    updateSeccion(id, { imagen: null, imagenPreview: null, existingImagenUrl: null })
  }

  return (
    <div className="bg-white border border-[#f0f0f0] rounded-xl p-4 mb-4">
      <h3 className="font-semibold text-[.9rem] mb-1">📖 Historia</h3>
      <p className="text-[.76rem] text-[#6b7280] mb-3">
        Hasta 3 secciones con texto (máx. 3000 caracteres) e imagen opcional.
      </p>

      {historias.map((h, i) => (
        <div key={h.id} className="bg-[#f4f5f7] rounded-lg p-3 mb-2 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[.78rem] font-semibold text-[#2d2926]">Sección {i + 1} de 3</span>
            <button type="button" onClick={() => removeSeccion(h.id)}
              className="text-[#6b7280] hover:text-[#dc2626] transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <textarea
            maxLength={3000} rows={3} placeholder="Contá tu historia..."
            value={h.texto} onChange={e => updateSeccion(h.id, { texto: e.target.value })}
            className="w-full px-3 py-2 border-[1.5px] border-[#d1d5db] rounded-lg text-[.85rem] focus:border-[#c5a572] focus:outline-none resize-none bg-white transition-colors mb-2"
          />
          <div className="flex items-center gap-2">
            {(h.imagenPreview || h.existingImagenUrl) ? (
              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#d1d5db] shrink-0">
                <img src={h.imagenPreview ?? h.existingImagenUrl!} alt="preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => clearImage(h.id)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-1.5 px-3 py-1.5 border border-[#d1d5db] rounded-lg text-[.76rem] text-[#6b7280] cursor-pointer hover:border-[#c5a572] transition-colors bg-white">
                <ImagePlus className="w-3.5 h-3.5" />
                Imagen
                <input type="file" accept="image/*" hidden onChange={e => handleImage(h.id, e.target.files)} />
              </label>
            )}
            <span className="text-[.7rem] text-[#9ca3af] ml-auto">{h.texto.length}/3000</span>
          </div>
        </div>
      ))}

      {historias.length < 3 && (
        <button type="button" onClick={addSeccion}
          className="flex items-center gap-2 px-3 py-2 text-[.82rem] text-[#6b7280] hover:text-[#2d2926] border border-dashed border-[#d1d5db] rounded-lg hover:border-[#2d2926] transition-colors w-full justify-center mt-1">
          <PlusCircle className="w-4 h-4" />
          Agregar sección
        </button>
      )}
    </div>
  )
}

// ─── Step component ───────────────────────────────────────────────────────────

export function Step4Contenido({ state, onChange, servicios, onNext, onPrev }: Props) {
  const showMusica  = hasService(servicios, 'musica')
  const showHistoria = hasService(servicios, 'historia')

  const totalActivePhotos =
    state.existingFotos.filter(f => !state.removedFotoIds.includes(f.id)).length +
    state.fotos.length

  const canProceed = totalActivePhotos > 0

  return (
    <div>
      <h2 className="text-lg font-semibold mb-5">Contenido Multimedia</h2>

      <FotosSection fotos={state.fotos} fotosPreviews={state.fotosPreviews} existingFotos={state.existingFotos} removedFotoIds={state.removedFotoIds} onChange={onChange} />
      {showMusica  && <MusicaSection musica={state.musica} musicaNombre={state.musicaNombre} existingMusica={state.existingMusica} removeMusica={state.removeMusica} onChange={onChange} />}
      {showHistoria && <HistoriaSection historias={state.historias} onChange={onChange} />}

      {!showMusica && !showHistoria && (
        <p className="text-[.82rem] text-[#9ca3af] bg-[#f4f5f7] rounded-lg px-4 py-3 mb-4">
          💡 Habilitá los servicios de Música o Historia en el paso anterior para ver más opciones aquí.
        </p>
      )}

      <div className="flex items-center justify-between mt-2 pt-4 border-t border-[#f0f0f0]">
        <button type="button" onClick={onPrev}
          className="px-5 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.88rem] font-medium hover:border-[#2d2926] transition-colors">
          ← Anterior
        </button>
        <div className="flex items-center gap-4">
          {!canProceed && (
            <span className="text-[.76rem] text-[#dc2626] hidden sm:block">
              Subí al menos una foto del anfitrión
            </span>
          )}
          <button type="button" onClick={onNext} disabled={!canProceed}
            className="px-5 py-2.5 bg-[#2d2926] text-[#fefcf9] rounded-lg text-[.88rem] font-medium hover:bg-[#4a4441] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  )
}

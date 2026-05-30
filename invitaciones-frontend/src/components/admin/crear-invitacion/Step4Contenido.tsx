import { useRef } from 'react'
import { X, Music, ImagePlus, PlusCircle, Trash2 } from 'lucide-react'
import type { WizardStep4, WizardStep3, HistoriaSeccion } from '@/types/crearInvitacion'

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
  fotos, fotosPreviews, onChange,
}: Pick<WizardStep4, 'fotos' | 'fotosPreviews'> & { onChange: Props['onChange'] }) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const newFiles = Array.from(files).slice(0, 5 - fotos.length)
    const newPreviews = newFiles.map(f => URL.createObjectURL(f))
    onChange({ fotos: [...fotos, ...newFiles], fotosPreviews: [...fotosPreviews, ...newPreviews] })
  }

  function removePhoto(idx: number) {
    URL.revokeObjectURL(fotosPreviews[idx])
    onChange({
      fotos: fotos.filter((_, i) => i !== idx),
      fotosPreviews: fotosPreviews.filter((_, i) => i !== idx),
    })
  }

  return (
    <div className="bg-white border border-[#f0f0f0] rounded-xl p-4 mb-4">
      <h3 className="font-semibold text-[.9rem] mb-1">📷 Fotos del Anfitrión</h3>

      {fotos.length < 5 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center w-full py-6 border-2 border-dashed border-[#d1d5db] rounded-lg hover:border-[#c5a572] hover:bg-[rgba(197,165,114,.03)] transition-colors text-[#6b7280] mb-3"
        >
          <ImagePlus className="w-6 h-6 mb-1.5" />
          <span className="text-[.82rem]">Arrastrá fotos acá o hacé click para subir</span>
          <span className="text-[.7rem] text-[#9ca3af] mt-0.5">JPG, PNG, WebP · Máx. 5 MB c/u · {5 - fotos.length} restante{5 - fotos.length !== 1 ? 's' : ''}</span>
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
              <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button" onClick={() => removePhoto(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-[#dc2626] text-white flex items-center justify-center hover:bg-[#b91c1c]"
              >
                <X className="w-3 h-3" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 text-[.6rem] text-center bg-black/50 text-white py-0.5">Header</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Música ───────────────────────────────────────────────────────────────────

function MusicaSection({
  musica, musicaNombre, onChange,
}: Pick<WizardStep4, 'musica' | 'musicaNombre'> & { onChange: Props['onChange'] }) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(files: FileList | null) {
    if (!files?.[0]) return
    onChange({ musica: files[0], musicaNombre: files[0].name })
  }

  return (
    <div className="bg-white border border-[#f0f0f0] rounded-xl p-4 mb-4">
      <h3 className="font-semibold text-[.9rem] mb-1">🎵 Música</h3>
      <p className="text-[.76rem] text-[#6b7280] mb-3">
        Se reproduce automáticamente al abrir la invitación. MP3 · Máx. 20 MB.
      </p>

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
          className="flex flex-col items-center justify-center w-full py-5 border-2 border-dashed border-[#d1d5db] rounded-lg hover:border-[#c5a572] hover:bg-[rgba(197,165,114,.03)] transition-colors text-[#6b7280]">
          <Music className="w-5 h-5 mb-1.5" />
          <span className="text-[.82rem]">Arrastrá un archivo MP3</span>
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
    updateSeccion(id, { imagen: files[0], imagenPreview: URL.createObjectURL(files[0]) })
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
            {h.imagenPreview ? (
              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#d1d5db] shrink-0">
                <img src={h.imagenPreview} alt="preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => updateSeccion(h.id, { imagen: null, imagenPreview: null })}
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

  return (
    <div>
      <h2 className="text-lg font-semibold mb-5">Contenido Multimedia</h2>

      <FotosSection fotos={state.fotos} fotosPreviews={state.fotosPreviews} onChange={onChange} />
      {showMusica  && <MusicaSection musica={state.musica} musicaNombre={state.musicaNombre} onChange={onChange} />}
      {showHistoria && <HistoriaSection historias={state.historias} onChange={onChange} />}

      {!showMusica && !showHistoria && (
        <p className="text-[.82rem] text-[#9ca3af] bg-[#f4f5f7] rounded-lg px-4 py-3 mb-4">
          💡 Habilitá los servicios de Música o Historia en el paso anterior para ver más opciones aquí.
        </p>
      )}

      <div className="flex justify-between mt-2 pt-4 border-t border-[#f0f0f0]">
        <button type="button" onClick={onPrev}
          className="px-5 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.88rem] font-medium hover:border-[#2d2926] transition-colors">
          ← Anterior
        </button>
        <button type="button" onClick={onNext}
          className="px-5 py-2.5 bg-[#2d2926] text-[#fefcf9] rounded-lg text-[.88rem] font-medium hover:bg-[#4a4441] transition-colors">
          Siguiente →
        </button>
      </div>
    </div>
  )
}

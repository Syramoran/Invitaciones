import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Settings, Eye, Users, Copy, Clock, AlertCircle, FileDown, Loader2, QrCode, Trash2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import apiClient from '@/services/apiClient'
import DeleteInvitacionModal from './DeleteInvitacionModal'

interface InvitacionCliente {
  id: string
  titulo: string
  tipoEventoNombre: string
  templateNombre: string
  activa: boolean
  estadoPago: string
  fechaEvento: string
  editCount: number
}

interface Props {
  invitacion: InvitacionCliente
  onNoEditionsModal?: () => void
  onDeleted?: () => void
}

export default function ClientInvitationCard({ invitacion, onNoEditionsModal, onDeleted }: Props) {
  const navigate = useNavigate()
  const [downloading, setDownloading] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const editionsRemaining = 5 - invitacion.editCount
  const eventDate = new Date(invitacion.fechaEvento)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const eventDateNormalized = new Date(invitacion.fechaEvento)
  eventDateNormalized.setHours(0, 0, 0, 0)

  const daysUntilEvent = Math.floor((eventDateNormalized.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const eventPassed = daysUntilEvent < 0

  // Color coding for days until event
  let daysBgColor = 'bg-green-50 text-green-700'
  let daysBorderColor = 'border-green-200'
  if (daysUntilEvent < 0) {
    daysBgColor = 'bg-gray-50 text-gray-600'
    daysBorderColor = 'border-gray-200'
  } else if (daysUntilEvent < 7) {
    daysBgColor = 'bg-red-50 text-red-700'
    daysBorderColor = 'border-red-200'
  } else if (daysUntilEvent < 30) {
    daysBgColor = 'bg-yellow-50 text-yellow-700'
    daysBorderColor = 'border-yellow-200'
  }

  // Edit count color
  let editCountBg = 'bg-green-100 text-green-800'
  if (editionsRemaining === 0) {
    editCountBg = 'bg-gray-100 text-gray-600'
  } else if (editionsRemaining <= 2) {
    editCountBg = 'bg-yellow-100 text-yellow-800'
  }

  const handleEdit = () => {
    if (editionsRemaining > 0 && !eventPassed) {
      navigate(`/client/edit-invitation/${invitacion.id}`)
    } else if (editionsRemaining === 0) {
      onNoEditionsModal?.()
    }
  }

  const canEdit = editionsRemaining > 0 && !eventPassed

  const handleDownloadLinks = async () => {
    setDownloading(true)
    try {
      const response = await apiClient.get(`/invitaciones/${invitacion.id}/invitados/export`, {
        responseType: 'blob',
      })
      const url = URL.createObjectURL(response.data as Blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invitados-${invitacion.titulo.replace(/\s+/g, '-').toLowerCase()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Esta invitación todavía no tiene invitados cargados.')
    } finally {
      setDownloading(false)
    }
  }

  const handleDelete = async () => {
    await apiClient.delete(`/client/invitaciones/${invitacion.id}`)
    setDeleteModalOpen(false)
    onDeleted?.()
  }

  const downloadQr = () => {
    const svg = document.getElementById(`qr-galeria-svg-${invitacion.id}`)
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const size = 300
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size)
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = `qr-galeria-${invitacion.titulo.replace(/\s+/g, '-').toLowerCase()}.png`
      a.click()
    }
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`
  }

  return (
    <div className="bg-white border border-[#f3f0ea] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      {/* Event type label */}
      <div className="text-[.75rem] font-bold tracking-wider text-[#c5a572] uppercase mb-2">
        {invitacion.tipoEventoNombre}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold mb-2">{invitacion.titulo}</h3>

      {/* Event date and days until */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1">
          <p className="text-[#6b7280] text-[.9rem]">
            {eventDate.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {!eventPassed && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${daysBgColor} ${daysBorderColor} text-[.75rem] font-medium whitespace-nowrap`}>
            <Clock className="w-3.5 h-3.5" />
            {daysUntilEvent === 0 ? '¡Hoy!' : `${daysUntilEvent} día${daysUntilEvent !== 1 ? 's' : ''}`}
          </div>
        )}
      </div>

      {/* Event passed warning */}
      {eventPassed && (
        <div className="mb-4 p-2.5 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-2 text-[.8rem] text-gray-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>El evento ya pasó</span>
        </div>
      )}

      {/* Quick action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          disabled={!canEdit}
          onClick={handleEdit}
          title={!canEdit && editionsRemaining === 0 ? 'Se alcanzó el límite de ediciones' : !canEdit && eventPassed ? 'El evento ya pasó' : 'Editar invitación'}
          className={`flex items-center gap-1.5 text-[.8rem] font-medium px-3 py-1.5 rounded-full transition-colors border ${
            canEdit
              ? 'bg-[#fcfaf8] hover:bg-[#f3f0ea] text-[#2d2926] border-[#e5e7eb]'
              : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Editar
          <span className={`text-[.68rem] px-1.5 py-0.5 rounded-full font-semibold ${editCountBg}`}>
            {editionsRemaining}/5
          </span>
        </button>

        <Link
          to={`/${invitacion.id}`}
          target="_blank"
          className="flex items-center gap-1 text-[.8rem] font-medium bg-[#fcfaf8] hover:bg-[#f3f0ea] text-[#2d2926] px-3 py-1.5 rounded-full transition-colors border border-[#e5e7eb]"
        >
          <Eye className="w-3.5 h-3.5" />
          Ver web
        </Link>

        <button
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/${invitacion.id}`)
            alert('¡Enlace copiado al portapapeles!')
          }}
          className="flex items-center gap-1 text-[.8rem] font-medium bg-[#fcfaf8] hover:bg-[#f3f0ea] text-[#c5a572] px-3 py-1.5 rounded-full transition-colors border border-[#e5e7eb]"
        >
          <Copy className="w-3.5 h-3.5" />
          Copiar
        </button>

        <Link
          to={`/${invitacion.id}/asistentes`}
          className="flex items-center gap-1 text-[.8rem] font-medium bg-[#fcfaf8] hover:bg-[#f3f0ea] text-[#2d2926] px-3 py-1.5 rounded-full transition-colors border border-[#e5e7eb]"
        >
          <Users className="w-3.5 h-3.5" />
          Asistentes
        </Link>

        <button
          onClick={handleDownloadLinks}
          disabled={downloading}
          className="flex items-center gap-1 text-[.8rem] font-medium bg-[#fcfaf8] hover:bg-[#f3f0ea] text-[#16a34a] px-3 py-1.5 rounded-full transition-colors border border-[#e5e7eb] disabled:opacity-50"
          title="Descargar enlaces de invitados (CSV)"
        >
          {downloading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <FileDown className="w-3.5 h-3.5" />}
          Enlaces
        </button>

        <button
          onClick={() => setQrModalOpen(true)}
          className="flex items-center gap-1 text-[.8rem] font-medium bg-[#fcfaf8] hover:bg-[#f3f0ea] text-[#6b7280] px-3 py-1.5 rounded-full transition-colors border border-[#e5e7eb]"
          title="QR de la galería"
        >
          <QrCode className="w-3.5 h-3.5" />
          QR
        </button>

        <button
          onClick={() => setDeleteModalOpen(true)}
          className="flex items-center gap-1 text-[.8rem] font-medium bg-[#fcfaf8] hover:bg-red-50 text-[#dc2626] px-3 py-1.5 rounded-full transition-colors border border-[#e5e7eb] hover:border-red-300"
          title="Eliminar invitación"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Eliminar
        </button>
      </div>

      {/* QR Modal */}
      {qrModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setQrModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-xs w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#1a1a1a]">QR Galería</h3>
              <button
                onClick={() => setQrModalOpen(false)}
                className="text-[#aaa] hover:text-[#555] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-[#6b7280] mb-1 truncate font-medium">{invitacion.titulo}</p>
            <p className="text-[.7rem] text-[#aaa] mb-4 break-all">{window.location.origin}/{invitacion.id}/galeria</p>

            <div className="flex justify-center mb-4">
              <QRCodeSVG
                id={`qr-galeria-svg-${invitacion.id}`}
                value={`${window.location.origin}/${invitacion.id}/galeria`}
                size={200}
                bgColor="#ffffff"
                fgColor="#1a1a1a"
                level="M"
              />
            </div>

            <button
              onClick={downloadQr}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#d1d5db] py-2.5 text-sm font-medium text-[#1a1a1a] hover:border-[#555] transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Descargar PNG
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <DeleteInvitacionModal
          invitacionTitulo={invitacion.titulo}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModalOpen(false)}
        />
      )}
    </div>
  )
}

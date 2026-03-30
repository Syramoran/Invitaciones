import { Link } from "react-router-dom"
import { FileQuestion } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#e8e8e8] px-6 text-center">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f5f5f5]">
          <FileQuestion className="h-10 w-10 text-[#777777]" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-[#1a1a1a]">
          Invitación no encontrada
        </h1>

        <p className="mb-8 text-sm text-[#777777]">
          La invitación que buscas no existe o ya no está disponible.
          Verifica que el enlace sea correcto.
        </p>

        <Link
          to="/"
          className="inline-block rounded-lg bg-[#555555] px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}

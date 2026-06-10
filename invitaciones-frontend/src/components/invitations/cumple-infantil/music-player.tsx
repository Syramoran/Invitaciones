import { useState, useRef, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Music, X, Volume2 } from "lucide-react"
import type { Musica } from "@/types/invitation"

interface MusicPlayerProps {
  musica: Musica
  autoPlay?: boolean
}

export function MusicPlayer({ musica, autoPlay = false }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.2)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2
    }
  }, [])

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {
        // Autoplay bloqueado por el navegador
        setIsPlaying(false)
      })
    }
  }, [autoPlay])

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (audioRef.current) {
      audioRef.current.volume = val
    }
  }

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const skipBack = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, currentTime - 10)
    }
  }

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, currentTime + 10)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
      <audio
        ref={audioRef}
        src={musica.archivoUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        loop
      />

      {/* Panel expandido */}
      {isExpanded && (
        <div className="w-[280px] rounded-2xl border border-[#e0e0e0] bg-white p-4 shadow-lg">
          <div className="mb-3.5 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#e0e0e0] bg-[#f5f5f5] text-xl">
              🎵
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#1a1a1a]">
                Música
              </p>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-[#777777] hover:text-[#1a1a1a]"
              aria-label="Cerrar reproductor"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Barra de progreso */}
          <div className="mb-3 flex items-center gap-2">
            <span className="min-w-7 text-center text-[10px] text-[#777777]">
              {formatTime(currentTime)}
            </span>
            <div className="relative h-1 flex-1 overflow-hidden rounded-sm bg-[#f5f5f5]">
              <div
                className="h-full rounded-sm bg-[var(--invitation-primary)] transition-all"
                style={{ width: `${progress}%` }}
              />
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="Progreso de la canción"
              />
            </div>
            <span className="min-w-7 text-center text-[10px] text-[#777777]">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controles */}
          <div className="flex items-center justify-center gap-5">
            <button
              onClick={skipBack}
              className="flex items-center justify-center p-1 text-[#777777] hover:text-[#1a1a1a]"
              aria-label="Retroceder 10 segundos"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              onClick={togglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--invitation-primary)] text-white"
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </button>
            <button
              onClick={skipForward}
              className="flex items-center justify-center p-1 text-[#777777] hover:text-[#1a1a1a]"
              aria-label="Adelantar 10 segundos"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          {/* Control de volumen */}
          <div className="mt-3 flex items-center gap-2">
            <Volume2 className="h-4 w-4 shrink-0 text-[#777777]" />
            <div className="relative h-1 flex-1 overflow-hidden rounded-sm bg-[#f5f5f5]">
              <div
                className="h-full rounded-sm bg-[var(--invitation-primary)] transition-all"
                style={{ width: `${volume * 100}%` }}
              />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={handleVolumeChange}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="Volumen"
              />
            </div>
            <span className="min-w-[2rem] text-right text-[10px] text-[#777777]">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--invitation-primary)] text-white shadow-lg transition-transform hover:scale-105"
        aria-label={isExpanded ? "Cerrar reproductor" : "Abrir reproductor"}
      >
        <Music className="h-5 w-5" />
      </button>
    </div>
  )
}

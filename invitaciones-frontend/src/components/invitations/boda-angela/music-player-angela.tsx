import { useState, useRef, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Music, X, Volume2 } from "lucide-react"
import type { Musica } from "@/types/invitation"
import { COLOR, TYPO } from "./theme"

interface MusicPlayerAngelaProps {
  musica: Musica
  autoPlay?: boolean
}

const INITIAL_VOLUME = 0.2

export function MusicPlayerAngela({ musica, autoPlay = false }: MusicPlayerAngelaProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(INITIAL_VOLUME)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = INITIAL_VOLUME
    }
  }, [])

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay bloqueado por el navegador — queda disponible el botón manual.
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
        <div
          className="w-[270px] rounded-sm p-4 shadow-md drop-shadow-md"
          style={{ backgroundColor: COLOR.parchment, border: `1px solid ${COLOR.brown}33` }}
        >
          <div className="mb-3.5 flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm"
              style={{ backgroundColor: COLOR.crema, color: COLOR.darkBrown }}
            >
              <Music className="h-4 w-4" />
            </div>
            <p className="min-w-0 flex-1 truncate" style={{ ...TYPO.text3, color: COLOR.darkBrown }}>
              Música
            </p>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="cursor-pointer transition hover:opacity-70"
              style={{ color: COLOR.brown }}
              aria-label="Cerrar reproductor"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Barra de progreso */}
          <div className="mb-3 flex items-center gap-2">
            <span className="min-w-7 text-center" style={{ ...TYPO.text3, color: COLOR.brown }}>
              {formatTime(currentTime)}
            </span>
            <div
              className="relative h-1 flex-1 overflow-hidden rounded-sm"
              style={{ backgroundColor: COLOR.crema }}
            >
              <div
                className="h-full rounded-sm transition-all"
                style={{ width: `${progress}%`, backgroundColor: COLOR.darkBrown }}
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
            <span className="min-w-7 text-center" style={{ ...TYPO.text3, color: COLOR.brown }}>
              {formatTime(duration)}
            </span>
          </div>

          {/* Controles */}
          <div className="flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={skipBack}
              className="flex cursor-pointer items-center justify-center p-1 transition hover:opacity-70"
              style={{ color: COLOR.brown }}
              aria-label="Retroceder 10 segundos"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition hover:opacity-85"
              style={{ backgroundColor: COLOR.darkBrown, color: COLOR.parchment }}
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={skipForward}
              className="flex cursor-pointer items-center justify-center p-1 transition hover:opacity-70"
              style={{ color: COLOR.brown }}
              aria-label="Adelantar 10 segundos"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          {/* Control de volumen */}
          <div className="mt-3 flex items-center gap-2">
            <Volume2 className="h-4 w-4 shrink-0" style={{ color: COLOR.brown }} />
            <div
              className="relative h-1 flex-1 overflow-hidden rounded-sm"
              style={{ backgroundColor: COLOR.crema }}
            >
              <div
                className="h-full rounded-sm transition-all"
                style={{ width: `${volume * 100}%`, backgroundColor: COLOR.darkBrown }}
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
            <span className="min-w-[2rem] text-right" style={{ ...TYPO.text3, color: COLOR.brown }}>
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full shadow-md drop-shadow-md transition-transform hover:scale-105"
        style={{ backgroundColor: COLOR.crema, color: COLOR.darkBrown }}
        aria-label={isExpanded ? "Cerrar reproductor" : "Abrir reproductor"}
      >
        <Music className="h-5 w-5" />
      </button>
    </div>
  )
}

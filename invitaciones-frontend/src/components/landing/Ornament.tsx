import { Star } from 'lucide-react'

interface OrnamentProps {
  className?: string
}

export function Ornament({ className = '' }: OrnamentProps) {
  return (
    <div className={`flex items-center justify-center gap-4 mb-6 text-gold ${className}`}>
      <span className="w-[60px] h-px bg-gradient-to-r from-transparent via-gold-light to-transparent" />
      <Star className="w-5 h-5 fill-gold" />
      <span className="w-[60px] h-px bg-gradient-to-r from-transparent via-gold-light to-transparent" />
    </div>
  )
}

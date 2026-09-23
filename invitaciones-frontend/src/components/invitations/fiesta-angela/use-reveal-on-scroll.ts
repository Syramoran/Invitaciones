import { useEffect, useRef, useState } from 'react'

interface UseRevealOnScrollOptions {
  threshold?: number
  rootMargin?: string
}

export function useRevealOnScroll<T extends HTMLElement>({
  threshold = 0,
  rootMargin = '0px 0px -40% 0px',
}: UseRevealOnScrollOptions = {}) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return { ref, inView }
}

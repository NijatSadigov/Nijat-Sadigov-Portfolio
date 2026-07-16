import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'

export default function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (shown) return
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setShown(true)
        io.disconnect()
      }
    })
    io.observe(el)
    return () => io.disconnect()
  }, [shown])

  // With reduced motion the content is simply there — never hidden waiting on an
  // observer, and nothing to animate.
  if (reduce) return <div>{children}</div>

  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(26px)',
        transition: `opacity 660ms var(--ease-out) ${delay}s, transform 660ms var(--ease-out) ${delay}s`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}

import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * Centered modal dialog. Rendered through a portal into <body> — critical,
 * because ancestors with CSS transforms/perspective (the DiceScene) hijack
 * position:fixed and push the dialog off-screen.
 *
 * The outer layer scrolls, so content taller than the viewport is reachable
 * from the top (no clipped headers).
 */
export default function Modal({
  title,
  subtitle,
  onClose,
  maxW = 'max-w-2xl',
  children,
}: {
  title: string
  subtitle?: ReactNode
  onClose: () => void
  maxW?: string
  children?: ReactNode
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="grid min-h-full place-items-center p-4 sm:p-6">
        <div
          className={`modal-in w-full ${maxW} rounded-2xl border border-white/10 bg-[#0d0d13] p-6 shadow-2xl sm:p-8`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="theme-heading text-2xl font-bold text-white">{title}</h3>
              {subtitle && <div className="mt-1.5">{subtitle}</div>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 font-mono text-slate-400 transition hover:border-accent hover:text-accent"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}

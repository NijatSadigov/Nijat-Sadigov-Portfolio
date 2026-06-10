import { useEffect, type ReactNode } from 'react'

/** A centered modal dialog: backdrop click + Esc to close, body scroll locked. */
export default function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string
  subtitle?: ReactNode
  onClose: () => void
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

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="theme-heading text-xl font-bold text-white">{title}</h3>
            {subtitle && <div className="mt-1">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full px-2 text-2xl leading-none text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

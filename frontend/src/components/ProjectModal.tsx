import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { generatedCover } from '../lib/cover'
import { coverUrl, themeSlug, tokenStyle } from '../lib/projects'
import { type Mode, type ProfileSlug } from '../lib/theme'
import type { Category, Project } from '../types'

export default function ProjectModal({
  project,
  categories,
  active,
  mode,
  onClose,
}: {
  project: Project
  categories: Category[]
  active: ProfileSlug
  mode: Mode
  onClose: () => void
}) {
  const panel = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const restoreTo = useRef<HTMLElement | null>(null)

  const slug = themeSlug(project, categories, active)
  const wrap = tokenStyle(slug, active, mode)
  const url = coverUrl(project)
  const gen = url ? null : generatedCover(project.slug, project.title, slug)
  const chip = categories.find((c) => c.slug === slug)?.name
  const hasDemo = project.demoType !== 'none' && !!project.demoUrl

  // Close on Esc, keep focus inside, and hand it back on the way out.
  useEffect(() => {
    restoreTo.current = document.activeElement as HTMLElement | null
    closeBtn.current?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panel.current) return
      const focusable = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      restoreTo.current?.focus?.()
    }
  }, [onClose])

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex justify-center overflow-y-auto"
      style={{
        background: 'color-mix(in srgb, #000 60%, transparent)',
        backdropFilter: 'blur(8px)',
        padding: 'clamp(16px,4vw,56px)',
      }}
    >
      <div style={wrap} onClick={(e) => e.stopPropagation()} className="w-full">
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
          className="pop mx-auto overflow-hidden"
          style={{
            width: 'min(820px, 100%)',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'calc(var(--radius) + 4px)',
          }}
        >
          <div
            className="relative"
            style={{
              aspectRatio: '2/1',
              background: gen ? gen.background : 'var(--surface-2)',
            }}
          >
            {url ? (
              <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              gen && (
                <div className="absolute inset-0" style={gen.overlay}>
                  {gen.glyph}
                </div>
              )
            )}
            {chip && (
              <span
                className="absolute left-[18px] top-[18px] font-mono"
                style={{
                  fontSize: 11.5,
                  padding: '5px 10px',
                  borderRadius: 6,
                  background: 'color-mix(in srgb, var(--bg) 55%, transparent)',
                  color: 'var(--text)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {chip}
              </span>
            )}
            <button
              ref={closeBtn}
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center text-base"
              style={{
                borderRadius: 8,
                background: 'color-mix(in srgb, var(--bg) 60%, transparent)',
                backdropFilter: 'blur(6px)',
                border: '1px solid var(--border)',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: 'clamp(24px,4vw,44px)' }}>
            <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-4">
              <h2
                className="head m-0 font-semibold"
                style={{ fontSize: 'clamp(1.6rem,4vw,2.6rem)', letterSpacing: '-.01em' }}
              >
                {project.title}
              </h2>
              <span className="whitespace-nowrap font-mono text-xs text-faint">
                {project.viewCount} views
              </span>
            </div>

            {project.summary && (
              <p
                className="mb-6 text-dim"
                style={{ fontSize: 'clamp(1rem,2vw,1.2rem)', lineHeight: 1.5, textWrap: 'pretty' }}
              >
                {project.summary}
              </p>
            )}

            {(project.repoUrl || hasDemo) && (
              <div className="mb-7 flex flex-wrap gap-2.5">
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex gap-2 px-[18px] py-[11px] text-sm font-semibold text-text"
                    style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                  >
                    ‹/› Repository
                  </a>
                )}
                {hasDemo && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex gap-2 px-[18px] py-[11px] text-sm font-bold"
                    style={{
                      borderRadius: 'var(--radius)',
                      background: 'var(--accent)',
                      color: 'var(--on-accent)',
                    }}
                  >
                    ↗ Live demo
                  </a>
                )}
              </div>
            )}

            {project.demoGuide && (
              <p className="mb-6 font-mono text-[12.5px] text-faint">{project.demoGuide}</p>
            )}

            {project.description && (
              <div className="md max-w-[620px]">
                <ReactMarkdown>{project.description}</ReactMarkdown>
              </div>
            )}

            {project.tech.length > 0 && (
              <div
                className="mt-7 flex flex-wrap gap-[7px] pt-6"
                style={{ borderTop: '1px solid var(--border-2)' }}
              >
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-dim"
                    style={{
                      fontSize: 12,
                      padding: '5px 11px',
                      borderRadius: 6,
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border-2)',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

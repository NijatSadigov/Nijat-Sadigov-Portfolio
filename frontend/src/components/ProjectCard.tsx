import { useEffect, useRef, useState } from 'react'
import type { Project } from '../types'

function orderedImages(p: Project): string[] {
  const cover = p.images.find((i) => i.isCover) ?? p.images[0]
  if (!cover) return []
  return [cover.url, ...p.images.filter((i) => i.id !== cover.id).map((i) => i.url)]
}

function hasLiveDemo(p: Project): boolean {
  return p.demoType !== 'none' && !!p.demoUrl
}

export default function ProjectCard({
  project,
  dimmed = false,
  onOpen,
}: {
  project: Project
  dimmed?: boolean
  onOpen: (p: Project) => void
}) {
  const images = orderedImages(project)
  const [idx, setIdx] = useState(0)
  const timer = useRef<number | undefined>(undefined)

  const startCycle = () => {
    if (images.length > 1 && timer.current === undefined) {
      timer.current = window.setInterval(() => setIdx((i) => (i + 1) % images.length), 1200)
    }
  }
  const stopCycle = () => {
    if (timer.current !== undefined) {
      clearInterval(timer.current)
      timer.current = undefined
    }
    setIdx(0)
  }
  useEffect(
    () => () => {
      if (timer.current !== undefined) clearInterval(timer.current)
    },
    [],
  )

  return (
    <button
      type="button"
      onClick={() => onOpen(project)}
      onMouseEnter={startCycle}
      onMouseLeave={stopCycle}
      className={[
        'theme-card group relative block w-full overflow-hidden rounded-xl border border-line bg-surface text-left transition-all duration-300',
        'hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_12px_48px_-12px_rgb(var(--accent)/0.3)]',
        dimmed ? 'opacity-40 hover:opacity-100' : 'opacity-100',
      ].join(' ')}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-bg">
        {images.length > 0 ? (
          <img
            src={images[idx]}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center font-mono text-xs uppercase tracking-widest text-faint">
            no image
          </div>
        )}

        {hasLiveDemo(project) && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-300 backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Live
          </span>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/50 px-2 py-1 backdrop-blur-sm">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition ${i === idx ? 'bg-accent' : 'bg-white/40'}`}
              />
            ))}
          </div>
        )}
        <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-black/50 font-mono text-sm text-accent opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
          ↗
        </span>
      </div>

      <div className="p-5">
        {project.featured && (
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            ★ Featured
          </p>
        )}
        <h3 className="theme-heading text-lg font-semibold text-ink">{project.title}</h3>
        {project.summary && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{project.summary}</p>
        )}
        {project.tech.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tech.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-faint"
              >
                {t}
              </span>
            ))}
            {project.tech.length > 4 && (
              <span className="px-1 font-mono text-[10px] text-faint">+{project.tech.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </button>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Project } from '../types'

// Cover image first, then the rest — used for the inline hover gallery.
function orderedImages(p: Project): string[] {
  const cover = p.images.find((i) => i.isCover) ?? p.images[0]
  if (!cover) return []
  return [cover.url, ...p.images.filter((i) => i.id !== cover.id).map((i) => i.url)]
}

export default function ProjectCard({
  project,
  dimmed = false,
}: {
  project: Project
  dimmed?: boolean
}) {
  const images = orderedImages(project)
  const [idx, setIdx] = useState(0)
  const timer = useRef<number | undefined>(undefined)

  // On hover, cycle through the project's images; reset to the cover on leave.
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
    <Link
      to={`/projects/${project.slug}`}
      onMouseEnter={startCycle}
      onMouseLeave={stopCycle}
      className={[
        'theme-card group block overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 transition-all duration-300 hover:border-accent/60 hover:shadow-lg hover:shadow-accent/10',
        dimmed ? 'opacity-40 hover:opacity-100' : 'opacity-100',
      ].join(' ')}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-slate-800">
        {images.length > 0 ? (
          <img
            src={images[idx]}
            alt={project.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-slate-600">No image</div>
        )}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition ${
                  i === idx ? 'bg-accent' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2">
          {project.featured && (
            <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
              Featured
            </span>
          )}
          <h3 className="theme-heading font-semibold text-white">{project.title}</h3>
        </div>
        {project.summary && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-400">{project.summary}</p>
        )}
        {project.tech.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tech.slice(0, 4).map((t) => (
              <span key={t} className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

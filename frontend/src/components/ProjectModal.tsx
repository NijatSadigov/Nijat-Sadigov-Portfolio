import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { api } from '../api/client'
import type { Project } from '../types'
import { monthYear } from '../lib/format'
import Modal from './Modal'

export default function ProjectModal({
  project,
  onClose,
}: {
  project: Project
  onClose: () => void
}) {
  const images = project.images
  const [idx, setIdx] = useState(() =>
    Math.max(0, images.findIndex((i) => i.isCover)),
  )

  // count the view once per open
  useEffect(() => {
    api.recordView(project.slug).catch(() => {})
  }, [project.slug])

  const current = images[idx]
  const period = [monthYear(project.startedOn), monthYear(project.endedOn)]
    .filter(Boolean)
    .join(' – ')

  return (
    <Modal
      title={project.title}
      maxW="max-w-3xl"
      subtitle={
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-slate-400">
          {project.featured && <span className="text-accent">★ featured</span>}
          {period && <span>{period}</span>}
          {project.viewCount > 0 && <span>{project.viewCount + 1} views</span>}
        </div>
      }
      onClose={onClose}
    >
      {project.summary && <p className="mt-4 text-slate-300">{project.summary}</p>}

      {project.tech.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <span
              key={t}
              className="rounded border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-400"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-wider text-slate-200 transition hover:border-accent hover:text-accent"
          >
            GitHub ↗
          </a>
        )}
        {project.demoUrl && project.demoType !== 'none' && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-accent px-4 py-2 font-mono text-xs uppercase tracking-wider text-white transition hover:opacity-90"
          >
            Live demo ↗
          </a>
        )}
      </div>

      {/* gallery */}
      {current && (
        <div className="mt-6">
          <img
            src={current.url}
            alt={current.caption || project.title}
            className="theme-card max-h-[60vh] w-full rounded-xl border border-white/10 object-contain"
          />
          {current.caption && (
            <p className="mt-2 text-center font-mono text-xs text-slate-500">{current.caption}</p>
          )}
          {images.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setIdx(i)}
                  className={`h-14 w-22 overflow-hidden rounded border-2 transition ${
                    i === idx ? 'border-accent' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {project.description && (
        <div className="md mt-6">
          <ReactMarkdown>{project.description}</ReactMarkdown>
        </div>
      )}

      {project.demoGuide && (
        <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <h4 className="kicker">How to run / use it</h4>
          <div className="md mt-3">
            <ReactMarkdown>{project.demoGuide}</ReactMarkdown>
          </div>
        </section>
      )}
    </Modal>
  )
}

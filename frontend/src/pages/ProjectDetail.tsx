import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { api } from '../api/client'
import type { Project } from '../types'

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    api
      .getProject(slug)
      .then((p) => {
        setProject(p)
        api.recordView(slug).catch(() => {})
      })
      .catch((e) => setError(e.message))
  }, [slug])

  useEffect(() => {
    if (project) document.title = `${project.title} — Nijat Sadigov`
    return () => {
      document.title = 'Nijat Sadigov — Software, Games & Research'
    }
  }, [project])

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center text-center">
        <div>
          <p className="font-mono text-sm text-faint">// project not found</p>
          <Link
            to="/"
            className="mt-3 inline-block font-mono text-xs uppercase tracking-wider text-accent hover:underline"
          >
            ← back home
          </Link>
        </div>
      </div>
    )
  }
  if (!project) {
    return (
      <div className="grid min-h-screen place-items-center">
        <p className="cursor-blink font-mono text-sm text-accent">▌</p>
      </div>
    )
  }

  const images = project.images
  const current = images[activeImage]

  return (
    <article className="mx-auto max-w-4xl px-6 py-14">
      <Link
        to="/"
        className="font-mono text-xs uppercase tracking-wider text-faint transition hover:text-accent"
      >
        ← back
      </Link>

      <h1 className="theme-heading mt-5 text-4xl font-bold text-ink">{project.title}</h1>
      {project.summary && <p className="mt-3 text-lg text-muted">{project.summary}</p>}

      {project.tech.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <span
              key={t}
              className="rounded border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-line px-4 py-2 font-mono text-xs uppercase tracking-wider transition hover:border-accent hover:text-accent"
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

      {current && (
        <div className="mt-9">
          <img
            src={current.url}
            alt={current.caption || project.title}
            className="theme-card w-full rounded-xl border border-line object-cover"
          />
          {current.caption && (
            <p className="mt-2 text-center font-mono text-xs text-faint">{current.caption}</p>
          )}
          {images.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-24 overflow-hidden rounded border-2 transition ${
                    i === activeImage ? 'border-accent' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {project.description && (
        <div className="md mt-10">
          <ReactMarkdown>{project.description}</ReactMarkdown>
        </div>
      )}

      {project.demoGuide && (
        <section className="mt-10 rounded-xl border border-line bg-bg/40 p-6">
          <h2 className="kicker">How to run / use it</h2>
          <div className="md mt-3">
            <ReactMarkdown>{project.demoGuide}</ReactMarkdown>
          </div>
        </section>
      )}
    </article>
  )
}

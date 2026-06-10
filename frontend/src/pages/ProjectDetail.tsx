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

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center text-center text-slate-400">
        <div>
          <p>Project not found.</p>
          <Link to="/" className="mt-3 inline-block text-accent hover:underline">
            ← Back home
          </Link>
        </div>
      </div>
    )
  }
  if (!project) {
    return <div className="grid min-h-screen place-items-center text-slate-400">Loading…</div>
  }

  const images = project.images
  const current = images[activeImage]

  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      <Link to="/" className="text-sm text-slate-400 hover:text-accent">
        ← Back
      </Link>

      <h1 className="theme-heading mt-4 text-3xl font-bold text-white">{project.title}</h1>
      {project.summary && <p className="mt-2 text-lg text-slate-300">{project.summary}</p>}

      {project.tech.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <span key={t} className="rounded bg-slate-800 px-2.5 py-1 text-sm text-slate-200">
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
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:border-accent hover:text-accent"
          >
            GitHub ↗
          </a>
        )}
        {project.demoUrl && project.demoType !== 'none' && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Live demo ↗
          </a>
        )}
      </div>

      {/* Gallery */}
      {current && (
        <div className="mt-8">
          <img
            src={current.url}
            alt={current.caption || project.title}
            className="theme-card w-full rounded-xl border border-slate-800 object-cover"
          />
          {current.caption && (
            <p className="mt-2 text-center text-sm text-slate-500">{current.caption}</p>
          )}
          {images.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-24 overflow-hidden rounded border-2 ${
                    i === activeImage ? 'border-accent' : 'border-transparent opacity-70'
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
        <div className="prose-invert mt-10 max-w-none space-y-4 leading-relaxed text-slate-300">
          <ReactMarkdown>{project.description}</ReactMarkdown>
        </div>
      )}

      {project.demoGuide && (
        <section className="mt-10 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="theme-heading text-xl font-semibold text-white">How to run / use it</h2>
          <div className="mt-3 space-y-3 text-slate-300">
            <ReactMarkdown>{project.demoGuide}</ReactMarkdown>
          </div>
        </section>
      )}
    </article>
  )
}

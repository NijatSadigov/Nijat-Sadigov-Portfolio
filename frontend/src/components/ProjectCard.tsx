import { generatedCover } from '../lib/cover'
import { coverUrl, themeSlug, tokenStyle } from '../lib/projects'
import { type Mode, type ProfileSlug } from '../lib/theme'
import type { Category, Project } from '../types'

function Cover({
  project,
  slug,
  ratio,
  chip,
  featured,
  live,
}: {
  project: Project
  slug: ProfileSlug
  ratio: string
  chip?: string
  featured?: boolean
  live?: boolean
}) {
  const url = coverUrl(project)
  const gen = url ? null : generatedCover(project.slug, project.title, slug)

  return (
    <div
      className="relative"
      style={{ aspectRatio: ratio, background: gen ? gen.background : 'var(--surface-2)' }}
    >
      {url ? (
        <img
          src={url}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        gen && (
          <div className="absolute inset-0" style={gen.overlay}>
            {gen.glyph}
          </div>
        )
      )}

      {chip && (
        <span
          className="absolute left-3 top-3 font-mono"
          style={{
            fontSize: 10.5,
            padding: '3px 7px',
            borderRadius: 5,
            background: 'color-mix(in srgb, var(--bg) 55%, transparent)',
            color: 'var(--text)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {chip}
        </span>
      )}

      {(featured || live) && (
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          {featured && (
            <span
              className="font-mono text-accent"
              style={{
                fontSize: 11,
                padding: '4px 8px',
                borderRadius: 5,
                background: 'color-mix(in srgb, var(--bg) 55%, transparent)',
                backdropFilter: 'blur(4px)',
              }}
            >
              ★ featured
            </span>
          )}
          {live && (
            <span
              className="flex items-center gap-1.5 font-mono"
              title="This project has a live demo"
              style={{
                fontSize: 11,
                padding: '4px 8px',
                borderRadius: 5,
                background: 'color-mix(in srgb, var(--bg) 55%, transparent)',
                color: 'var(--text)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <span
                aria-hidden="true"
                className="live-dot inline-block h-[6px] w-[6px] shrink-0 rounded-full"
                style={{ background: 'var(--accent)' }}
              />
              Live
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProjectCard({
  project,
  categories,
  active,
  mode,
  dimmed,
  variant = 'grid',
  onOpen,
}: {
  project: Project
  categories: Category[]
  active: ProfileSlug
  mode: Mode
  dimmed?: boolean
  variant?: 'grid' | 'featured'
  onOpen: (p: Project) => void
}) {
  const slug = themeSlug(project, categories, active)
  const wrap = tokenStyle(slug, active, mode)
  // Chip follows the same rule as the theme: the viewed category when this
  // project belongs to it, otherwise the project's own.
  const chip = categories.find((c) => c.slug === slug)?.name

  const isFeatured = variant === 'featured'
  const tags = isFeatured ? project.tech.slice(0, 4) : project.tech.slice(0, 2)
  const hasLiveDemo = project.demoType !== 'none' && !!project.demoUrl

  return (
    <div style={wrap} className={dimmed ? 'dimmed h-full' : 'h-full'}>
      <button
        data-card=""
        onClick={() => onOpen(project)}
        className="card flex h-full w-full flex-col overflow-hidden text-left"
      >
        <Cover
          project={project}
          slug={slug}
          ratio={isFeatured ? '16/9' : '5/3'}
          chip={chip}
          featured={isFeatured && project.featured}
          live={hasLiveDemo}
        />

        <div
          className="flex flex-1 flex-col"
          style={{ padding: isFeatured ? '20px 22px 24px' : '16px 18px 18px' }}
        >
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <h3
              className="head m-0 font-semibold"
              style={{
                fontSize: isFeatured ? 'clamp(1.15rem, 2.2vw, 1.5rem)' : '1.12rem',
                letterSpacing: '-.01em',
              }}
            >
              {project.title}
            </h3>
            {isFeatured && (
              <span className="whitespace-nowrap font-mono text-[11px] text-faint">
                {project.viewCount} views
              </span>
            )}
          </div>

          <p
            className="m-0 flex-1 text-dim"
            style={{
              fontSize: isFeatured ? 15 : 13.5,
              lineHeight: 1.5,
              marginBottom: isFeatured ? 16 : 14,
              textWrap: 'pretty',
            }}
          >
            {project.summary}
          </p>

          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="font-mono text-dim"
                  style={{
                    fontSize: isFeatured ? 11.5 : 11,
                    padding: isFeatured ? '4px 9px' : '3px 8px',
                    borderRadius: 5,
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-2)',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            {!isFeatured && (
              <span className="whitespace-nowrap font-mono text-[10.5px] text-faint">
                {project.viewCount}↗
              </span>
            )}
          </div>
        </div>
      </button>
    </div>
  )
}

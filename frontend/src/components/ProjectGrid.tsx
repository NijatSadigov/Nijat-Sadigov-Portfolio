import { matchesProfile, orderProjects } from '../lib/projects'
import { PROFILE_META, STAGGER_CAP, STAGGER_STEP_MS, type Mode, type ProfileSlug } from '../lib/theme'
import type { Category, Project } from '../types'
import ProjectCard from './ProjectCard'

function SectionHead({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="mb-[26px] flex flex-wrap items-baseline justify-between gap-4">
      <h2 className="head m-0 font-semibold" style={{ fontSize: 'clamp(1.3rem,3vw,2rem)' }}>
        {title}
      </h2>
      <span className="font-mono text-[12.5px] text-faint">{meta}</span>
    </div>
  )
}

export function FeaturedProjects({
  projects,
  categories,
  active,
  mode,
  onOpen,
}: {
  projects: Project[]
  categories: Category[]
  active: ProfileSlug
  mode: Mode
  onOpen: (p: Project) => void
}) {
  // Every featured project shows — the grid wraps onto as many rows as it needs.
  const featured = projects
    .filter((p) => p.featured && matchesProfile(p, categories, active))
    .sort((a, b) => b.viewCount - a.viewCount)

  if (featured.length === 0) return null

  return (
    <section id="featured" className="scroll-mt-20" style={{ padding: 'clamp(40px,6vw,72px) 0 20px' }}>
      <SectionHead
        title={active === 'all' ? 'Selected work' : 'Featured'}
        meta={`featured · ${PROFILE_META[active].label}`}
      />
      {/* auto-fill, not auto-fit: a lone featured card keeps its track width
          instead of stretching across the whole row. */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
        key={`featured-${active}`}
      >
        {featured.map((p, i) => (
          <div
            key={p.id}
            className="card-in"
            style={{ animationDelay: `${Math.min(i, STAGGER_CAP) * STAGGER_STEP_MS}ms` }}
          >
            <ProjectCard
              project={p}
              categories={categories}
              active={active}
              mode={mode}
              variant="featured"
              onOpen={onOpen}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default function ProjectGrid({
  projects,
  categories,
  active,
  mode,
  onOpen,
}: {
  projects: Project[]
  categories: Category[]
  active: ProfileSlug
  mode: Mode
  onOpen: (p: Project) => void
}) {
  const ordered = orderProjects(projects, categories, active)
  const matching = ordered.filter((p) => matchesProfile(p, categories, active)).length

  return (
    <section id="work" className="scroll-mt-20" style={{ padding: 'clamp(48px,7vw,80px) 0 20px' }}>
      <SectionHead
        title="All projects"
        meta={
          active === 'all'
            ? `${ordered.length} projects`
            : `${matching} in ${PROFILE_META[active].short.toLowerCase()} · ${ordered.length} total`
        }
      />
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))' }}
        key={`grid-${active}`}
      >
        {ordered.map((p, i) => (
          <div
            key={p.id}
            className="card-in"
            style={{ animationDelay: `${Math.min(i, STAGGER_CAP) * STAGGER_STEP_MS}ms` }}
          >
            <ProjectCard
              project={p}
              categories={categories}
              active={active}
              mode={mode}
              dimmed={!matchesProfile(p, categories, active)}
              onOpen={onOpen}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

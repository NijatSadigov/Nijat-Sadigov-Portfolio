import { useState } from 'react'
import type { Project } from '../types'
import { ALL } from '../types'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'

function Grid({
  projects,
  dimmed,
  onOpen,
}: {
  projects: Project[]
  dimmed?: boolean
  onOpen: (p: Project) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} dimmed={dimmed} onOpen={onOpen} />
      ))}
    </div>
  )
}

export default function ProjectGrid({
  projects,
  active,
}: {
  projects: Project[]
  active: string
}) {
  const [selected, setSelected] = useState<Project | null>(null)

  if (projects.length === 0) {
    return <p className="mt-10 text-center font-mono text-sm text-faint">// no projects yet</p>
  }

  const matching =
    active === ALL ? projects : projects.filter((p) => p.categoryIds.includes(active))
  const others = active === ALL ? [] : projects.filter((p) => !p.categoryIds.includes(active))

  return (
    <>
      {matching.length > 0 ? (
        <Grid projects={matching} onOpen={setSelected} />
      ) : (
        <p className="font-mono text-sm text-faint">// nothing in this profile yet</p>
      )}

      {others.length > 0 && (
        <div className="mt-12">
          <div className="mb-6 flex items-center gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-faint">
              Other work
            </span>
            <span aria-hidden className="h-px flex-1 bg-line" />
          </div>
          <Grid projects={others} dimmed onOpen={setSelected} />
        </div>
      )}

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

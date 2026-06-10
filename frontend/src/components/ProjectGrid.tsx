import { useState } from 'react'
import type { Project } from '../types'
import { ALL } from '../types'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'

export default function ProjectGrid({
  projects,
  active,
}: {
  projects: Project[]
  active: string
}) {
  const [selected, setSelected] = useState<Project | null>(null)
  const inCategory = (p: Project) => active === ALL || p.categoryIds.includes(active)

  // For a category view: matching projects float to the top; others dim.
  const ordered =
    active === ALL
      ? projects
      : [...projects].sort((a, b) => Number(inCategory(b)) - Number(inCategory(a)))

  if (projects.length === 0) {
    return (
      <p className="mt-10 text-center font-mono text-sm text-slate-600">
        // no projects yet
      </p>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            dimmed={active !== ALL && !inCategory(p)}
            onOpen={setSelected}
          />
        ))}
      </div>

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

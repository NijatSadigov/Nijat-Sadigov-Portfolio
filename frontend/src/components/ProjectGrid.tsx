import type { Project } from '../types'
import { ALL } from '../types'
import ProjectCard from './ProjectCard'

export default function ProjectGrid({
  projects,
  active,
}: {
  projects: Project[]
  active: string
}) {
  const inCategory = (p: Project) => active === ALL || p.categoryIds.includes(active)

  // For a category view: matching projects float to the top; others dim.
  const ordered =
    active === ALL
      ? projects
      : [...projects].sort((a, b) => Number(inCategory(b)) - Number(inCategory(a)))

  if (projects.length === 0) {
    return (
      <p className="mt-10 text-center text-slate-500">
        No projects yet — add some from the admin dashboard.
      </p>
    )
  }

  return (
    <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-5 px-6 sm:grid-cols-2 lg:grid-cols-3">
      {ordered.map((p) => (
        <ProjectCard key={p.id} project={p} dimmed={active !== ALL && !inCategory(p)} />
      ))}
    </div>
  )
}

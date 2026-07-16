import type { CSSProperties } from 'react'
import { isProfileSlug, PROFILE_TOKENS, type Mode, type ProfileSlug } from './theme'
import type { Category, Project } from '../types'

// The project's own discipline — what it *is*, regardless of which profile is on.
export function ownSlug(project: Project, categories: Category[]): ProfileSlug {
  for (const id of project.categoryIds) {
    const slug = categories.find((c) => c.id === id)?.slug
    if (slug && isProfileSlug(slug)) return slug
  }
  return 'all'
}

export function matchesProfile(
  project: Project,
  categories: Category[],
  active: ProfileSlug,
): boolean {
  if (active === 'all') return true
  const cat = categories.find((c) => c.slug === active)
  return !!cat && project.categoryIds.includes(cat.id)
}

// Which token set a card wears:
//  - all view: its own discipline, so the grid reads as a mosaic
//  - profile view, matching: the active accent, so the page unifies
//  - profile view, non-matching: its own, since it stays on screen (dimmed) and
//    shouldn't masquerade as work from another discipline
export function themeSlug(
  project: Project,
  categories: Category[],
  active: ProfileSlug,
): ProfileSlug {
  if (active === 'all') return ownSlug(project, categories)
  return matchesProfile(project, categories, active) ? active : ownSlug(project, categories)
}

// Override the token vars only when a card differs from the ambient profile.
export function tokenStyle(slug: ProfileSlug, active: ProfileSlug, mode: Mode): CSSProperties {
  if (slug === active) return {}
  const t = PROFILE_TOKENS[slug]
  return {
    '--accent': t.accent[mode],
    '--accent-2': t.accent2[mode],
    '--font-head': t.headFont,
    '--radius': t.radius,
    '--head-caps': t.caps,
    '--head-track': t.track,
  } as CSSProperties
}

export function coverUrl(project: Project): string | undefined {
  const cover = project.images.find((i) => i.isCover) ?? project.images[0]
  return cover?.url
}

// Matching work floats to the top; the rest stays visible but dimmed. Featured
// first, then most-viewed.
export function orderProjects(
  projects: Project[],
  categories: Category[],
  active: ProfileSlug,
): Project[] {
  return [...projects].sort((a, b) => {
    const am = matchesProfile(a, categories, active)
    const bm = matchesProfile(b, categories, active)
    if (am !== bm) return am ? -1 : 1
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return b.viewCount - a.viewCount
  })
}

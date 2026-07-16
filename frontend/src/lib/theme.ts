// A profile is a swappable token set. The token values themselves live in
// index.css keyed by [data-theme][data-mode]; this module only decides which
// pair is active and carries the labels the UI needs.

export type ProfileSlug = 'all' | 'game' | 'software' | 'research'
export type Mode = 'dark' | 'light'

export const PROFILE_SLUGS: ProfileSlug[] = ['all', 'game', 'software', 'research']

export const PROFILE_META: Record<ProfileSlug, { label: string; short: string }> = {
  all: { label: 'All work', short: 'All' },
  game: { label: 'Game development', short: 'Game' },
  software: { label: 'Software development', short: 'Software' },
  research: { label: 'Academic research', short: 'Research' },
}

const MODE_KEY = 'portfolio.mode'
const PROFILE_KEY = 'portfolio.profile'

export function isProfileSlug(v: string): v is ProfileSlug {
  return (PROFILE_SLUGS as string[]).includes(v)
}

export function applyProfile(slug: ProfileSlug) {
  document.documentElement.dataset.theme = slug
  try {
    localStorage.setItem(PROFILE_KEY, slug)
  } catch {
    /* storage can be unavailable; theming still works for this session */
  }
}

export function applyMode(mode: Mode) {
  document.documentElement.dataset.mode = mode
  try {
    localStorage.setItem(MODE_KEY, mode)
  } catch {
    /* ignore */
  }
}

export function initialMode(): Mode {
  try {
    const saved = localStorage.getItem(MODE_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch {
    /* ignore */
  }
  const prefersLight =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: light)').matches
  return prefersLight ? 'light' : 'dark'
}

export function initialProfile(): ProfileSlug {
  try {
    const saved = localStorage.getItem(PROFILE_KEY)
    if (saved && isProfileSlug(saved)) return saved
  } catch {
    /* ignore */
  }
  return 'all'
}

// Timings for the profile sweep (from the design handoff).
export const SWEEP_TOTAL_MS = 860
export const SWEEP_SWAP_MS = 405
export const STAGGER_STEP_MS = 42
export const STAGGER_CAP = 14

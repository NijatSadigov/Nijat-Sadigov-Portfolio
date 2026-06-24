const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function monthYear(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function dateRange(start: string | null, end: string | null, isCurrent = false): string {
  const s = monthYear(start)
  const e = isCurrent ? 'Present' : monthYear(end)
  if (s && e) return `${s} – ${e}`
  return s || e || ''
}

export const ALL = 'all'

export function inActive(categoryIds: string[], active: string): boolean {
  return active === ALL || categoryIds.includes(active)
}

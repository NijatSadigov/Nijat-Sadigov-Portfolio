

export function hexToRgbTriple(hex: string): string {
  const m = hex.replace('#', '')
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  if ([r, g, b].some(Number.isNaN)) return '99 102 241'
  return `${r} ${g} ${b}`
}

export function applyTheme(theme: string, accentColor: string) {
  const root = document.documentElement
  root.setAttribute('data-theme', theme || 'default')
  root.style.setProperty('--accent', hexToRgbTriple(accentColor || '#6366f1'))
}

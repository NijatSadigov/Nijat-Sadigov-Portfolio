import { useEffect, useState } from 'react'

type Mode = 'dark' | 'light'

function current(): Mode {
  return document.documentElement.dataset.mode === 'light' ? 'light' : 'dark'
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>(current)

  useEffect(() => {
    document.documentElement.dataset.mode = mode
    try {
      localStorage.setItem('portfolio.mode', mode)
    } catch {
    }
  }, [mode])

  return (
    <button
      type="button"
      onClick={() => setMode((m) => (m === 'dark' ? 'light' : 'dark'))}
      aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={mode === 'dark' ? 'Light mode' : 'Dark mode'}
      className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-bg/40 text-sm text-muted backdrop-blur transition hover:border-accent hover:text-accent"
    >
      {mode === 'dark' ? '☀' : '☾'}
    </button>
  )
}

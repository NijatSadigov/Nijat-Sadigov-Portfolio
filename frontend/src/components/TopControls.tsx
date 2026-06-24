import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

export default function TopControls() {
  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-2">
      <ThemeToggle />
      <Link
        to="/admin"
        title="Admin"
        className="rounded-lg border border-line bg-bg/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-faint backdrop-blur transition hover:border-accent hover:text-accent"
      >
        ⚙ Admin
      </Link>
    </div>
  )
}

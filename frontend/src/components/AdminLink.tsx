import { Link } from 'react-router-dom'

// Discreet, always-present entry to the admin area (top-right corner).
export default function AdminLink() {
  return (
    <Link
      to="/admin"
      title="Admin"
      className="fixed right-4 top-4 z-50 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-500 backdrop-blur transition hover:border-accent hover:text-accent"
    >
      ⚙ Admin
    </Link>
  )
}

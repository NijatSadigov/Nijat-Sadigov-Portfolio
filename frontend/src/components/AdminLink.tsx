import { Link } from 'react-router-dom'

// Discreet, always-present entry to the admin area (top-right corner).
export default function AdminLink() {
  return (
    <Link
      to="/admin"
      title="Admin"
      className="fixed right-4 top-4 z-50 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-400 backdrop-blur transition hover:border-accent hover:text-accent"
    >
      ⚙ Admin
    </Link>
  )
}

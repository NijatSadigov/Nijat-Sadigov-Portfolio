import { Link } from 'react-router-dom'
import type { Profile, SocialLink } from '../types'

export default function Footer({
  profile,
  socialLinks,
}: {
  profile: Profile
  socialLinks: SocialLink[]
}) {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-900/40 py-10">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="theme-heading text-xl font-semibold text-white">Get in touch</h2>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="rounded-full bg-accent px-5 py-2 font-medium text-white transition hover:opacity-90"
            >
              Email me
            </a>
          )}
          {socialLinks.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-700 px-5 py-2 text-slate-200 transition hover:border-accent hover:text-accent"
            >
              {s.label || s.platform}
            </a>
          ))}
        </div>
        <p className="mt-8 text-xs text-slate-600">
          © {new Date().getFullYear()} {profile.fullName || 'Portfolio'} ·{' '}
          <Link to="/admin" className="hover:text-accent">
            Admin
          </Link>
        </p>
      </div>
    </footer>
  )
}

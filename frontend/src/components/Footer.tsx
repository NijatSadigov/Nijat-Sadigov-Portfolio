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
    <footer className="mt-28 border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="kicker">Get in touch</p>
        <h2 className="theme-heading mt-4 text-4xl font-bold text-ink sm:text-5xl">
          Let’s build something.
        </h2>

        {profile.email && (
          <a
            href={`mailto:${profile.email}`}
            className="mt-6 inline-block font-mono text-lg text-accent underline-offset-8 transition hover:underline sm:text-xl"
          >
            {profile.email}
          </a>
        )}

        {socialLinks.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {socialLinks.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-line px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-muted transition hover:border-accent hover:text-accent"
              >
                {s.label || s.platform}
              </a>
            ))}
          </div>
        )}

        <div className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 font-mono text-[11px] uppercase tracking-wider text-faint">
          <span>
            © {new Date().getFullYear()} {profile.fullName || 'Portfolio'}
          </span>
          <Link to="/admin" className="transition hover:text-accent">
            ⚙ Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}

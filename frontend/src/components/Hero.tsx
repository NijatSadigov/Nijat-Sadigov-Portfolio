import type { Profile, SocialLink } from '../types'

function Avatar({ profile }: { profile: Profile }) {
  const frame = (
    <span
      aria-hidden
      className="absolute -inset-1 translate-x-3 translate-y-3 rounded-2xl border border-accent/40 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2"
    />
  )
  if (profile.photoUrl) {
    return (
      <div className="group relative">
        {frame}
        <img
          src={profile.photoUrl}
          alt={profile.fullName}
          className="relative h-44 w-44 rounded-2xl border border-line object-cover sm:h-56 sm:w-56"
        />
      </div>
    )
  }
  const initials = profile.fullName
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
  return (
    <div className="group relative">
      {frame}
      <div className="relative grid h-44 w-44 place-items-center rounded-2xl border border-line bg-gradient-to-br from-accent/30 to-transparent font-display text-5xl font-bold text-ink sm:h-56 sm:w-56">
        {initials || 'NS'}
      </div>
    </div>
  )
}

export default function Hero({
  profile,
  socialLinks,
}: {
  profile: Profile
  socialLinks: SocialLink[]
}) {
  return (
    <header
      id="intro"
      className="mx-auto flex max-w-6xl scroll-mt-24 flex-col-reverse items-center gap-10 px-6 pt-20 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left"
    >
      <div className="max-w-2xl">
        {profile.openToWork && (
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Open to work
          </span>
        )}
        <p className="kicker">Software · Games · Research</p>

        <h1 className="theme-heading mt-4 bg-gradient-to-br from-ink via-ink to-[rgb(var(--accent))] bg-clip-text text-5xl font-bold leading-[1.05] tracking-tight text-transparent sm:text-6xl lg:text-7xl">
          {profile.fullName || 'Your Name'}
        </h1>

        {profile.headline && (
          <p className="mt-5 font-mono text-sm text-accent sm:text-base">
            {profile.headline}
            <span className="cursor-blink ml-1">▌</span>
          </p>
        )}

        {profile.bio && <p className="mt-5 leading-relaxed text-muted">{profile.bio}</p>}

        <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-1.5 font-mono text-xs text-faint sm:justify-start">
          {profile.location && <span>{profile.location}</span>}
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="transition hover:text-accent">
              {profile.email}
            </a>
          )}
          {profile.phone && <span>{profile.phone}</span>}
        </div>

        {socialLinks.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">
            {socialLinks.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-line bg-surface px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-muted transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
              >
                {s.label || s.platform}
              </a>
            ))}
          </div>
        )}
      </div>

      <Avatar profile={profile} />
    </header>
  )
}

import type { Profile, SocialLink } from '../types'

function Avatar({ profile }: { profile: Profile }) {
  if (profile.photoUrl) {
    return (
      <img
        src={profile.photoUrl}
        alt={profile.fullName}
        className="h-40 w-40 rounded-2xl object-cover ring-2 ring-accent/60 sm:h-48 sm:w-48"
      />
    )
  }
  const initials = profile.fullName
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
  return (
    <div className="grid h-40 w-40 place-items-center rounded-2xl bg-gradient-to-br from-accent/40 to-slate-800 text-4xl font-bold ring-2 ring-accent/60 sm:h-48 sm:w-48">
      {initials || '🙂'}
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
    <header className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 pt-16 text-center sm:flex-row sm:items-start sm:text-left">
      <Avatar profile={profile} />

      <div className="flex-1">
        <h1 className="theme-heading text-3xl font-bold sm:text-4xl">
          {profile.fullName || 'Your Name'}
        </h1>
        {profile.headline && (
          <p className="mt-2 text-lg text-accent">{profile.headline}</p>
        )}
        {profile.bio && (
          <p className="mt-4 max-w-2xl text-slate-300">{profile.bio}</p>
        )}

        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-slate-400 sm:justify-start">
          {profile.location && <span>📍 {profile.location}</span>}
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="hover:text-accent">
              ✉️ {profile.email}
            </a>
          )}
          {profile.phone && <span>📞 {profile.phone}</span>}
        </div>

        {socialLinks.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
            {socialLinks.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-200 transition hover:border-accent hover:text-accent"
              >
                {s.icon && <span className="mr-1">{s.icon}</span>}
                {s.label || s.platform}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}

import {
  ON_ACCENT,
  PROFILE_META,
  PROFILE_SLUGS,
  PROFILE_TOKENS,
  type Mode,
  type ProfileSlug,
} from '../lib/theme'

export default function Header({
  profile,
  mode,
  descriptions,
  onPick,
  onToggleMode,
}: {
  profile: ProfileSlug
  mode: Mode
  descriptions: Partial<Record<ProfileSlug, string>>
  onPick: (p: ProfileSlug) => void
  onToggleMode: () => void
}) {
  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        backdropFilter: 'blur(14px)',
        background: 'color-mix(in srgb, var(--bg) 78%, transparent)',
        borderColor: 'var(--border-2)',
      }}
    >
      <div className="shell flex items-center gap-5 py-[14px]">
        <a href="#top" className="flex shrink-0 items-center gap-3 text-text">
          <span
            className="grid h-[30px] w-[30px] place-items-center text-[15px] font-extrabold"
            style={{
              borderRadius: 'calc(var(--radius) * .6)',
              background: 'var(--accent)',
              color: 'var(--on-accent)',
              fontFamily: 'var(--font-head)',
              transition: 'background-color .6s var(--ease)',
            }}
          >
            N
          </span>
          <span className="text-[15px] font-bold tracking-[-.01em]">Nijat Sadigov</span>
        </a>

        <nav
          role="tablist"
          aria-label="Profile"
          className="ml-auto flex gap-1 p-1"
          style={{
            borderRadius: 'calc(var(--radius) + 4px)',
            background: 'var(--surface)',
            border: '1px solid var(--border-2)',
          }}
        >
          {PROFILE_SLUGS.map((slug) => {
            const active = slug === profile
            return (
              <button
                key={slug}
                role="tab"
                aria-selected={active}
                title={descriptions[slug] ?? PROFILE_META[slug].label}
                onClick={() => onPick(slug)}
                className="flex items-center gap-[7px] whitespace-nowrap px-[14px] py-2 text-[13.5px] font-semibold"
                style={{
                  borderRadius: 'calc(var(--radius) + 2px)',
                  transition: 'all .35s var(--ease)',
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? 'var(--on-accent)' : 'var(--dim)',
                }}
              >
                <span
                  aria-hidden="true"
                  className="inline-block h-[7px] w-[7px] shrink-0 rounded-[2px]"
                  style={{
                    background: active ? ON_ACCENT[mode] : PROFILE_TOKENS[slug].accent[mode],
                  }}
                />
                <span>{PROFILE_META[slug].short}</span>
              </button>
            )
          })}
        </nav>

        <button
          onClick={onToggleMode}
          aria-label="Toggle light and dark"
          className="grid h-[38px] w-[38px] shrink-0 place-items-center text-[15px]"
          style={{
            borderRadius: 'calc(var(--radius) * .7)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
          }}
        >
          {mode === 'dark' ? '☀' : '☾'}
        </button>
      </div>
    </header>
  )
}

import { PROFILE_META, PROFILE_TOKENS, type Mode, type ProfileSlug } from '../lib/theme'
import type { Category, Profile, Project, Resume } from '../types'

const LENSES: ProfileSlug[] = ['game', 'software', 'research']

export default function Hero({
  profile,
  categories,
  projects,
  resumes,
  active,
  mode,
  onPick,
}: {
  profile: Profile
  categories: Category[]
  projects: Project[]
  resumes: Resume[]
  active: ProfileSlug
  mode: Mode
  onPick: (p: ProfileSlug) => void
}) {
  const bySlug = (slug: ProfileSlug) => categories.find((c) => c.slug === slug)
  const activeCat = bySlug(active)

  // Kicker and lead come from real content: the category in a profile view,
  // the bio in the synthesis view.
  const kicker =
    active === 'all'
      ? LENSES.map((s) => PROFILE_META[s].short).join(' · ')
      : (activeCat?.name ?? PROFILE_META[active].label)
  const lead = active === 'all' ? profile.bio : (activeCat?.description ?? profile.bio)

  const resume =
    active === 'all'
      ? resumes.find((r) => r.isMain)
      : (resumes.find((r) => r.categoryId === activeCat?.id) ?? resumes.find((r) => r.isMain))
  const resumeLabel = active === 'all' ? 'Résumé (full)' : `Résumé — ${PROFILE_META[active].short}`

  return (
    <section
      className="relative overflow-hidden"
      style={{ padding: 'clamp(64px,11vw,140px) 0 clamp(48px,7vw,90px)' }}
    >
      <div
        aria-hidden="true"
        className="floaty pointer-events-none absolute"
        style={{
          top: '-20%',
          right: '-10%',
          width: 520,
          height: 520,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--accent) 30%, transparent), transparent 68%)',
          filter: 'blur(40px)',
        }}
      />

      <div
        className="relative z-[1] flex items-center justify-between"
        style={{ flexWrap: 'wrap-reverse', gap: 'clamp(28px,5vw,64px)' }}
      >
        <div className="max-w-[660px] flex-[1_1_460px]">
          {profile.headline && (
            <div className="mb-[26px] flex flex-wrap items-center gap-3 font-mono text-[13px] text-dim">
              <span className="text-accent">//</span>
              <span>{profile.headline}</span>
            </div>
          )}

          <h1
            className="m-0 mb-2 font-display font-medium"
            style={{
              fontSize: 'clamp(3rem,9vw,7.2rem)',
              lineHeight: 0.94,
              letterSpacing: '-.03em',
            }}
          >
            {profile.fullName}
          </h1>

          <div
            className="head mb-7 text-accent"
            style={{ fontSize: 'clamp(1.05rem,2.4vw,1.7rem)', transition: 'color .6s var(--ease)' }}
          >
            {kicker}
          </div>

          {lead && (
            <p
              className="mb-[38px] max-w-[640px] text-dim"
              style={{
                fontSize: 'clamp(1.1rem,2.1vw,1.5rem)',
                lineHeight: 1.5,
                textWrap: 'pretty',
              }}
            >
              {lead}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {resume && (
              <a
                href={resume.fileUrl}
                className="inline-flex items-center gap-[9px] px-[22px] py-[14px] text-[15px] font-bold"
                style={{
                  borderRadius: 'var(--radius)',
                  background: 'var(--accent)',
                  color: 'var(--on-accent)',
                }}
              >
                ↓ {resumeLabel}
              </a>
            )}
            <a
              href="#work"
              className="inline-flex items-center gap-[9px] px-[22px] py-[14px] text-[15px] font-semibold text-text"
              style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
            >
              View work →
            </a>
            <a href="#contact" className="px-2 py-[14px] text-[15px] font-semibold text-dim">
              Get in touch
            </a>
          </div>
        </div>

        <div className="w-full min-w-[230px] max-w-[340px] flex-[0_1_320px]">
          <div
            className="floaty relative overflow-hidden"
            style={{
              aspectRatio: '4/5',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: profile.photoUrl
                ? undefined
                : 'repeating-linear-gradient(135deg, var(--surface) 0 13px, var(--surface-2) 13px 26px)',
              boxShadow: '0 40px 70px -35px rgba(0,0,0,.65)',
            }}
          >
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.fullName}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center font-mono text-[12px] text-faint">
                portrait · 4:5
              </div>
            )}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0"
              style={{
                height: '42%',
                background:
                  'linear-gradient(transparent, color-mix(in srgb, var(--accent) 26%, transparent))',
              }}
            />
            <span
              aria-hidden="true"
              className="absolute left-3 top-3 h-[14px] w-[14px]"
              style={{ borderLeft: '2px solid var(--accent)', borderTop: '2px solid var(--accent)' }}
            />
            <span
              aria-hidden="true"
              className="absolute bottom-3 right-3 h-[14px] w-[14px]"
              style={{
                borderRight: '2px solid var(--accent)',
                borderBottom: '2px solid var(--accent)',
              }}
            />
          </div>
        </div>
      </div>

      <div
        className="relative z-[1] flex flex-wrap gap-[10px]"
        style={{ marginTop: 'clamp(48px,7vw,80px)' }}
      >
        {LENSES.map((slug, i) => {
          const cat = bySlug(slug)
          const count = cat ? projects.filter((p) => p.categoryIds.includes(cat.id)).length : 0
          const tok = PROFILE_TOKENS[slug]
          return (
            <button
              key={slug}
              onClick={() => onPick(slug)}
              className="card flex-[1_1_220px] text-left"
              style={{ padding: '22px 22px 24px' }}
            >
              <span className="mb-2 block font-mono text-[11px] text-faint">
                0{i + 1} / {count}
              </span>
              <span
                className="mb-1.5 block font-semibold"
                style={{
                  fontFamily: tok.headFont,
                  fontSize: 'clamp(1rem,1.8vw,1.35rem)',
                  color: tok.accent[mode],
                  textTransform: tok.caps as 'none' | 'uppercase',
                  letterSpacing: tok.track,
                }}
              >
                {cat?.name ?? PROFILE_META[slug].label}
              </span>
              <span className="block text-[13.5px] leading-[1.45] text-dim">{cat?.description}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

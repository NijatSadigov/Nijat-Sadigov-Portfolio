import { ON_ACCENT, PROFILE_META, PROFILE_TOKENS, type Mode, type ProfileSlug } from '../lib/theme'

// The signature moment: the incoming profile's accent wipes across the screen
// while the tokens swap underneath at the midpoint.
export default function SweepOverlay({
  next,
  mode,
}: {
  next: ProfileSlug | null
  mode: Mode
}) {
  if (!next) return null
  return (
    <div
      aria-hidden="true"
      className="sweep fixed inset-0 z-[80] grid place-items-center"
      style={{ background: PROFILE_TOKENS[next].accent[mode], color: ON_ACCENT[mode] }}
    >
      <div
        className="sweep-text uppercase"
        style={{
          fontFamily: PROFILE_TOKENS[next].headFont,
          fontSize: 'clamp(2rem, 7vw, 6rem)',
          letterSpacing: '-.02em',
        }}
      >
        {PROFILE_META[next].label}
      </div>
    </div>
  )
}

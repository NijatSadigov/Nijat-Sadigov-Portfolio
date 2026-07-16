import type { CSSProperties } from 'react'
import type { ProfileSlug } from './theme'

// Projects without a cover image get a generated one instead of an empty slot.
// It's deterministic (seeded from the slug) so a card always looks the same, and
// themed by the project's own discipline.

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export interface GeneratedCover {
  background: string
  overlay: CSSProperties
  glyph: string
}

export function generatedCover(
  slug: string,
  title: string,
  kind: ProfileSlug,
): GeneratedCover {
  const h = hash(slug)

  if (kind === 'game') {
    const s = 12 + (h % 3) * 6
    return {
      background: `repeating-linear-gradient(45deg, color-mix(in oklch, var(--accent) 82%, transparent) 0 ${s}px, transparent ${s}px ${s * 2}px), repeating-linear-gradient(-45deg, color-mix(in oklch, var(--accent-2) 60%, transparent) 0 ${s}px, transparent ${s}px ${s * 2}px), var(--surface-2)`,
      overlay: {
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'var(--font-pixel)',
        fontSize: 'clamp(1.6rem, 5vw, 3rem)',
        color: 'var(--text)',
        textShadow: '3px 3px 0 color-mix(in srgb, #000 40%, transparent)',
        textTransform: 'uppercase',
      },
      glyph: title.slice(0, 2),
    }
  }

  if (kind === 'software') {
    return {
      background: `radial-gradient(circle at ${25 + (h % 50)}% ${25 + (h % 40)}%, color-mix(in oklch, var(--accent) 42%, transparent), transparent 62%), repeating-linear-gradient(0deg, var(--border) 0 1px, transparent 1px 26px), repeating-linear-gradient(90deg, var(--border) 0 1px, transparent 1px 26px), var(--surface-2)`,
      overlay: {
        display: 'flex',
        alignItems: 'flex-end',
        padding: 16,
        fontFamily: 'var(--font-mono)',
        fontSize: 'clamp(.9rem, 2.4vw, 1.3rem)',
        color: 'color-mix(in srgb, var(--accent) 85%, var(--text))',
      },
      glyph: `~/ ${slug}`,
    }
  }

  if (kind === 'research') {
    return {
      background: `repeating-linear-gradient(0deg, transparent 0 27px, var(--border) 27px 28px), var(--surface-2)`,
      overlay: {
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: 'clamp(2.4rem, 7vw, 4.5rem)',
        color: 'color-mix(in srgb, var(--accent) 78%, var(--text))',
      },
      glyph: title.slice(0, 1),
    }
  }

  // mixed / all
  return {
    background: `radial-gradient(circle at ${22 + (h % 28)}% 24%, color-mix(in oklch, var(--accent) 58%, transparent), transparent 46%), radial-gradient(circle at 78% 74%, color-mix(in oklch, var(--accent-2) 46%, transparent), transparent 44%), var(--surface-2)`,
    overlay: {
      display: 'grid',
      placeItems: 'center',
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(2.2rem, 6vw, 4rem)',
      color: 'color-mix(in srgb, var(--text) 30%, transparent)',
    },
    glyph: title.slice(0, 1),
  }
}

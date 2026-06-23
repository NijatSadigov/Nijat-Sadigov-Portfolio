import { useEffect, useState } from 'react'

export type NavItem = { id: string; label: string }

/**
 * Fixed left-edge navigation rail: a labelled tick per section. Clicking
 * smooth-scrolls to it; the tick for the section you're currently viewing
 * stays expanded + accented (scroll-spy via IntersectionObserver). Labels for
 * the other sections reveal when you hover the rail. Desktop only.
 */
export default function SectionNav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '')

  useEffect(() => {
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((e): e is HTMLElement => !!e)
    if (els.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length) setActive(visible[0].target.id)
      },
      // a thin band ~one-third down the viewport decides the "current" section
      { rootMargin: '-32% 0px -60% 0px', threshold: 0 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [items])

  const go = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <nav
      aria-label="Sections"
      className="group fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2.5 min-[1400px]:flex"
    >
      {items.map((it) => {
        const on = active === it.id
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => go(it.id)}
            aria-current={on ? 'true' : undefined}
            className="flex items-center gap-3 py-0.5"
          >
            <span
              className={`h-0.5 rounded-full transition-all duration-300 ${
                on ? 'w-8 bg-accent' : 'w-4 bg-line group-hover:bg-muted'
              }`}
            />
            <span
              className={`whitespace-nowrap font-mono text-[11px] uppercase tracking-wider transition-colors duration-300 ${
                on ? 'text-accent' : 'text-faint hover:text-muted'
              }`}
            >
              {it.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

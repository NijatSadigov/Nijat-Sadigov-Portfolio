import type { Category } from '../types'
import { ALL } from '../types'
import type { DiceDir } from './DiceScene'

function dirForIndex(i: number, n: number): DiceDir {
  if (n <= 1) return 'down'
  if (i === 0) return 'down-left'
  if (i === n - 1) return 'down-right'
  return 'down'
}

function buttonClass(active: boolean) {
  return [
    'w-full rounded-lg border px-5 py-3.5 font-mono text-xs uppercase tracking-[0.18em] transition-all duration-200',
    active
      ? 'border-accent bg-accent/10 text-accent shadow-[0_0_28px_-6px_rgb(var(--accent))]'
      : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/30 hover:text-white',
  ].join(' ')
}

export default function CategoryButtons({
  categories,
  active,
  onSelect,
}: {
  categories: Category[]
  active: string
  onSelect: (id: string, direction: DiceDir) => void
}) {
  return (
    <div className="mx-auto mt-16 max-w-3xl px-6">
      <div className="flex justify-center">
        <button
          type="button"
          aria-pressed={active === ALL}
          onClick={() => onSelect(ALL, 'up')}
          className={`${buttonClass(active === ALL)} sm:w-60`}
        >
          ◈ All
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {categories.map((c, i) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={active === c.id}
            onClick={() => onSelect(c.id, dirForIndex(i, categories.length))}
            className={buttonClass(active === c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  )
}

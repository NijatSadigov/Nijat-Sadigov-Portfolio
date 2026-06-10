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
    'w-full rounded-xl border px-5 py-3 text-sm font-semibold transition-all duration-200',
    active
      ? 'border-accent bg-accent/15 text-accent shadow-[0_0_20px_-4px_rgb(var(--accent))]'
      : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-accent/60 hover:text-white',
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
    <div className="mx-auto mt-14 max-w-3xl px-6">
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => onSelect(ALL, 'up')}
          className={`${buttonClass(active === ALL)} sm:w-56`}
        >
          All
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {categories.map((c, i) => (
          <button
            key={c.id}
            type="button"
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

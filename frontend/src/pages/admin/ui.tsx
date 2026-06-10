import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { Category } from '../../types'

export const inputCls =
  'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-accent'

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm text-slate-300">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  )
}

export function TInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    />
  )
}

export function TArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    />
  )
}

export function Btn({
  children,
  onClick,
  type = 'button',
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
    >
      {children}
    </button>
  )
}

export function GhostBtn({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-sm transition ${
        danger
          ? 'border-slate-700 hover:border-red-500 hover:text-red-400'
          : 'border-slate-700 hover:border-accent hover:text-accent'
      }`}
    >
      {children}
    </button>
  )
}

export function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      {title && <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>}
      {children}
    </div>
  )
}

export function CategoryPicker({
  categories,
  selected,
  onChange,
}: {
  categories: Category[]
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((c) => c !== id) : [...selected, id])
  return (
    <div className="flex flex-wrap gap-3 text-sm text-slate-300">
      {categories.map((c) => (
        <label key={c.id} className="flex items-center gap-1.5">
          <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} />
          {c.name}
        </label>
      ))}
    </div>
  )
}

/** Loads categories once for admin forms. */
export function useCategories(): Category[] {
  const [cats, setCats] = useState<Category[]>([])
  useEffect(() => {
    api.getCategories().then(setCats).catch(() => {})
  }, [])
  return cats
}

export async function uploadFile(file: File): Promise<string> {
  const { url } = await api.upload(file)
  return url
}

// ── date helpers (backend wants RFC3339; <input type=date> gives YYYY-MM-DD) ──
// Accepts either "YYYY-MM-DD" or a full ISO string and normalises to RFC3339.
export const toApiDate = (v: string): string | null =>
  v ? new Date(v.slice(0, 10) + 'T00:00:00Z').toISOString() : null
export const toDateInput = (iso: string | null): string => (iso ? iso.slice(0, 10) : '')

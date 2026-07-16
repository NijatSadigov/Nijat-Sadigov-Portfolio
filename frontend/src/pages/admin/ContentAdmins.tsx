import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { dateRange, monthYear } from '../../lib/format'
import type {
  Category,
  ContactMessage,
  Education,
  Experience,
  Profile,
  Resume,
  Skill,
  SocialLink,
} from '../../types'
import {
  Btn,
  CategoryPicker,
  Field,
  GhostBtn,
  Panel,
  TArea,
  TInput,
  inputCls,
  toApiDate,
  toDateInput,
  uploadFile,
} from './ui'

// ── Skills ──

export function SkillsAdmin({ categories }: { categories: Category[] }) {
  const empty = { name: '', level: 0, icon: '', categoryIds: [] as string[] }
  const [items, setItems] = useState<Skill[]>([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)

  const reload = () => api.listSkills().then(setItems)
  useEffect(() => {
    reload()
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) await api.updateSkill(editingId, form)
    else await api.createSkill(form)
    setForm(empty)
    setEditingId(null)
    reload()
  }

  return (
    <div className="space-y-5">
      <Panel title={editingId ? 'Edit skill' : 'New skill'}>
        <form onSubmit={save} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Name">
              <TInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            </Field>
            <Field label="Level (0–100)">
              <input
                type="number"
                min={0}
                max={100}
                value={form.level}
                onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
                className={inputCls}
              />
            </Field>
            <Field label="Icon (emoji)">
              <TInput value={form.icon} onChange={(v) => setForm({ ...form, icon: v })} />
            </Field>
          </div>
          <Field label="Categories">
            <CategoryPicker
              categories={categories}
              selected={form.categoryIds}
              onChange={(ids) => setForm({ ...form, categoryIds: ids })}
            />
          </Field>
          <div className="flex gap-2">
            <Btn type="submit">{editingId ? 'Update' : 'Add'}</Btn>
            {editingId && (
              <GhostBtn
                onClick={() => {
                  setForm(empty)
                  setEditingId(null)
                }}
              >
                Cancel
              </GhostBtn>
            )}
          </div>
        </form>
      </Panel>

      <ul className="flex flex-wrap gap-2">
        {items.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-1.5 text-sm"
          >
            <span className="text-white">
              {s.icon} {s.name} {s.level > 0 && <span className="text-accent">{s.level}%</span>}
            </span>
            <button
              onClick={() => {
                setForm({ name: s.name, level: s.level, icon: s.icon, categoryIds: s.categoryIds })
                setEditingId(s.id)
              }}
              className="text-slate-400 hover:text-accent"
            >
              edit
            </button>
            <button
              onClick={async () => {
                await api.deleteSkill(s.id)
                reload()
              }}
              className="text-slate-400 hover:text-red-400"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Achievements ──

export function AchievementsAdmin({ categories }: { categories: Category[] }) {
  const empty = { title: '', description: '', achievedOn: '', categoryIds: [] as string[] }
  const [items, setItems] = useState(() => [] as Awaited<ReturnType<typeof api.listAchievements>>)
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)

  const reload = () => api.listAchievements().then(setItems)
  useEffect(() => {
    reload()
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title: form.title,
      description: form.description,
      achievedOn: toApiDate(form.achievedOn),
      categoryIds: form.categoryIds,
    }
    if (editingId) await api.updateAchievement(editingId, payload)
    else await api.createAchievement(payload)
    setForm(empty)
    setEditingId(null)
    reload()
  }

  return (
    <div className="space-y-5">
      <Panel title={editingId ? 'Edit achievement' : 'New achievement'}>
        <form onSubmit={save} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title">
              <TInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={form.achievedOn}
                onChange={(e) => setForm({ ...form, achievedOn: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Description">
            <TArea value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} />
          </Field>
          <Field label="Categories">
            <CategoryPicker
              categories={categories}
              selected={form.categoryIds}
              onChange={(ids) => setForm({ ...form, categoryIds: ids })}
            />
          </Field>
          <div className="flex gap-2">
            <Btn type="submit">{editingId ? 'Update' : 'Add'}</Btn>
            {editingId && (
              <GhostBtn onClick={() => { setForm(empty); setEditingId(null) }}>Cancel</GhostBtn>
            )}
          </div>
        </form>
      </Panel>

      <ul className="space-y-2">
        {items.map((a) => (
          <li
            key={a.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3"
          >
            <div>
              <p className="font-medium text-white">
                {a.title} {a.achievedOn && <span className="text-xs text-slate-500">· {monthYear(a.achievedOn)}</span>}
              </p>
              {a.description && <p className="text-xs text-slate-500">{a.description}</p>}
            </div>
            <div className="flex gap-2">
              <GhostBtn
                onClick={() => {
                  setForm({
                    title: a.title,
                    description: a.description,
                    achievedOn: toDateInput(a.achievedOn),
                    categoryIds: a.categoryIds,
                  })
                  setEditingId(a.id)
                }}
              >
                Edit
              </GhostBtn>
              <GhostBtn danger onClick={async () => { await api.deleteAchievement(a.id); reload() }}>
                Delete
              </GhostBtn>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Education ──

export function EducationAdmin() {
  const empty: Omit<Education, 'id'> = {
    institution: '', degree: '', field: '', description: '', location: '',
    startDate: '', endDate: '', isCurrent: false, sortOrder: 0,
  }
  const [items, setItems] = useState<Education[]>([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)

  const reload = () => api.listEducation().then(setItems)
  useEffect(() => { reload() }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form, startDate: toApiDate(form.startDate || ''), endDate: toApiDate(form.endDate || '') }
    if (editingId) await api.updateEducation(editingId, payload)
    else await api.createEducation(payload)
    setForm(empty)
    setEditingId(null)
    reload()
  }

  return (
    <div className="space-y-5">
      <Panel title={editingId ? 'Edit education' : 'New education'}>
        <form onSubmit={save} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Institution"><TInput value={form.institution} onChange={(v) => setForm({ ...form, institution: v })} /></Field>
            <Field label="Location"><TInput value={form.location} onChange={(v) => setForm({ ...form, location: v })} /></Field>
            <Field label="Degree"><TInput value={form.degree} onChange={(v) => setForm({ ...form, degree: v })} /></Field>
            <Field label="Field"><TInput value={form.field} onChange={(v) => setForm({ ...form, field: v })} /></Field>
            <Field label="Start"><input type="date" value={toDateInput(form.startDate)} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputCls} /></Field>
            <Field label="End"><input type="date" value={toDateInput(form.endDate)} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputCls} /></Field>
          </div>
          <Field label="Description"><TArea value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} /></Field>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={form.isCurrent} onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })} />
            Currently studying here
          </label>
          <div className="flex gap-2">
            <Btn type="submit">{editingId ? 'Update' : 'Add'}</Btn>
            {editingId && <GhostBtn onClick={() => { setForm(empty); setEditingId(null) }}>Cancel</GhostBtn>}
          </div>
        </form>
      </Panel>

      <ul className="space-y-2">
        {items.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <div>
              <p className="font-medium text-white">{e.institution} <span className="text-xs text-slate-500">{dateRange(e.startDate, e.endDate, e.isCurrent)}</span></p>
              <p className="text-xs text-slate-500">{[e.degree, e.field].filter(Boolean).join(', ')}</p>
            </div>
            <div className="flex gap-2">
              <GhostBtn onClick={() => { setForm({ ...e }); setEditingId(e.id) }}>Edit</GhostBtn>
              <GhostBtn danger onClick={async () => { await api.deleteEducation(e.id); reload() }}>Delete</GhostBtn>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Experience ──

export function ExperienceAdmin() {
  const empty: Omit<Experience, 'id'> = {
    company: '', role: '', location: '', description: '',
    startDate: '', endDate: '', isCurrent: false, sortOrder: 0,
    referenceUrl: '', referenceLabel: '',
  }
  const [items, setItems] = useState<Experience[]>([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)

  const reload = () => api.listExperience().then(setItems)
  useEffect(() => { reload() }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form, startDate: toApiDate(form.startDate || ''), endDate: toApiDate(form.endDate || '') }
    if (editingId) await api.updateExperience(editingId, payload)
    else await api.createExperience(payload)
    setForm(empty)
    setEditingId(null)
    reload()
  }

  return (
    <div className="space-y-5">
      <Panel title={editingId ? 'Edit experience' : 'New experience'}>
        <form onSubmit={save} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Company"><TInput value={form.company} onChange={(v) => setForm({ ...form, company: v })} /></Field>
            <Field label="Role"><TInput value={form.role} onChange={(v) => setForm({ ...form, role: v })} /></Field>
            <Field label="Location"><TInput value={form.location} onChange={(v) => setForm({ ...form, location: v })} /></Field>
            <div />
            <Field label="Start"><input type="date" value={toDateInput(form.startDate)} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputCls} /></Field>
            <Field label="End"><input type="date" value={toDateInput(form.endDate)} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputCls} /></Field>
          </div>
          <Field label="Description (Markdown)"><TArea value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={3} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Reference label">
              <TInput value={form.referenceLabel} onChange={(v) => setForm({ ...form, referenceLabel: v })} placeholder="e.g. Internship Certificate" />
            </Field>
            <Field label="Reference file (letter / certificate)">
              <div className="flex items-center gap-3">
                {form.referenceUrl && (
                  <a href={form.referenceUrl} target="_blank" rel="noreferrer" className="text-sm text-accent">view</a>
                )}
                <label className="cursor-pointer rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:border-accent">
                  Upload
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files?.[0]) setForm({ ...form, referenceUrl: await uploadFile(e.target.files[0]) })
                    }}
                  />
                </label>
              </div>
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={form.isCurrent} onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })} />
            Current role
          </label>
          <div className="flex gap-2">
            <Btn type="submit">{editingId ? 'Update' : 'Add'}</Btn>
            {editingId && <GhostBtn onClick={() => { setForm(empty); setEditingId(null) }}>Cancel</GhostBtn>}
          </div>
        </form>
      </Panel>

      <ul className="space-y-2">
        {items.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <div>
              <p className="font-medium text-white">{e.role} · {e.company} <span className="text-xs text-slate-500">{dateRange(e.startDate, e.endDate, e.isCurrent)}</span></p>
              {e.location && <p className="text-xs text-slate-500">{e.location}</p>}
            </div>
            <div className="flex gap-2">
              <GhostBtn onClick={() => { setForm({ ...e }); setEditingId(e.id) }}>Edit</GhostBtn>
              <GhostBtn danger onClick={async () => { await api.deleteExperience(e.id); reload() }}>Delete</GhostBtn>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Résumés ──

export function ResumesAdmin({ categories }: { categories: Category[] }) {
  const [items, setItems] = useState<Resume[]>([])
  const [target, setTarget] = useState('main')
  const [label, setLabel] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [busy, setBusy] = useState(false)

  const reload = () => api.listResumes().then(setItems)
  useEffect(() => { reload() }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fileUrl) return
    await api.createResume({
      categoryId: target === 'main' ? null : target,
      label,
      fileUrl,
      isMain: target === 'main',
    })
    setLabel('')
    setFileUrl('')
    setTarget('main')
    reload()
  }

  const labelFor = (r: Resume) =>
    r.isMain ? 'Main (ALL)' : categories.find((c) => c.id === r.categoryId)?.name ?? 'Standalone'

  return (
    <div className="space-y-5">
      <Panel title="Upload résumé">
        <form onSubmit={save} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Applies to">
              <select value={target} onChange={(e) => setTarget(e.target.value)} className={inputCls}>
                <option value="main">Main (ALL view)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Label (optional)">
              <TInput value={label} onChange={setLabel} placeholder="e.g. 2026 résumé" />
            </Field>
          </div>
          <Field label="PDF / file">
            <div className="flex items-center gap-3">
              {fileUrl && <a href={fileUrl} target="_blank" rel="noreferrer" className="text-sm text-accent">preview</a>}
              <label className="cursor-pointer rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:border-accent">
                {busy ? 'Uploading…' : 'Choose file'}
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files?.[0]) {
                      setBusy(true)
                      try { setFileUrl(await uploadFile(e.target.files[0])) } finally { setBusy(false) }
                    }
                  }}
                />
              </label>
            </div>
          </Field>
          <Btn type="submit" disabled={!fileUrl}>Save résumé</Btn>
        </form>
      </Panel>

      <ul className="space-y-2">
        {items.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <div>
              <p className="font-medium text-white">{labelFor(r)} {r.label && <span className="text-xs text-slate-500">· {r.label}</span>}</p>
              <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-accent">open file</a>
            </div>
            <GhostBtn danger onClick={async () => { await api.deleteResume(r.id); reload() }}>Delete</GhostBtn>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Messages ──

export function MessagesAdmin() {
  const [items, setItems] = useState<ContactMessage[]>([])
  const reload = () => api.listMessages().then(setItems)
  useEffect(() => { reload() }, [])

  if (items.length === 0) return <p className="text-slate-500">No messages yet.</p>

  return (
    <ul className="space-y-3">
      {items.map((m) => (
        <li
          key={m.id}
          className={`rounded-xl border p-4 ${m.isRead ? 'border-slate-800 bg-slate-900/40' : ''}`}
          style={
            m.isRead
              ? undefined
              : {
                  // --accent is an oklch var, so blend rather than use /alpha
                  borderColor: 'color-mix(in srgb, var(--accent) 40%, transparent)',
                  background: 'color-mix(in srgb, var(--accent) 5%, transparent)',
                }
          }
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-white">{m.name} <span className="text-xs text-slate-500">· {m.email}</span></p>
              {m.subject && <p className="text-sm text-slate-300">{m.subject}</p>}
            </div>
            <span className="text-xs text-slate-500">{monthYear(m.createdAt)}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{m.message}</p>
          <div className="mt-3 flex gap-2">
            {!m.isRead && <GhostBtn onClick={async () => { await api.markMessageRead(m.id); reload() }}>Mark read</GhostBtn>}
            <GhostBtn danger onClick={async () => { await api.deleteMessage(m.id); reload() }}>Delete</GhostBtn>
          </div>
        </li>
      ))}
    </ul>
  )
}

// ── Profile & social links ──

const emptyProfile: Profile = {
  fullName: '', headline: '', bio: '', photoUrl: '', email: '', phone: '', location: '',
  openToWork: false, updatedAt: '',
}

export function ProfileAdmin() {
  const [profile, setProfile] = useState<Profile>(emptyProfile)
  const [links, setLinks] = useState<SocialLink[]>([])
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.getProfile().then((r) => { setProfile(r.profile); setLinks(r.socialLinks) }).catch(() => {})
  }, [])

  const set = (k: keyof Profile, v: string) => setProfile({ ...profile, [k]: v })

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setProfile(await api.updateProfile(profile))
      setMsg('Profile saved.')
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Save failed')
    }
  }

  const saveLinks = async () => {
    setLinks(await api.replaceSocialLinks(links))
    setMsg('Links saved.')
  }

  const addLink = () =>
    setLinks([...links, { id: crypto.randomUUID(), platform: '', label: '', url: '', icon: '', sortOrder: links.length }])

  return (
    <div className="space-y-6">
      {msg && <p className="text-sm text-accent">{msg}</p>}

      <Panel title="Profile">
        <form onSubmit={saveProfile} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name"><TInput value={profile.fullName} onChange={(v) => set('fullName', v)} /></Field>
            <Field label="Headline"><TInput value={profile.headline} onChange={(v) => set('headline', v)} /></Field>
          </div>
          <Field label="Bio"><TArea value={profile.bio} onChange={(v) => set('bio', v)} rows={3} /></Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Email"><TInput value={profile.email} onChange={(v) => set('email', v)} /></Field>
            <Field label="Phone"><TInput value={profile.phone} onChange={(v) => set('phone', v)} /></Field>
            <Field label="Location"><TInput value={profile.location} onChange={(v) => set('location', v)} /></Field>
          </div>
          <Field label="Photo">
            <div className="flex items-center gap-3">
              {profile.photoUrl && <img src={profile.photoUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />}
              <label className="cursor-pointer rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:border-accent">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => { if (e.target.files?.[0]) set('photoUrl', await uploadFile(e.target.files[0])) }}
                />
              </label>
            </div>
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={profile.openToWork}
              onChange={(e) => setProfile({ ...profile, openToWork: e.target.checked })}
            />
            Show “Open to work” badge in the hero
          </label>
          <Btn type="submit">Save profile</Btn>
        </form>
      </Panel>

      <Panel title="Social links">
        <div className="space-y-3">
          {links.map((l, i) => (
            <div key={l.id} className="grid items-center gap-2 sm:grid-cols-[1fr_1fr_2fr_auto]">
              <TInput value={l.platform} onChange={(v) => setLinks(links.map((x, j) => (j === i ? { ...x, platform: v } : x)))} placeholder="github" />
              <TInput value={l.icon} onChange={(v) => setLinks(links.map((x, j) => (j === i ? { ...x, icon: v } : x)))} placeholder="icon (emoji)" />
              <TInput value={l.url} onChange={(v) => setLinks(links.map((x, j) => (j === i ? { ...x, url: v } : x)))} placeholder="https://…" />
              <GhostBtn danger onClick={() => setLinks(links.filter((_, j) => j !== i))}>✕</GhostBtn>
            </div>
          ))}
          <div className="flex gap-2">
            <GhostBtn onClick={addLink}>＋ Add link</GhostBtn>
            <Btn onClick={saveLinks}>Save links</Btn>
          </div>
        </div>
      </Panel>
    </div>
  )
}

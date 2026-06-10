import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { Category, Project } from '../../types'
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

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export default function ProjectsAdmin({ categories }: { categories: Category[] }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [editing, setEditing] = useState<Project | 'new' | null>(null)
  const [msg, setMsg] = useState('')

  const reload = async () => {
    const list = await api.adminListProjects()
    setProjects(list)
    setEditing((prev) =>
      prev && prev !== 'new' ? (list.find((p) => p.id === prev.id) ?? null) : prev,
    )
  }
  useEffect(() => {
    reload().catch((e) => setMsg(e.message))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Projects ({projects.length})</h2>
        <Btn onClick={() => setEditing('new')}>＋ New project</Btn>
      </div>
      {msg && <p className="text-sm text-accent">{msg}</p>}

      {editing && (
        <ProjectEditor
          key={editing === 'new' ? 'new' : editing.id}
          project={editing === 'new' ? null : editing}
          categories={categories}
          onSaved={() => {
            setMsg('Saved.')
            reload()
          }}
          onClose={() => setEditing(null)}
          onChanged={reload}
        />
      )}

      <ul className="space-y-2">
        {projects.map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3"
          >
            <div>
              <p className="font-medium text-white">
                {p.title} <span className="text-xs text-slate-500">/{p.slug}</span>
              </p>
              <p className="text-xs text-slate-500">
                {p.status} · {p.images.length} image(s) · {p.categoryIds.length} categor(ies)
                {p.featured && ' · ★ featured'}
              </p>
            </div>
            <div className="flex gap-2">
              <GhostBtn onClick={() => setEditing(p)}>Edit</GhostBtn>
              <GhostBtn
                danger
                onClick={async () => {
                  if (confirm(`Delete “${p.title}”?`)) {
                    await api.deleteProject(p.id)
                    reload()
                  }
                }}
              >
                Delete
              </GhostBtn>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ProjectEditor({
  project,
  categories,
  onSaved,
  onClose,
  onChanged,
}: {
  project: Project | null
  categories: Category[]
  onSaved: () => void
  onClose: () => void
  onChanged: () => void
}) {
  const [title, setTitle] = useState(project?.title ?? '')
  const [slug, setSlug] = useState(project?.slug ?? '')
  const [summary, setSummary] = useState(project?.summary ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [repoUrl, setRepoUrl] = useState(project?.repoUrl ?? '')
  const [demoUrl, setDemoUrl] = useState(project?.demoUrl ?? '')
  const [demoType, setDemoType] = useState<Project['demoType']>(project?.demoType ?? 'none')
  const [demoGuide, setDemoGuide] = useState(project?.demoGuide ?? '')
  const [status, setStatus] = useState<Project['status']>(project?.status ?? 'draft')
  const [featured, setFeatured] = useState(project?.featured ?? false)
  const [startedOn, setStartedOn] = useState(toDateInput(project?.startedOn ?? null))
  const [endedOn, setEndedOn] = useState(toDateInput(project?.endedOn ?? null))
  const [categoryIds, setCategoryIds] = useState<string[]>(project?.categoryIds ?? [])
  const [techStr, setTechStr] = useState((project?.tech ?? []).join(', '))
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    const payload = {
      title,
      slug: slug || slugify(title),
      summary,
      description,
      repoUrl,
      demoUrl,
      demoType,
      demoGuide,
      status,
      featured,
      startedOn: toApiDate(startedOn),
      endedOn: toApiDate(endedOn),
      categoryIds,
      tech: techStr.split(',').map((t) => t.trim()).filter(Boolean),
    }
    try {
      if (project) await api.updateProject(project.id, payload)
      else await api.createProject(payload)
      onSaved()
      if (!project) onClose()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Panel title={project ? `Edit: ${project.title}` : 'New project'}>
      <form onSubmit={save} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title">
            <TInput value={title} onChange={setTitle} placeholder="Project title" />
          </Field>
          <Field label="Slug (URL)">
            <TInput value={slug} onChange={setSlug} placeholder="auto from title" />
          </Field>
        </div>

        <Field label="Summary (card blurb)">
          <TArea value={summary} onChange={setSummary} rows={2} />
        </Field>
        <Field label="Description (Markdown)">
          <TArea value={description} onChange={setDescription} rows={5} />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Repo URL">
            <TInput value={repoUrl} onChange={setRepoUrl} placeholder="https://github.com/…" />
          </Field>
          <Field label="Demo URL">
            <TInput value={demoUrl} onChange={setDemoUrl} placeholder="https://…" />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Demo type">
            <select
              value={demoType}
              onChange={(e) => setDemoType(e.target.value as Project['demoType'])}
              className={inputCls}
            >
              <option value="none">None</option>
              <option value="link">Live link</option>
              <option value="embed">Embedded build</option>
              <option value="video">Video</option>
            </select>
          </Field>
          <Field label="Tech (comma separated)">
            <TInput value={techStr} onChange={setTechStr} placeholder="Go, React, Postgres" />
          </Field>
        </div>

        <Field label="Demo / usage guide (Markdown)">
          <TArea value={demoGuide} onChange={setDemoGuide} rows={3} />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Started on">
            <input type="date" value={startedOn} onChange={(e) => setStartedOn(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Ended on">
            <input type="date" value={endedOn} onChange={(e) => setEndedOn(e.target.value)} className={inputCls} />
          </Field>
        </div>

        <Field label="Categories">
          <CategoryPicker categories={categories} selected={categoryIds} onChange={setCategoryIds} />
        </Field>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Featured
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Project['status'])}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {err && <p className="text-sm text-red-400">{err}</p>}
        <div className="flex gap-2">
          <Btn type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save project'}
          </Btn>
          <GhostBtn onClick={onClose}>Close</GhostBtn>
        </div>
      </form>

      {project && <ImageManager project={project} onChanged={onChanged} />}
    </Panel>
  )
}

function ImageManager({ project, onChanged }: { project: Project; onChanged: () => void }) {
  const [busy, setBusy] = useState(false)

  const add = async (file: File) => {
    setBusy(true)
    try {
      const url = await uploadFile(file)
      await api.addProjectImage(project.id, { url, isCover: project.images.length === 0 })
      onChanged()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-6 border-t border-slate-800 pt-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-white">Images ({project.images.length})</h4>
        <label className="cursor-pointer rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:border-accent">
          {busy ? 'Uploading…' : '＋ Upload image'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && add(e.target.files[0])}
          />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {project.images.map((img) => (
          <div key={img.id} className="overflow-hidden rounded-lg border border-slate-800">
            <img src={img.url} alt="" className="aspect-video w-full object-cover" />
            <div className="flex items-center justify-between gap-1 p-1.5 text-xs">
              <button
                onClick={async () => {
                  await api.setProjectCover(project.id, img.id)
                  onChanged()
                }}
                className={`rounded px-2 py-1 ${
                  img.isCover ? 'bg-accent text-white' : 'text-slate-400 hover:text-accent'
                }`}
              >
                {img.isCover ? '★ Cover' : 'Set cover'}
              </button>
              <button
                onClick={async () => {
                  await api.deleteProjectImage(img.id)
                  onChanged()
                }}
                className="rounded px-2 py-1 text-slate-400 hover:text-red-400"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

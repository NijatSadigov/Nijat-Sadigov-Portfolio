import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { Category, Certification } from '../../types'
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

export default function CertificationsAdmin({ categories }: { categories: Category[] }) {
  const [items, setItems] = useState<Certification[]>([])
  const [editing, setEditing] = useState<Certification | 'new' | null>(null)

  const reload = async () => {
    const list = await api.listCertifications()
    setItems(list)
    setEditing((prev) =>
      prev && prev !== 'new' ? (list.find((c) => c.id === prev.id) ?? null) : prev,
    )
  }
  useEffect(() => {
    reload().catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Certifications ({items.length})</h2>
        <Btn onClick={() => setEditing('new')}>＋ New certification</Btn>
      </div>

      {editing && (
        <CertEditor
          key={editing === 'new' ? 'new' : editing.id}
          cert={editing === 'new' ? null : editing}
          categories={categories}
          onSaved={reload}
          onClose={() => setEditing(null)}
          onChanged={reload}
        />
      )}

      <ul className="space-y-2">
        {items.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3"
          >
            <div>
              <p className="font-medium text-white">{c.title}</p>
              <p className="text-xs text-slate-500">{c.issuer}</p>
            </div>
            <div className="flex gap-2">
              <GhostBtn onClick={() => setEditing(c)}>Edit</GhostBtn>
              <GhostBtn
                danger
                onClick={async () => {
                  if (confirm(`Delete “${c.title}”?`)) {
                    await api.deleteCertification(c.id)
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

function CertEditor({
  cert,
  categories,
  onSaved,
  onClose,
  onChanged,
}: {
  cert: Certification | null
  categories: Category[]
  onSaved: () => void
  onClose: () => void
  onChanged: () => void
}) {
  const [title, setTitle] = useState(cert?.title ?? '')
  const [issuer, setIssuer] = useState(cert?.issuer ?? '')
  const [description, setDescription] = useState(cert?.description ?? '')
  const [credentialUrl, setCredentialUrl] = useState(cert?.credentialUrl ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(cert?.coverImageUrl ?? '')
  const [issuedOn, setIssuedOn] = useState(toDateInput(cert?.issuedOn ?? null))
  const [expiresOn, setExpiresOn] = useState(toDateInput(cert?.expiresOn ?? null))
  const [categoryIds, setCategoryIds] = useState<string[]>(cert?.categoryIds ?? [])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    const payload = {
      title,
      issuer,
      description,
      credentialUrl,
      coverImageUrl,
      issuedOn: toApiDate(issuedOn),
      expiresOn: toApiDate(expiresOn),
      categoryIds,
    }
    try {
      if (cert) await api.updateCertification(cert.id, payload)
      else await api.createCertification(payload)
      onSaved()
      if (!cert) onClose()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Panel title={cert ? `Edit: ${cert.title}` : 'New certification'}>
      <form onSubmit={save} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title">
            <TInput value={title} onChange={setTitle} />
          </Field>
          <Field label="Issuer">
            <TInput value={issuer} onChange={setIssuer} />
          </Field>
        </div>
        <Field label="Description">
          <TArea value={description} onChange={setDescription} rows={2} />
        </Field>
        <Field label="Credential URL">
          <TInput value={credentialUrl} onChange={setCredentialUrl} placeholder="https://…" />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Issued on">
            <input type="date" value={issuedOn} onChange={(e) => setIssuedOn(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Expires on">
            <input type="date" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} className={inputCls} />
          </Field>
        </div>

        <Field label="Cover image">
          <div className="flex items-center gap-3">
            {coverImageUrl && <img src={coverImageUrl} alt="" className="h-14 w-24 rounded object-cover" />}
            <label className="cursor-pointer rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:border-accent">
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  if (e.target.files?.[0]) setCoverImageUrl(await uploadFile(e.target.files[0]))
                }}
              />
            </label>
          </div>
        </Field>

        <Field label="Categories">
          <CategoryPicker categories={categories} selected={categoryIds} onChange={setCategoryIds} />
        </Field>

        {err && <p className="text-sm text-red-400">{err}</p>}
        <div className="flex gap-2">
          <Btn type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </Btn>
          <GhostBtn onClick={onClose}>Close</GhostBtn>
        </div>
      </form>

      {cert && <CertImages cert={cert} onChanged={onChanged} />}
    </Panel>
  )
}

function CertImages({ cert, onChanged }: { cert: Certification; onChanged: () => void }) {
  const [busy, setBusy] = useState(false)
  const add = async (file: File) => {
    setBusy(true)
    try {
      const url = await uploadFile(file)
      await api.addCertImage(cert.id, { url })
      onChanged()
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="mt-6 border-t border-slate-800 pt-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-white">Extra images ({cert.images.length})</h4>
        <label className="cursor-pointer rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:border-accent">
          {busy ? 'Uploading…' : '＋ Add image'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && add(e.target.files[0])}
          />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cert.images.map((img) => (
          <div key={img.id} className="overflow-hidden rounded-lg border border-slate-800">
            <img src={img.url} alt="" className="aspect-video w-full object-cover" />
            <button
              onClick={async () => {
                await api.deleteCertImage(img.id)
                onChanged()
              }}
              className="w-full py-1 text-xs text-slate-400 hover:text-red-400"
            >
              ✕ Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

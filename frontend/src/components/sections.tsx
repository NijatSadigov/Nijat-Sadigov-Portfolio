// Homepage content sections. Category-aware sections dim items that don't
// belong to the active profile; global sections (education, experience) always
// render the same.
import { useState } from 'react'
import { api } from '../api/client'
import Modal from './Modal'
import { dateRange, inActive, monthYear } from '../lib/format'
import { ALL } from '../types'
import type {
  Achievement,
  Certification,
  Education,
  Experience,
  Resume,
  Skill,
} from '../types'

function SectionShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mx-auto mt-14 max-w-6xl px-6">
      <h2 className="theme-heading text-2xl font-bold text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}

const dimCls = (active: string, ids: string[]) =>
  active !== ALL && !inActive(ids, active) ? 'opacity-30' : 'opacity-100'

export function SkillsSection({ skills, active }: { skills: Skill[]; active: string }) {
  if (skills.length === 0) return null
  return (
    <SectionShell title="Skills">
      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <span
            key={s.id}
            className={`theme-card rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-sm text-slate-200 transition ${dimCls(
              active,
              s.categoryIds,
            )}`}
          >
            {s.icon && <span className="mr-1">{s.icon}</span>}
            {s.name}
            {s.level > 0 && <span className="ml-2 text-xs text-accent">{s.level}%</span>}
          </span>
        ))}
      </div>
    </SectionShell>
  )
}

function certCover(c: Certification): string | undefined {
  return c.coverImageUrl || c.images.find((i) => i.isCover)?.url || c.images[0]?.url
}

export function CertificationsSection({
  certifications,
  active,
}: {
  certifications: Certification[]
  active: string
}) {
  const [selected, setSelected] = useState<Certification | null>(null)
  if (certifications.length === 0) return null
  return (
    <SectionShell title="Certifications">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((c) => {
          const cover = certCover(c)
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelected(c)}
              className={`theme-card block overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 text-left transition hover:border-accent/60 ${dimCls(
                active,
                c.categoryIds,
              )}`}
            >
              {cover && (
                <img src={cover} alt={c.title} className="aspect-video w-full object-cover" />
              )}
              <div className="p-4">
                <h3 className="theme-heading font-semibold text-white">{c.title}</h3>
                <p className="text-sm text-slate-400">{c.issuer}</p>
                {c.issuedOn && <p className="mt-1 text-xs text-slate-500">{monthYear(c.issuedOn)}</p>}
              </div>
            </button>
          )
        })}
      </div>

      {selected && <CertModal cert={selected} onClose={() => setSelected(null)} />}
    </SectionShell>
  )
}

function CertModal({ cert, onClose }: { cert: Certification; onClose: () => void }) {
  const cover = certCover(cert)
  // unique image list: cover first, then any extras
  const images = [cover, ...cert.images.map((i) => i.url)].filter(
    (u, i, arr): u is string => !!u && arr.indexOf(u) === i,
  )

  return (
    <Modal
      title={cert.title}
      subtitle={
        <>
          {cert.issuer && <span className="text-accent">{cert.issuer}</span>}
          {(cert.issuedOn || cert.expiresOn) && (
            <span className="mt-1 block text-xs text-slate-500">
              {cert.issuedOn && `Issued ${monthYear(cert.issuedOn)}`}
              {cert.expiresOn && ` · Expires ${monthYear(cert.expiresOn)}`}
            </span>
          )}
        </>
      }
      onClose={onClose}
    >
      {cert.description && <p className="mt-4 text-slate-300">{cert.description}</p>}

      {images.length > 0 && (
        <div className="mt-5 space-y-3">
          {images.map((src) => (
            <img
              key={src}
              src={src}
              alt={cert.title}
              className="max-h-[60vh] w-full rounded-lg border border-slate-800 object-contain"
            />
          ))}
        </div>
      )}

      {cert.credentialUrl && (
        <a
          href={cert.credentialUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:opacity-90"
        >
          View certificate ↗
        </a>
      )}
    </Modal>
  )
}

export function AchievementsSection({
  achievements,
  active,
}: {
  achievements: Achievement[]
  active: string
}) {
  const [selected, setSelected] = useState<Achievement | null>(null)
  if (achievements.length === 0) return null
  return (
    <SectionShell title="Achievements">
      <ul className="space-y-3">
        {achievements.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => setSelected(a)}
              className={`theme-card block w-full rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-left transition hover:border-accent/60 ${dimCls(
                active,
                a.categoryIds,
              )}`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold text-white">{a.title}</h3>
                {a.achievedOn && (
                  <span className="shrink-0 text-xs text-slate-500">{monthYear(a.achievedOn)}</span>
                )}
              </div>
              {a.description && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-400">{a.description}</p>
              )}
            </button>
          </li>
        ))}
      </ul>

      {selected && <AchievementModal achievement={selected} onClose={() => setSelected(null)} />}
    </SectionShell>
  )
}

function AchievementModal({
  achievement,
  onClose,
}: {
  achievement: Achievement
  onClose: () => void
}) {
  return (
    <Modal
      title={achievement.title}
      subtitle={
        achievement.achievedOn && (
          <span className="text-xs text-slate-500">{monthYear(achievement.achievedOn)}</span>
        )
      }
      onClose={onClose}
    >
      {achievement.description && (
        <p className="mt-4 whitespace-pre-wrap text-slate-300">{achievement.description}</p>
      )}
    </Modal>
  )
}

export function ResumeBar({
  resumes,
  active,
}: {
  resumes: Resume[]
  active: string
}) {
  // On ALL show the main resume; on a category show that category's resume.
  const resume =
    active === ALL
      ? resumes.find((r) => r.isMain) ?? resumes[0]
      : resumes.find((r) => r.categoryId === active)

  if (!resume) return null
  return (
    <div className="mx-auto mt-10 max-w-6xl px-6">
      <a
        href={resume.fileUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:opacity-90"
      >
        ⬇ Download résumé{resume.label ? ` · ${resume.label}` : ''}
      </a>
    </div>
  )
}

export function EducationSection({ education }: { education: Education[] }) {
  if (education.length === 0) return null
  return (
    <SectionShell title="Education">
      <ul className="space-y-4">
        {education.map((e) => (
          <li key={e.id} className="border-l-2 border-slate-700 pl-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold text-white">{e.institution}</h3>
              <span className="text-xs text-slate-500">
                {dateRange(e.startDate, e.endDate, e.isCurrent)}
              </span>
            </div>
            <p className="text-sm text-slate-300">
              {[e.degree, e.field].filter(Boolean).join(', ')}
            </p>
            {e.description && <p className="mt-1 text-sm text-slate-500">{e.description}</p>}
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

export function ExperienceSection({ experience }: { experience: Experience[] }) {
  if (experience.length === 0) return null
  return (
    <SectionShell title="Experience">
      <ul className="space-y-4">
        {experience.map((e) => (
          <li key={e.id} className="border-l-2 border-slate-700 pl-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold text-white">
                {e.role} {e.company && <span className="text-slate-400">· {e.company}</span>}
              </h3>
              <span className="text-xs text-slate-500">
                {dateRange(e.startDate, e.endDate, e.isCurrent)}
              </span>
            </div>
            {e.location && <p className="text-xs text-slate-500">{e.location}</p>}
            {e.description && <p className="mt-1 text-sm text-slate-400">{e.description}</p>}
            {e.referenceUrl && (
              <a
                href={e.referenceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-accent hover:underline"
              >
                📄 {e.referenceLabel || 'Reference letter'}
              </a>
            )}
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

export function ContactSection({ email }: { email: string }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [err, setErr] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState('sending')
    setErr('')
    try {
      await api.sendContact(form)
      setState('sent')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (e) {
      setState('error')
      setErr(e instanceof Error ? e.message : 'Failed to send')
    }
  }

  return (
    <SectionShell title="Contact">
      {state === 'sent' ? (
        <p className="rounded-lg border border-accent/40 bg-accent/10 p-4 text-accent">
          Thanks — your message was sent! {email && `I'll reply to you soon.`}
        </p>
      ) : (
        <form onSubmit={submit} className="grid max-w-2xl gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-accent"
            />
            <input
              required
              type="email"
              placeholder="Your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-accent"
            />
          </div>
          <input
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-accent"
          />
          <textarea
            required
            placeholder="Message"
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-accent"
          />
          {state === 'error' && <p className="text-sm text-red-400">{err}</p>}
          <button
            type="submit"
            disabled={state === 'sending'}
            className="justify-self-start rounded-lg bg-accent px-5 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {state === 'sending' ? 'Sending…' : 'Send message'}
          </button>
        </form>
      )}
    </SectionShell>
  )
}

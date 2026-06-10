// Homepage content sections. Category-aware sections dim items that don't
// belong to the active profile; global sections (education, experience) always
// render the same.
import { useState, type ReactNode } from 'react'
import { api } from '../api/client'
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
import Modal from './Modal'

export function SectionShell({
  no,
  title,
  meta,
  children,
}: {
  no?: string
  title: string
  meta?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="mx-auto mt-20 max-w-6xl px-6">
      <div className="mb-7 flex items-baseline gap-4">
        {no && <span className="font-mono text-xs text-accent">{no}</span>}
        <h2 className="theme-heading text-3xl font-bold text-white">{title}</h2>
        {meta && <span className="font-mono text-xs text-slate-500">{meta}</span>}
        <span aria-hidden className="h-px flex-1 self-center bg-white/10" />
      </div>
      {children}
    </section>
  )
}

const dimCls = (active: string, ids: string[]) =>
  active !== ALL && !inActive(ids, active) ? 'opacity-30' : 'opacity-100'

/* ── Skills ─────────────────────────────────────────────── */

export function SkillsSection({
  skills,
  active,
  no,
}: {
  skills: Skill[]
  active: string
  no?: string
}) {
  if (skills.length === 0) return null
  return (
    <SectionShell no={no} title="Skills">
      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <div
            key={s.id}
            className={`theme-card min-w-[8rem] rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-2.5 transition hover:border-white/25 ${dimCls(
              active,
              s.categoryIds,
            )}`}
          >
            <div className="flex items-baseline justify-between gap-4 font-mono text-xs">
              <span className="text-slate-200">
                {s.icon && <span className="mr-1.5">{s.icon}</span>}
                {s.name}
              </span>
              {s.level > 0 && <span className="text-accent">{s.level}</span>}
            </div>
            {s.level > 0 && (
              <div className="mt-2 h-0.5 overflow-hidden rounded bg-white/10">
                <div
                  className="h-full rounded bg-accent transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, s.level))}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionShell>
  )
}

/* ── Certifications ─────────────────────────────────────── */

function certCover(c: Certification): string | undefined {
  return c.coverImageUrl || c.images.find((i) => i.isCover)?.url || c.images[0]?.url
}

export function CertificationsSection({
  certifications,
  active,
  no,
}: {
  certifications: Certification[]
  active: string
  no?: string
}) {
  const [selected, setSelected] = useState<Certification | null>(null)
  if (certifications.length === 0) return null
  return (
    <SectionShell no={no} title="Certifications">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((c) => {
          const cover = certCover(c)
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelected(c)}
              className={`theme-card group block overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] text-left transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_12px_48px_-12px_rgb(var(--accent)/0.3)] ${dimCls(
                active,
                c.categoryIds,
              )}`}
            >
              {cover && (
                <div className="overflow-hidden bg-[#0d0d13]">
                  <img
                    src={cover}
                    alt={c.title}
                    loading="lazy"
                    className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="theme-heading font-semibold text-white">{c.title}</h3>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-slate-500">
                  {c.issuer}
                  {c.issuedOn && ` · ${monthYear(c.issuedOn)}`}
                </p>
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
        <p className="font-mono text-xs text-slate-400">
          <span className="text-accent">{cert.issuer}</span>
          {cert.issuedOn && ` · issued ${monthYear(cert.issuedOn)}`}
          {cert.expiresOn && ` · expires ${monthYear(cert.expiresOn)}`}
        </p>
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
              className="max-h-[65vh] w-full rounded-xl border border-white/10 object-contain"
            />
          ))}
        </div>
      )}

      {cert.credentialUrl && (
        <a
          href={cert.credentialUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-white transition hover:opacity-90"
        >
          View certificate ↗
        </a>
      )}
    </Modal>
  )
}

/* ── Achievements ───────────────────────────────────────── */

export function AchievementsSection({
  achievements,
  active,
  no,
}: {
  achievements: Achievement[]
  active: string
  no?: string
}) {
  const [selected, setSelected] = useState<Achievement | null>(null)
  if (achievements.length === 0) return null
  return (
    <SectionShell no={no} title="Achievements">
      <ul className="space-y-3">
        {achievements.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => setSelected(a)}
              className={`theme-card block w-full rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-accent/60 ${dimCls(
                active,
                a.categoryIds,
              )}`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold text-white">{a.title}</h3>
                {a.achievedOn && (
                  <span className="shrink-0 font-mono text-xs text-slate-500">
                    {monthYear(a.achievedOn)}
                  </span>
                )}
              </div>
              {a.description && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-400">{a.description}</p>
              )}
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <Modal
          title={selected.title}
          subtitle={
            selected.achievedOn && (
              <span className="font-mono text-xs text-slate-500">
                {monthYear(selected.achievedOn)}
              </span>
            )
          }
          onClose={() => setSelected(null)}
        >
          {selected.description && (
            <p className="mt-4 whitespace-pre-wrap text-slate-300">{selected.description}</p>
          )}
        </Modal>
      )}
    </SectionShell>
  )
}

/* ── Résumé bar ─────────────────────────────────────────── */

export function ResumeBar({ resumes, active }: { resumes: Resume[]; active: string }) {
  // On ALL show the main resume; on a category show that category's resume.
  const resume =
    active === ALL
      ? resumes.find((r) => r.isMain) ?? resumes[0]
      : resumes.find((r) => r.categoryId === active)

  if (!resume) return null
  return (
    <div className="mt-10 text-center">
      <a
        href={resume.fileUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-3 rounded-lg border border-accent/50 bg-accent/10 px-7 py-3 font-mono text-xs uppercase tracking-[0.18em] text-accent transition hover:bg-accent hover:text-white"
      >
        ⬇ Résumé{resume.label ? ` — ${resume.label}` : ''}
      </a>
    </div>
  )
}

/* ── Timeline (education + experience) ──────────────────── */

function Timeline({ children }: { children: ReactNode }) {
  return <ol className="relative space-y-10 border-l border-white/10 pl-8">{children}</ol>
}

function TimelineItem({
  heading,
  sub,
  period,
  children,
}: {
  heading: ReactNode
  sub?: ReactNode
  period: string
  children?: ReactNode
}) {
  return (
    <li className="relative">
      <span
        aria-hidden
        className="absolute -left-[37px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-accent bg-[#0a0a0e]"
      />
      {period && <p className="font-mono text-xs text-accent">{period}</p>}
      <h3 className="theme-heading mt-1 text-lg font-semibold text-white">{heading}</h3>
      {sub && <p className="mt-0.5 text-sm text-slate-400">{sub}</p>}
      {children}
    </li>
  )
}

export function EducationSection({ education, no }: { education: Education[]; no?: string }) {
  if (education.length === 0) return null
  return (
    <SectionShell no={no} title="Education">
      <Timeline>
        {education.map((e) => (
          <TimelineItem
            key={e.id}
            period={dateRange(e.startDate, e.endDate, e.isCurrent)}
            heading={e.institution}
            sub={
              <>
                {[e.degree, e.field].filter(Boolean).join(', ')}
                {e.location && (
                  <span className="font-mono text-xs text-slate-500"> · {e.location}</span>
                )}
              </>
            }
          >
            {e.description && (
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{e.description}</p>
            )}
          </TimelineItem>
        ))}
      </Timeline>
    </SectionShell>
  )
}

export function ExperienceSection({ experience, no }: { experience: Experience[]; no?: string }) {
  if (experience.length === 0) return null
  return (
    <SectionShell no={no} title="Experience">
      <Timeline>
        {experience.map((e) => (
          <TimelineItem
            key={e.id}
            period={dateRange(e.startDate, e.endDate, e.isCurrent)}
            heading={
              <>
                {e.role}
                {e.company && <span className="text-slate-400"> · {e.company}</span>}
              </>
            }
            sub={e.location && <span className="font-mono text-xs">{e.location}</span>}
          >
            {e.description && (
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{e.description}</p>
            )}
            {e.referenceUrl && (
              <a
                href={e.referenceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded border border-white/10 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-400 transition hover:border-accent hover:text-accent"
              >
                📄 {e.referenceLabel || 'Reference letter'}
              </a>
            )}
          </TimelineItem>
        ))}
      </Timeline>
    </SectionShell>
  )
}

/* ── Contact ────────────────────────────────────────────── */

const fieldCls =
  'w-full rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-white placeholder:text-slate-600 outline-none transition focus:border-accent'

export function ContactSection({ email, no }: { email: string; no?: string }) {
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
    <SectionShell no={no} title="Contact">
      {state === 'sent' ? (
        <p className="rounded-xl border border-accent/40 bg-accent/10 p-5 text-accent">
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
              className={fieldCls}
            />
            <input
              required
              type="email"
              placeholder="Your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={fieldCls}
            />
          </div>
          <input
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className={fieldCls}
          />
          <textarea
            required
            placeholder="Message"
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className={fieldCls}
          />
          {state === 'error' && <p className="font-mono text-sm text-red-400">{err}</p>}
          <button
            type="submit"
            disabled={state === 'sending'}
            className="justify-self-start rounded-lg bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {state === 'sending' ? 'Sending…' : 'Send message →'}
          </button>
        </form>
      )}
    </SectionShell>
  )
}

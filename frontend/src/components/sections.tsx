import { useState, type ReactNode } from 'react'
import { api } from '../api/client'
import { dateRange, inActive, monthYear } from '../lib/format'
import { ALL } from '../types'
import type {
  Achievement,
  Certification,
  Education,
  Experience,
  Skill,
  SocialLink,
} from '../types'
import Modal from './Modal'
import Reveal from './Reveal'

function SectionHead({ title }: { title: string }) {
  return (
    <h2
      className="head m-0 mb-6 font-semibold"
      style={{ fontSize: 'clamp(1.3rem,3vw,2rem)' }}
    >
      {title}
    </h2>
  )
}

function Section({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24" style={{ padding: 'clamp(48px,7vw,80px) 0 20px' }}>
      <Reveal>{children}</Reveal>
    </section>
  )
}

// Work outside the active profile stays on the page, just quieter.
const dimFor = (active: string, ids: string[]) =>
  active !== ALL && !inActive(ids, active) ? 'dimmed' : ''

const chip = {
  fontFamily: 'var(--font-mono)',
  fontSize: 12.5,
  padding: '7px 12px',
  borderRadius: 'calc(var(--radius) * .6)',
  background: 'var(--surface)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
}

/* ── Skills ─────────────────────────────────────────────── */

export function SkillsSection({ skills, active }: { skills: Skill[]; active: string }) {
  if (skills.length === 0) return null
  return (
    <Section id="skills">
      <SectionHead title="Skills & tools" />
      <div className="flex flex-wrap gap-[9px]">
        {skills.map((s) => (
          <span
            key={s.id}
            style={chip}
            className={`transition-[opacity,filter] duration-300 ${dimFor(active, s.categoryIds)}`}
          >
            {s.icon && <span className="mr-1.5">{s.icon}</span>}
            {s.name}
          </span>
        ))}
      </div>
    </Section>
  )
}

/* ── Experience + Education ─────────────────────────────── */

export function ExperienceEducationSection({
  experience,
  education,
}: {
  experience: Experience[]
  education: Education[]
}) {
  if (experience.length === 0 && education.length === 0) return null
  return (
    <section
      id="experience"
      className="grid scroll-mt-24"
      style={{
        padding: 'clamp(48px,7vw,80px) 0 20px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 'clamp(32px,5vw,64px)',
      }}
    >
      <Reveal>
        <div>
          <SectionHead title="Experience" />
          <div className="flex flex-col">
            {experience.map((e) => (
              <div key={e.id} className="grid gap-4 pb-7" style={{ gridTemplateColumns: '14px 1fr' }}>
                <div className="flex flex-col items-center">
                  <span
                    className="mt-[5px] h-[11px] w-[11px] shrink-0 rounded-[3px]"
                    style={{ background: 'var(--accent)' }}
                  />
                  <span className="mt-1.5 w-px flex-1" style={{ background: 'var(--border)' }} />
                </div>
                <div>
                  <div className="mb-[5px] font-mono text-[11.5px] text-faint">
                    {dateRange(e.startDate, e.endDate, e.isCurrent)}
                  </div>
                  <div className="mb-0.5 text-base font-bold">{e.role}</div>
                  <div className="mb-2 text-sm text-accent">
                    {e.company}
                    {e.location && <span className="text-faint"> · {e.location}</span>}
                  </div>
                  {e.description && (
                    <div
                      className="text-sm text-dim"
                      style={{ lineHeight: 1.55, textWrap: 'pretty' }}
                    >
                      {e.description}
                    </div>
                  )}
                  {e.referenceUrl && (
                    <a
                      href={e.referenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 px-2.5 py-1.5 font-mono text-[11px] text-dim"
                      style={{ border: '1px solid var(--border)', borderRadius: 'calc(var(--radius) * .5)' }}
                    >
                      📄 {e.referenceLabel || 'Reference letter'}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div>
          <SectionHead title="Education" />
          <div className="flex flex-col gap-3.5">
            {education.map((ed) => (
              <div
                key={ed.id}
                style={{
                  padding: '20px 22px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  background: 'var(--surface)',
                }}
              >
                <div className="mb-1.5 font-mono text-[11.5px] text-faint">
                  {dateRange(ed.startDate, ed.endDate, ed.isCurrent)}
                </div>
                <div className="head mb-[3px] font-semibold" style={{ fontSize: '1.15rem' }}>
                  {[ed.degree, ed.field].filter(Boolean).join(', ') || ed.institution}
                </div>
                <div className="mb-2 text-sm text-accent">
                  {ed.institution}
                  {ed.location && <span className="text-faint"> · {ed.location}</span>}
                </div>
                {ed.description && (
                  <div className="text-sm text-dim" style={{ lineHeight: 1.5 }}>
                    {ed.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

/* ── Certifications ─────────────────────────────────────── */

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
    <Section id="certifications">
      <SectionHead title="Certifications" />
      <div
        className="grid gap-3.5"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}
      >
        {certifications.map((c) => {
          const cover = certCover(c)
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelected(c)}
              className={`card overflow-hidden text-left ${dimFor(active, c.categoryIds)}`}
            >
              <div
                className="grid place-items-center overflow-hidden"
                style={{
                  aspectRatio: '16/10',
                  background:
                    'linear-gradient(135deg, color-mix(in oklch, var(--accent) 22%, var(--surface-2)), var(--surface-2))',
                }}
              >
                {cover ? (
                  <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <span
                    className="head"
                    style={{
                      fontSize: '2rem',
                      color: 'color-mix(in srgb, var(--accent) 70%, transparent)',
                    }}
                  >
                    ✎
                  </span>
                )}
              </div>
              <div style={{ padding: '15px 16px 17px' }}>
                <div className="mb-1 text-[14.5px] font-semibold" style={{ lineHeight: 1.35 }}>
                  {c.title}
                </div>
                <div className="mb-0.5 text-[13px] text-dim">{c.issuer}</div>
                <div className="font-mono text-[11px] text-faint">
                  {c.issuedOn && monthYear(c.issuedOn)}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {selected && <CertModal cert={selected} onClose={() => setSelected(null)} />}
    </Section>
  )
}

function CertModal({ cert, onClose }: { cert: Certification; onClose: () => void }) {
  const cover = certCover(cert)
  const images = [cover, ...cert.images.map((i) => i.url)].filter(
    (u, i, arr): u is string => !!u && arr.indexOf(u) === i,
  )

  return (
    <Modal
      title={cert.title}
      subtitle={
        <p className="font-mono text-xs text-dim">
          <span className="text-accent">{cert.issuer}</span>
          {cert.issuedOn && ` · issued ${monthYear(cert.issuedOn)}`}
          {cert.expiresOn && ` · expires ${monthYear(cert.expiresOn)}`}
        </p>
      }
      onClose={onClose}
    >
      {cert.description && <p className="mt-4 text-dim">{cert.description}</p>}

      {images.length > 0 && (
        <div className="mt-5 space-y-3">
          {images.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              className="max-h-[65vh] w-full object-contain"
              style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
            />
          ))}
        </div>
      )}

      {cert.credentialUrl && (
        <a
          href={cert.credentialUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block px-5 py-2.5 font-mono text-xs font-bold"
          style={{
            borderRadius: 'var(--radius)',
            background: 'var(--accent)',
            color: 'var(--on-accent)',
          }}
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
}: {
  achievements: Achievement[]
  active: string
}) {
  const [selected, setSelected] = useState<Achievement | null>(null)
  if (achievements.length === 0) return null
  return (
    <Section id="achievements">
      <SectionHead title="Achievements" />
      <ul className="flex flex-col gap-3">
        {achievements.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => setSelected(a)}
              className={`card w-full p-4 text-left ${dimFor(active, a.categoryIds)}`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold">{a.title}</h3>
                {a.achievedOn && (
                  <span className="shrink-0 font-mono text-xs text-faint">
                    {monthYear(a.achievedOn)}
                  </span>
                )}
              </div>
              {a.description && <p className="mt-1 line-clamp-2 text-sm text-dim">{a.description}</p>}
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <Modal
          title={selected.title}
          subtitle={
            selected.achievedOn && (
              <span className="font-mono text-xs text-faint">{monthYear(selected.achievedOn)}</span>
            )
          }
          onClose={() => setSelected(null)}
        >
          {selected.description && (
            <p className="mt-4 whitespace-pre-wrap text-dim">{selected.description}</p>
          )}
        </Modal>
      )}
    </Section>
  )
}

/* ── Contact ────────────────────────────────────────────── */

const fieldStyle = {
  padding: '13px 15px',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text)',
  outline: 'none',
}

export function ContactSection({
  email,
  socialLinks,
  openToWork,
}: {
  email: string
  socialLinks: SocialLink[]
  openToWork: boolean
}) {
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
    <section
      id="contact"
      className="grid scroll-mt-24"
      style={{
        padding: 'clamp(56px,8vw,96px) 0',
        marginTop: 24,
        borderTop: '1px solid var(--border-2)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'clamp(32px,5vw,72px)',
      }}
    >
      <div>
        <h2
          className="m-0 mb-[18px] font-display font-medium"
          style={{ fontSize: 'clamp(2rem,5vw,3.4rem)', lineHeight: 1, letterSpacing: '-.03em' }}
        >
          Let’s build something.
        </h2>
        <p
          className="mb-[26px] max-w-[420px] text-dim"
          style={{ fontSize: 16, lineHeight: 1.6, textWrap: 'pretty' }}
        >
          {openToWork
            ? 'Open to roles and collaborations across software, games, and applied ML research. The fastest way to reach me is email.'
            : 'Always happy to talk about software, games, and applied ML research. The fastest way to reach me is email.'}
        </p>
        <div className="flex flex-col gap-3 text-[15px]">
          {email && (
            <a href={`mailto:${email}`} className="text-text hover:text-accent">
              {email}
            </a>
          )}
          {socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-4 font-mono text-[13px]">
              {socialLinks.map((l) => (
                <a
                  key={l.id}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-dim hover:text-accent"
                >
                  {l.label || l.platform} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {state === 'sent' ? (
        <p
          className="self-start p-5 text-accent"
          style={{
            border: '1px solid color-mix(in srgb, var(--accent) 40%, transparent)',
            borderRadius: 'var(--radius)',
            background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
          }}
        >
          Thanks — your message was sent. I’ll reply soon.
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={fieldStyle}
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={fieldStyle}
          />
          <input
            placeholder="Subject (optional)"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            style={fieldStyle}
          />
          <textarea
            required
            rows={4}
            placeholder="What’s on your mind?"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            style={{ ...fieldStyle, resize: 'vertical' }}
          />
          {state === 'error' && <p className="font-mono text-sm text-red-400">{err}</p>}
          <button
            type="submit"
            disabled={state === 'sending'}
            className="p-3.5 text-[15px] font-bold disabled:opacity-50"
            style={{
              borderRadius: 'var(--radius)',
              background: 'var(--accent)',
              color: 'var(--on-accent)',
            }}
          >
            {state === 'sending' ? 'Sending…' : 'Send message →'}
          </button>
        </form>
      )}
    </section>
  )
}

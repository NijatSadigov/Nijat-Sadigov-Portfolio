import { useEffect, useState } from 'react'
import { api } from '../api/client'
import AdminLink from '../components/AdminLink'
import CategoryButtons from '../components/CategoryButtons'
import DiceScene, { type DiceDir } from '../components/DiceScene'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import ProjectGrid from '../components/ProjectGrid'
import {
  AchievementsSection,
  CertificationsSection,
  ContactSection,
  EducationSection,
  ExperienceSection,
  ResumeBar,
  SkillsSection,
} from '../components/sections'
import { applyTheme } from '../lib/theme'
import { ALL, type SiteData } from '../types'

const DEFAULT_ACCENT = '#6366f1'

export default function Home() {
  const [site, setSite] = useState<SiteData | null>(null)
  const [active, setActive] = useState<string>(ALL)
  const [direction, setDirection] = useState<DiceDir>('up')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .getSite()
      .then(setSite)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
  }, [])

  useEffect(() => {
    if (!site) return
    if (active === ALL) {
      applyTheme('default', DEFAULT_ACCENT)
      return
    }
    const cat = site.categories.find((c) => c.id === active)
    if (cat) applyTheme(cat.theme, cat.accentColor)
  }, [active, site])

  const select = (id: string, dir: DiceDir) => {
    setDirection(dir)
    setActive(id)
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center text-slate-400">
        <div>
          <p className="text-lg">Couldn’t reach the API.</p>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
        </div>
      </div>
    )
  }
  if (!site) {
    return <div className="grid min-h-screen place-items-center text-slate-400">Loading…</div>
  }

  const activeName =
    active === ALL ? 'All work' : (site.categories.find((c) => c.id === active)?.name ?? '')

  return (
    <div className="min-h-screen pb-10">
      <AdminLink />
      <Hero profile={site.profile} socialLinks={site.socialLinks} />

      <CategoryButtons categories={site.categories} active={active} onSelect={select} />

      <ResumeBar resumes={site.resumes} active={active} />

      {/* Category-dependent content rotates like a die when the profile changes. */}
      <DiceScene sceneKey={active} direction={direction}>
        <section className="mt-12">
          <h2 className="theme-heading mx-auto max-w-6xl px-6 text-2xl font-bold text-white">
            {activeName} · Projects
          </h2>
          <ProjectGrid projects={site.projects} active={active} />
        </section>

        <SkillsSection skills={site.skills} active={active} />
        <CertificationsSection certifications={site.certifications} active={active} />
        <AchievementsSection achievements={site.achievements} active={active} />
      </DiceScene>

      {/* Global sections (same across all profiles). */}
      <EducationSection education={site.education} />
      <ExperienceSection experience={site.experience} />
      <ContactSection email={site.profile.email} />

      <Footer profile={site.profile} socialLinks={site.socialLinks} />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { api } from '../api/client'
import TopControls from '../components/TopControls'
import CategoryButtons from '../components/CategoryButtons'
import DiceScene, { type DiceDir } from '../components/DiceScene'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import ProjectGrid from '../components/ProjectGrid'
import SectionNav, { type NavItem } from '../components/SectionNav'
import {
  AchievementsSection,
  CertificationsSection,
  ContactSection,
  EducationSection,
  ExperienceSection,
  ResumeBar,
  SectionShell,
  SkillsSection,
} from '../components/sections'
import { applyTheme } from '../lib/theme'
import { ALL, type SiteData } from '../types'

const DEFAULT_ACCENT = '#818cf8'

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

  // Shift accent + theme flavour to match the active profile.
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
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <p className="font-mono text-sm text-red-400">// couldn’t reach the API</p>
          <p className="mt-2 font-mono text-xs text-faint">{error}</p>
        </div>
      </div>
    )
  }
  if (!site) {
    return (
      <div className="grid min-h-screen place-items-center">
        <p className="cursor-blink font-mono text-sm text-accent">▌</p>
      </div>
    )
  }

  const activeName =
    active === ALL ? 'all work' : (site.categories.find((c) => c.id === active)?.name ?? '')

  // Build the section-nav from whatever content actually exists.
  const navItems: NavItem[] = [
    { id: 'intro', label: 'Intro' },
    { id: 'projects', label: 'Projects' },
    site.skills.length > 0 && { id: 'skills', label: 'Skills' },
    site.certifications.length > 0 && { id: 'certifications', label: 'Certifications' },
    site.achievements.length > 0 && { id: 'achievements', label: 'Achievements' },
    site.education.length > 0 && { id: 'education', label: 'Education' },
    site.experience.length > 0 && { id: 'experience', label: 'Experience' },
    { id: 'contact', label: 'Contact' },
  ].filter(Boolean) as NavItem[]

  return (
    <div className="min-h-screen pb-10">
      <TopControls />
      <SectionNav items={navItems} />
      <Hero profile={site.profile} socialLinks={site.socialLinks} />

      <CategoryButtons categories={site.categories} active={active} onSelect={select} />

      <ResumeBar resumes={site.resumes} active={active} />

      {/* Category-dependent content rotates like a die when the profile changes. */}
      <DiceScene sceneKey={active} direction={direction}>
        <SectionShell no="01" title="Projects" meta={`/ ${activeName.toLowerCase()}`}>
          <ProjectGrid projects={site.projects} active={active} />
        </SectionShell>

        <SkillsSection no="02" skills={site.skills} active={active} />
        <CertificationsSection no="03" certifications={site.certifications} active={active} />
        <AchievementsSection no="04" achievements={site.achievements} active={active} />
      </DiceScene>

      {/* Global sections (same across all profiles). */}
      <EducationSection no="05" education={site.education} />
      <ExperienceSection no="06" experience={site.experience} />
      <ContactSection no="07" email={site.profile.email} />

      <Footer profile={site.profile} socialLinks={site.socialLinks} />
    </div>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { api } from '../api/client'
import AdminLink from '../components/AdminLink'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Hero from '../components/Hero'
import ProjectGrid, { FeaturedProjects } from '../components/ProjectGrid'
import ProjectModal from '../components/ProjectModal'
import SweepOverlay from '../components/SweepOverlay'
import {
  AchievementsSection,
  CertificationsSection,
  ContactSection,
  ExperienceEducationSection,
  SkillsSection,
} from '../components/sections'
import {
  applyMode,
  applyProfile,
  initialMode,
  initialProfile,
  SWEEP_SWAP_MS,
  SWEEP_TOTAL_MS,
  type Mode,
  type ProfileSlug,
} from '../lib/theme'
import { ALL, type Project, type SiteData } from '../types'

export default function Home() {
  const [site, setSite] = useState<SiteData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [profile, setProfileState] = useState<ProfileSlug>(initialProfile)
  const [mode, setMode] = useState<Mode>(initialMode)
  const [nextProfile, setNextProfile] = useState<ProfileSlug | null>(null)
  const [selected, setSelected] = useState<Project | null>(null)
  const reduce = useReducedMotion()
  const timers = useRef<number[]>([])
  const counted = useRef<Set<string>>(new Set())

  const openProject = useCallback((p: Project) => {
    setSelected(p)
    // Count a view once per session, and don't let a failure surface to the user.
    if (!counted.current.has(p.slug)) {
      counted.current.add(p.slug)
      api.recordView(p.slug).catch(() => {})
    }
  }, [])

  useEffect(() => {
    api
      .getSite()
      .then(setSite)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
  }, [])

  useEffect(() => applyProfile(profile), [profile])
  useEffect(() => applyMode(mode), [mode])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Switching profile lands you on that profile's work. This runs once the new
  // profile has rendered — mid-sweep, so the jump happens behind the overlay.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const target = document.getElementById('featured') ?? document.getElementById('work')
    // 'instant', not 'auto' — 'auto' defers to the page's smooth scroll-behavior,
    // which would animate into view *after* the sweep has already lifted.
    target?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [profile])

  // The tokens swap at the midpoint of the wipe, so the new theme is already
  // painted when the overlay clears.
  const pickProfile = useCallback(
    (next: ProfileSlug) => {
      if (next === profile || nextProfile) return
      if (reduce) {
        setProfileState(next)
        return
      }
      setNextProfile(next)
      timers.current.push(
        window.setTimeout(() => setProfileState(next), SWEEP_SWAP_MS),
        window.setTimeout(() => setNextProfile(null), SWEEP_TOTAL_MS),
      )
    },
    [profile, nextProfile, reduce],
  )

  const toggleMode = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'))

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

  const activeCat = site.categories.find((c) => c.slug === profile)
  const activeId = profile === 'all' ? ALL : (activeCat?.id ?? ALL)
  const descriptions = Object.fromEntries(
    site.categories.map((c) => [c.slug, c.description]),
  ) as Partial<Record<ProfileSlug, string>>

  return (
    <>
      <SweepOverlay next={nextProfile} mode={mode} />
      <div aria-hidden="true" className="texture" />

      <div className="relative z-[1] min-h-screen pb-10">
        <Header
          profile={profile}
          mode={mode}
          descriptions={descriptions}
          onPick={pickProfile}
          onToggleMode={toggleMode}
        />

        <main id="top" className="shell">
          <Hero
            profile={site.profile}
            categories={site.categories}
            projects={site.projects}
            resumes={site.resumes}
            active={profile}
            mode={mode}
            onPick={pickProfile}
          />

          <FeaturedProjects
            projects={site.projects}
            categories={site.categories}
            active={profile}
            mode={mode}
            onOpen={openProject}
          />

          <ProjectGrid
            projects={site.projects}
            categories={site.categories}
            active={profile}
            mode={mode}
            onOpen={openProject}
          />

          <SkillsSection skills={site.skills} active={activeId} />
          <CertificationsSection certifications={site.certifications} active={activeId} />
          <AchievementsSection achievements={site.achievements} active={activeId} />
          <ExperienceEducationSection experience={site.experience} education={site.education} />
          <ContactSection
            email={site.profile.email}
            socialLinks={site.socialLinks}
            openToWork={site.profile.openToWork}
          />
        </main>

        <Footer profile={site.profile} socialLinks={site.socialLinks} />
        <AdminLink />
      </div>

      {selected && (
        <ProjectModal
          project={selected}
          categories={site.categories}
          active={profile}
          mode={mode}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}

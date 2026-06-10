import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import ProjectsAdmin from './ProjectsAdmin'
import CertificationsAdmin from './CertificationsAdmin'
import {
  AchievementsAdmin,
  EducationAdmin,
  ExperienceAdmin,
  MessagesAdmin,
  ProfileAdmin,
  ResumesAdmin,
  SkillsAdmin,
} from './ContentAdmins'
import { useCategories } from './ui'

const TABS = [
  'Projects',
  'Certifications',
  'Skills',
  'Achievements',
  'Education',
  'Experience',
  'Résumés',
  'Profile',
  'Messages',
] as const
type Tab = (typeof TABS)[number]

export default function Dashboard() {
  const { logout } = useAuth()
  const [tab, setTab] = useState<Tab>('Projects')
  const categories = useCategories()

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Admin</h1>
        <div className="flex gap-3 text-sm">
          <Link to="/" className="rounded-lg border border-slate-700 px-3 py-1.5 hover:border-accent">
            View site
          </Link>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-700 px-3 py-1.5 hover:border-red-500 hover:text-red-400"
          >
            Log out
          </button>
        </div>
      </div>

      <nav className="mt-6 flex flex-wrap gap-1 border-b border-slate-800">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm ${
              tab === t ? 'border-b-2 border-accent text-accent' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === 'Projects' && <ProjectsAdmin categories={categories} />}
        {tab === 'Certifications' && <CertificationsAdmin categories={categories} />}
        {tab === 'Skills' && <SkillsAdmin categories={categories} />}
        {tab === 'Achievements' && <AchievementsAdmin categories={categories} />}
        {tab === 'Education' && <EducationAdmin />}
        {tab === 'Experience' && <ExperienceAdmin />}
        {tab === 'Résumés' && <ResumesAdmin categories={categories} />}
        {tab === 'Profile' && <ProfileAdmin />}
        {tab === 'Messages' && <MessagesAdmin />}
      </div>
    </div>
  )
}

// Shapes mirror the Go API JSON responses.

export interface Category {
  id: string
  slug: string
  name: string
  description: string
  theme: string
  accentColor: string
  sortOrder: number
}

export interface ProjectImage {
  id: string
  url: string
  caption: string
  isCover: boolean
  sortOrder: number
}

export interface Project {
  id: string
  slug: string
  title: string
  summary: string
  description: string
  repoUrl: string
  demoUrl: string
  demoType: 'none' | 'link' | 'embed' | 'video'
  demoGuide: string
  status: 'draft' | 'published'
  featured: boolean
  viewCount: number
  startedOn: string | null
  endedOn: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
  categoryIds: string[]
  images: ProjectImage[]
  tech: string[]
}

export interface Profile {
  fullName: string
  headline: string
  bio: string
  photoUrl: string
  email: string
  phone: string
  location: string
  updatedAt: string
}

export interface SocialLink {
  id: string
  platform: string
  label: string
  url: string
  icon: string
  sortOrder: number
}

export interface Skill {
  id: string
  name: string
  level: number
  icon: string
  sortOrder: number
  categoryIds: string[]
}

export interface CertImage {
  id: string
  url: string
  caption: string
  isCover: boolean
  sortOrder: number
}

export interface Certification {
  id: string
  title: string
  issuer: string
  description: string
  credentialUrl: string
  coverImageUrl: string
  issuedOn: string | null
  expiresOn: string | null
  sortOrder: number
  categoryIds: string[]
  images: CertImage[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  achievedOn: string | null
  sortOrder: number
  categoryIds: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  description: string
  location: string
  startDate: string | null
  endDate: string | null
  isCurrent: boolean
  sortOrder: number
}

export interface Experience {
  id: string
  company: string
  role: string
  location: string
  description: string
  startDate: string | null
  endDate: string | null
  isCurrent: boolean
  sortOrder: number
  referenceUrl: string
  referenceLabel: string
}

export interface Resume {
  id: string
  categoryId: string | null
  label: string
  fileUrl: string
  isMain: boolean
  uploadedAt: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface SiteData {
  profile: Profile
  socialLinks: SocialLink[]
  categories: Category[]
  projects: Project[]
  skills: Skill[]
  certifications: Certification[]
  achievements: Achievement[]
  education: Education[]
  experience: Experience[]
  resumes: Resume[]
}

export interface AuthUser {
  id: string
  email: string
  name?: string
}

export interface LoginResponse {
  token: string
  expiresAt: string
  user: AuthUser
}

// Special pseudo-category id for the "ALL" view.
export const ALL = 'all'

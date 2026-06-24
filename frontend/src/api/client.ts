import type {
  Achievement,
  Category,
  Certification,
  Education,
  Experience,
  LoginResponse,
  Profile,
  Project,
  Resume,
  Skill,
  SiteData,
  SocialLink,
  ContactMessage,
} from '../types'

export type ProfileResponse = { profile: Profile; socialLinks: SocialLink[] }

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

const TOKEN_KEY = 'portfolio.token'

export const token = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const t = token.get()
  if (t) headers.set('Authorization', `Bearer ${t}`)

  const res = await fetch(`${BASE}/api${path}`, { ...options, headers })
  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, (data && data.error) || res.statusText)
  return data as T
}

const body = (v: unknown) => JSON.stringify(v)

export const api = {
  // ── public ──
  getSite: () => request<SiteData>('/site'),
  getProfile: () => request<ProfileResponse>('/profile'),
  getCategories: () => request<Category[]>('/categories'),
  getProjects: (categoryId?: string) =>
    request<Project[]>(`/projects${categoryId ? `?category=${categoryId}` : ''}`),
  getProject: (slug: string) => request<Project>(`/projects/${slug}`),
  recordView: (slug: string) => request<void>(`/projects/${slug}/view`, { method: 'POST' }),
  sendContact: (m: { name: string; email: string; subject: string; message: string }) =>
    request<{ status: string }>('/contact', { method: 'POST', body: body(m) }),

  // ── auth ──
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', { method: 'POST', body: body({ email, password }) }),
  me: () => request<{ id: string; email: string }>('/admin/me'),

  // ── admin: profile & socials ──
  updateProfile: (p: Profile) => request<Profile>('/admin/profile', { method: 'PUT', body: body(p) }),
  replaceSocialLinks: (links: SocialLink[]) =>
    request<SocialLink[]>('/admin/social-links', { method: 'PUT', body: body(links) }),

  // ── admin: projects ──
  adminListProjects: () => request<Project[]>('/admin/projects'),
  createProject: (input: Partial<Project>) =>
    request<Project>('/admin/projects', { method: 'POST', body: body(input) }),
  updateProject: (id: string, input: Partial<Project>) =>
    request<Project>(`/admin/projects/${id}`, { method: 'PUT', body: body(input) }),
  deleteProject: (id: string) => request<void>(`/admin/projects/${id}`, { method: 'DELETE' }),
  addProjectImage: (id: string, b: { url: string; caption?: string; isCover?: boolean }) =>
    request<{ id: string }>(`/admin/projects/${id}/images`, { method: 'POST', body: body(b) }),
  setProjectCover: (id: string, imageId: string) =>
    request<void>(`/admin/projects/${id}/cover/${imageId}`, { method: 'PUT' }),
  deleteProjectImage: (imageId: string) =>
    request<void>(`/admin/project-images/${imageId}`, { method: 'DELETE' }),

  // ── admin: skills ──
  listSkills: () => request<Skill[]>('/admin/skills'),
  createSkill: (input: Partial<Skill>) =>
    request<{ id: string }>('/admin/skills', { method: 'POST', body: body(input) }),
  updateSkill: (id: string, input: Partial<Skill>) =>
    request<void>(`/admin/skills/${id}`, { method: 'PUT', body: body(input) }),
  deleteSkill: (id: string) => request<void>(`/admin/skills/${id}`, { method: 'DELETE' }),

  // ── admin: certifications ──
  listCertifications: () => request<Certification[]>('/admin/certifications'),
  createCertification: (input: Partial<Certification>) =>
    request<{ id: string }>('/admin/certifications', { method: 'POST', body: body(input) }),
  updateCertification: (id: string, input: Partial<Certification>) =>
    request<void>(`/admin/certifications/${id}`, { method: 'PUT', body: body(input) }),
  deleteCertification: (id: string) =>
    request<void>(`/admin/certifications/${id}`, { method: 'DELETE' }),
  addCertImage: (id: string, b: { url: string; caption?: string; isCover?: boolean }) =>
    request<{ id: string }>(`/admin/certifications/${id}/images`, { method: 'POST', body: body(b) }),
  deleteCertImage: (imageId: string) =>
    request<void>(`/admin/certification-images/${imageId}`, { method: 'DELETE' }),

  // ── admin: achievements ──
  listAchievements: () => request<Achievement[]>('/admin/achievements'),
  createAchievement: (input: Partial<Achievement>) =>
    request<{ id: string }>('/admin/achievements', { method: 'POST', body: body(input) }),
  updateAchievement: (id: string, input: Partial<Achievement>) =>
    request<void>(`/admin/achievements/${id}`, { method: 'PUT', body: body(input) }),
  deleteAchievement: (id: string) =>
    request<void>(`/admin/achievements/${id}`, { method: 'DELETE' }),

  // ── admin: education ──
  listEducation: () => request<Education[]>('/admin/education'),
  createEducation: (input: Partial<Education>) =>
    request<{ id: string }>('/admin/education', { method: 'POST', body: body(input) }),
  updateEducation: (id: string, input: Partial<Education>) =>
    request<void>(`/admin/education/${id}`, { method: 'PUT', body: body(input) }),
  deleteEducation: (id: string) => request<void>(`/admin/education/${id}`, { method: 'DELETE' }),

  // ── admin: experience ──
  listExperience: () => request<Experience[]>('/admin/experience'),
  createExperience: (input: Partial<Experience>) =>
    request<{ id: string }>('/admin/experience', { method: 'POST', body: body(input) }),
  updateExperience: (id: string, input: Partial<Experience>) =>
    request<void>(`/admin/experience/${id}`, { method: 'PUT', body: body(input) }),
  deleteExperience: (id: string) => request<void>(`/admin/experience/${id}`, { method: 'DELETE' }),

  // ── admin: resumes ──
  listResumes: () => request<Resume[]>('/admin/resumes'),
  createResume: (input: { categoryId: string | null; label: string; fileUrl: string; isMain: boolean }) =>
    request<{ id: string }>('/admin/resumes', { method: 'POST', body: body(input) }),
  deleteResume: (id: string) => request<void>(`/admin/resumes/${id}`, { method: 'DELETE' }),

  // ── admin: contact messages ──
  listMessages: () => request<ContactMessage[]>('/admin/contact'),
  markMessageRead: (id: string) => request<void>(`/admin/contact/${id}/read`, { method: 'PUT' }),
  deleteMessage: (id: string) => request<void>(`/admin/contact/${id}`, { method: 'DELETE' }),

  // ── uploads ──
  async upload(file: File): Promise<{ url: string; filename: string }> {
    const form = new FormData()
    form.append('file', file)
    const headers = new Headers()
    const t = token.get()
    if (t) headers.set('Authorization', `Bearer ${t}`)
    const res = await fetch(`${BASE}/api/admin/uploads`, { method: 'POST', headers, body: form })
    const data = await res.json().catch(() => null)
    if (!res.ok) throw new ApiError(res.status, (data && data.error) || res.statusText)
    return data
  },
}

export { ApiError }

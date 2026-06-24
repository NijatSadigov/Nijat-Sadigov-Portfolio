import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, token } from '../api/client'

interface AuthState {
  authed: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = token.get()
    if (!t) {
      setLoading(false)
      return
    }
    api
      .me()
      .then(() => setAuthed(true))
      .catch(() => token.clear())
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password)
    token.set(res.token)
    setAuthed(true)
  }

  const logout = () => {
    token.clear()
    setAuthed(false)
  }

  return (
    <AuthContext.Provider value={{ authed, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import { useAuth } from './lib/auth'
import type { ReactNode } from 'react'

function RequireAuth({ children }: { children: ReactNode }) {
  const { authed, loading } = useAuth()
  if (loading) return <div className="grid min-h-screen place-items-center text-slate-400">Loading…</div>
  return authed ? <>{children}</> : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects/:slug" element={<ProjectDetail />} />
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

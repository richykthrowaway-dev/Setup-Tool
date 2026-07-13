import { Navigate, Outlet } from 'react-router-dom'
import { isSupabaseConfigured } from '../../lib/config'
import { useAuthStore } from '../../store/authStore'

/** Gates a route behind auth when Supabase is configured; passes through in local demo mode. */
export function ProtectedRoute() {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)

  if (!isSupabaseConfigured) return <Outlet />
  if (loading) return <div className="py-16 text-center text-sm text-slate-400">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

import { Link, NavLink, Outlet } from 'react-router-dom'
import { isSupabaseConfigured } from '../../lib/config'
import { useAuthStore } from '../../store/authStore'

export function AppShell() {
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="flex flex-col">
            <span className="text-xl font-bold">SuperMapper</span>
            <span className="text-xs text-slate-400">Universal sim racing hardware mapping platform</span>
          </Link>

          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? 'font-medium text-cyan-300' : 'text-slate-300 hover:text-white')}
            >
              Dashboard
            </NavLink>

            {!isSupabaseConfigured && (
              <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-xs text-amber-300">
                Local demo mode
              </span>
            )}

            {isSupabaseConfigured && user && (
              <>
                <span className="text-slate-400">{user.email}</span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="rounded-md border border-slate-600 px-3 py-1.5 text-slate-200 hover:border-slate-400"
                >
                  Sign out
                </button>
              </>
            )}

            {isSupabaseConfigured && !user && (
              <>
                <Link to="/login" className="text-slate-300 hover:text-white">
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-md bg-cyan-600 px-3 py-1.5 font-medium text-white hover:bg-cyan-500"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

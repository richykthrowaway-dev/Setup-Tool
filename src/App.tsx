import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { DashboardPage } from './pages/DashboardPage'
import { useAuthStore } from './store/authStore'

// The canvas engine (Konva) is the heaviest dependency in the bundle — only
// pay for it on the two routes that actually use it.
const CreatorPage = lazy(() => import('./pages/CreatorPage').then((m) => ({ default: m.CreatorPage })))
const ConfiguratorPage = lazy(() =>
  import('./pages/ConfiguratorPage').then((m) => ({ default: m.ConfiguratorPage })),
)

function PageLoading() {
  return <div className="py-16 text-center text-sm text-slate-400">Loading…</div>
}

function App() {
  useEffect(() => {
    useAuthStore.getState().init()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/creator/:templateId"
              element={
                <Suspense fallback={<PageLoading />}>
                  <CreatorPage />
                </Suspense>
              }
            />
            <Route
              path="/configure/:templateId"
              element={
                <Suspense fallback={<PageLoading />}>
                  <ConfiguratorPage />
                </Suspense>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { Link } from 'react-router-dom'
import { isSupabaseConfigured } from '../lib/config'
import { useAuthStore } from '../store/authStore'

export function LandingPage() {
  const user = useAuthStore((s) => s.user)
  const signedIn = !isSupabaseConfigured || Boolean(user)
  const ctaTo = signedIn ? '/dashboard' : '/signup'
  const ctaLabel = signedIn ? 'Go to dashboard' : 'Get started free'

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 py-20 text-center">
      <h1 className="text-4xl font-bold">Map any sim racing hardware, visually.</h1>
      <p className="text-lg text-slate-400">
        Upload a photo of your wheel, button box, shifter, pedals, or dash and turn it into an interactive,
        reusable template. Assign software bindings per game, car, or profile — no hardware-specific setup
        required.
      </p>
      <Link
        to={ctaTo}
        className="rounded-md bg-cyan-600 px-6 py-3 text-base font-medium text-white hover:bg-cyan-500"
      >
        {ctaLabel}
      </Link>
      {!isSupabaseConfigured && (
        <p className="text-xs text-amber-300">
          Running in local demo mode — data is stored only in this browser until a backend is configured.
        </p>
      )}
    </div>
  )
}

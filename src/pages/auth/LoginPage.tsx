import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Field } from '../../components/shared/Field'
import { isSupabaseConfigured } from '../../lib/config'
import { useAuthStore } from '../../store/authStore'

export function LoginPage() {
  const signIn = useAuthStore((s) => s.signIn)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-md py-16 text-center text-sm text-slate-400">
        Auth isn't configured in this environment.{' '}
        <Link to="/dashboard" className="text-cyan-400 underline">
          Continue in local demo mode
        </Link>
        .
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    navigate('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-4 py-16">
      <h1 className="text-xl font-semibold text-slate-100">Sign in</h1>
      <Field label="Email">
        <input
          className="input"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label="Password">
        <input
          className="input"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
      <p className="text-sm text-slate-400">
        No account?{' '}
        <Link to="/signup" className="text-cyan-400 underline">
          Sign up
        </Link>
      </p>
    </form>
  )
}

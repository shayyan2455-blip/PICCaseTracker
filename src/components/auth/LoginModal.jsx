import { useState } from 'react'

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { supabase } = await import('../../lib/supabaseClient')
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)
    if (authError) {
      setError(authError.message)
    }
  }

  async function handleGoogleLogin() {
    const { supabase } = await import('../../lib/supabaseClient')
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 transition-colors"
          style={{ color: 'var(--text-color)' }}
          aria-label="Close"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 className="mb-1 text-2xl font-bold">Welcome back</h2>
        <p className="mb-6 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
          Log in to your PIC Tracker account
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="login-email" className="mb-1 block text-sm font-medium">Email</label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'var(--second-bg-color)',
                borderColor: 'color-mix(in srgb, var(--text-color) 15%, transparent)',
                color: 'var(--text-color)',
              }}
              placeholder="you@lawfirm.com"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1 block text-sm font-medium">Password</label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'var(--second-bg-color)',
                borderColor: 'color-mix(in srgb, var(--text-color) 15%, transparent)',
                color: 'var(--text-color)',
              }}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full text-sm">
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 15%, transparent)' }} />
          <span className="text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>OR</span>
          <div className="h-px flex-1" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 15%, transparent)' }} />
        </div>

        <button onClick={handleGoogleLogin} className="btn-ghost w-full gap-2 text-sm">
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p className="mt-5 text-center text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
          Don't have an account?{' '}
          <button onClick={onSwitchToSignup} className="font-semibold underline underline-offset-2" style={{ color: 'var(--main-color)' }}>
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}

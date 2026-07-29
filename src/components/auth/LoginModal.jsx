import { useState } from 'react'

import { supabase } from '../../lib/supabaseClient'

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

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)
    if (authError) {
      setError(authError.message)
    } else {
      onClose()
    }
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

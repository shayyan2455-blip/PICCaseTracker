import { useState } from 'react'

import { supabase } from '../../lib/supabaseClient'

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

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

  async function handleResetPassword(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/app',
    })

    setLoading(false)
    if (resetError) {
      setError(resetError.message)
    } else {
      setResetSent(true)
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

        {error && !resetMode && (
          <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
        )}

        {resetMode ? (
          <>
            {resetSent ? (
              <div className="rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--main-color) 12%, transparent)', color: 'var(--main-color)' }}>
                Check your email for the password reset link.
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                {error && <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>}
                <div>
                  <label htmlFor="reset-email" className="mb-1 block text-sm font-medium">Email</label>
                  <input
                    id="reset-email"
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
                <button type="submit" disabled={loading} className="btn-primary w-full text-sm">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button type="button" onClick={() => { setResetMode(false); setError(''); setResetSent(false) }} className="text-sm underline underline-offset-2" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
                  Back to login
                </button>
              </form>
            )}
          </>
        ) : (
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
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="login-password" className="block text-sm font-medium">Password</label>
                <button type="button" onClick={() => setResetMode(true)} className="text-xs underline underline-offset-2" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
                  Forgot?
                </button>
              </div>
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
        )}

        {!resetMode && (
          <p className="mt-5 text-center text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
            Don't have an account?{' '}
            <button onClick={onSwitchToSignup} className="font-semibold underline underline-offset-2" style={{ color: 'var(--main-color)' }}>
              Sign up
            </button>
          </p>
        )}
      </div>
    </div>
  )
}

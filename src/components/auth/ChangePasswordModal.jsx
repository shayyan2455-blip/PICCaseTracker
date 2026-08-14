import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function ChangePasswordModal() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }

    setLoading(true)

    try {
      const { error: pErr } = await supabase.auth.updateUser({ password })
      if (pErr) throw new Error(pErr.message)

      await supabase.rpc('clear_must_change_password')
    } catch (err) {
      console.error('Password change error:', err)
      setError('Failed to update password. Please try again.')
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  function inputStyle() {
    return {
      backgroundColor: 'var(--second-bg-color)',
      borderColor: 'color-mix(in srgb, var(--text-color) 15%, transparent)',
      color: 'var(--text-color)',
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-1 text-2xl font-bold">Set a New Password</h2>
        <p className="mb-6 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
          For security, you must change your temporary password before continuing
        </p>

        {error && <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="cp-password" className="mb-1 block text-sm font-medium">New Password</label>
            <input
              id="cp-password"
              type={showPassword ? 'text' : 'password'}
              required minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors"
              style={inputStyle()}
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label htmlFor="cp-confirm" className="mb-1 block text-sm font-medium">Confirm Password</label>
            <input
              id="cp-confirm"
              type={showPassword ? 'text' : 'password'}
              required minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors"
              style={inputStyle()}
              placeholder="Re-enter your password"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="flex items-center gap-1.5 text-xs self-start transition-opacity hover:opacity-70"
            style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}
          >
            {showPassword ? (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
            {showPassword ? 'Hide passwords' : 'Show passwords'}
          </button>
          <button type="submit" disabled={loading} className="btn-primary w-full text-sm">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
          Not you?{' '}
          <button onClick={handleLogout} className="font-semibold underline underline-offset-2" style={{ color: 'var(--main-color)' }}>
            Log out
          </button>
        </p>
      </div>
    </div>
  )
}
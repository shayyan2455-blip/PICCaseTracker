import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { setOrgId } from '../../lib/org'

export default function SignupModal({ isOpen, onClose, onSwitchToLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [orgName, setOrgName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!orgName.trim()) {
      setError('Organization name is required')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + '/app' },
      })

      if (authError) { setError(authError.message); setLoading(false); return }

      if (!data?.user) { setError('Signup failed. Please try again.'); setLoading(false); return }

      const { data: rpcResult, error: rpcError } = await supabase.rpc('create_organization', {
        org_name: orgName.trim(),
        owner_id: data.user.id,
      })

      if (rpcError) { console.error('Create org error:', rpcError); setError('Failed to create organization. Please try again.'); setLoading(false); return }

      setOrgId(rpcResult)
      await supabase.auth.updateUser({ data: { default_organization_id: rpcResult } })
      onClose()
    } catch (e) {
      console.error('Signup error:', e)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  function resetForm() {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setOrgName('')
    setError('')
  }

  function handleSwitchToLogin() { resetForm(); onSwitchToLogin() }
  function handleClose() { resetForm(); onClose() }

  function inputStyle() {
    return {
      backgroundColor: 'var(--second-bg-color)',
      borderColor: 'color-mix(in srgb, var(--text-color) 15%, transparent)',
      color: 'var(--text-color)',
    }
  }

  function PasswordField({ id, value, onChange, placeholder }) {
    return (
      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          required
          minLength={6}
          value={value}
          onChange={onChange}
          className="w-full rounded-lg border px-4 py-2.5 pr-11 text-sm outline-none transition-colors"
          style={inputStyle()}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 transition-opacity hover:opacity-70"
          style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleClose} className="absolute right-4 top-4 rounded-lg p-1 transition-colors" style={{ color: 'var(--text-color)' }} aria-label="Close">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 className="mb-1 text-2xl font-bold">Set up your firm</h2>
        <p className="mb-6 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
          Create your account and organization
        </p>

        {error && <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="signup-email" className="mb-1 block text-sm font-medium">Email</label>
            <input id="signup-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors"
              style={inputStyle()} placeholder="you@lawfirm.com" />
          </div>
          <div>
            <label htmlFor="signup-password" className="mb-1 block text-sm font-medium">Password</label>
            <PasswordField id="signup-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>
          <div>
            <label htmlFor="signup-confirm" className="mb-1 block text-sm font-medium">Confirm Password</label>
            <PasswordField id="signup-confirm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" />
          </div>
          <div>
            <label htmlFor="signup-org" className="mb-1 block text-sm font-medium">Organization Name</label>
            <input id="signup-org" type="text" required value={orgName} onChange={(e) => setOrgName(e.target.value)}
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors"
              style={inputStyle()} placeholder="e.g. Shahid & Associates" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full text-sm">
            {loading ? 'Setting up...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
          Already have an account?{' '}
          <button onClick={handleSwitchToLogin} className="font-semibold underline underline-offset-2" style={{ color: 'var(--main-color)' }}>Log in</button>
        </p>
      </div>
    </div>
  )
}

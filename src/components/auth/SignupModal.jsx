import { useState } from 'react'

export default function SignupModal({ isOpen, onClose, onSwitchToLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgName, setOrgName] = useState('')
  const [step, setStep] = useState('account') // 'account' | 'org'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  async function handleCreateAccount(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { supabase } = await import('../../lib/supabaseClient')
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + '/app' },
    })

    setLoading(false)
    if (authError) {
      setError(authError.message)
      return
    }

    if (data?.user) {
      setStep('org')
    }
  }

  async function handleCreateOrg(e) {
    e.preventDefault()
    if (!orgName.trim()) return
    setError('')
    setLoading(true)

    const { supabase } = await import('../../lib/supabaseClient')

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: orgName.trim() })
      .select()
      .single()

    if (orgError) {
      setError(orgError.message)
      setLoading(false)
      return
    }

    const { error: memberError } = await supabase
      .from('members')
      .insert({
        organization_id: org.id,
        user_id: (await supabase.auth.getUser()).data.user.id,
        role: 'owner',
      })

    setLoading(false)
    if (memberError) {
      setError(memberError.message)
    }
  }

  function resetForm() {
    setEmail('')
    setPassword('')
    setOrgName('')
    setStep('account')
    setError('')
  }

  function handleSwitchToLogin() {
    resetForm()
    onSwitchToLogin()
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1 transition-colors"
          style={{ color: 'var(--text-color)' }}
          aria-label="Close"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {step === 'account' ? (
          <>
            <h2 className="mb-1 text-2xl font-bold">Create your account</h2>
            <p className="mb-6 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
              Start tracking your PIC cases
            </p>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
            )}

            <form onSubmit={handleCreateAccount} className="flex flex-col gap-4">
              <div>
                <label htmlFor="signup-email" className="mb-1 block text-sm font-medium">Email</label>
                <input
                  id="signup-email"
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
                <label htmlFor="signup-password" className="mb-1 block text-sm font-medium">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--second-bg-color)',
                    borderColor: 'color-mix(in srgb, var(--text-color) 15%, transparent)',
                    color: 'var(--text-color)',
                  }}
                  placeholder="At least 6 characters"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full text-sm">
                {loading ? 'Creating account...' : 'Continue'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
              Already have an account?{' '}
              <button onClick={handleSwitchToLogin} className="font-semibold underline underline-offset-2" style={{ color: 'var(--main-color)' }}>
                Log in
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 className="mb-1 text-2xl font-bold">Name your firm</h2>
            <p className="mb-6 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
              Create your organization to get started
            </p>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
            )}

            <form onSubmit={handleCreateOrg} className="flex flex-col gap-4">
              <div>
                <label htmlFor="org-name" className="mb-1 block text-sm font-medium">Organization name</label>
                <input
                  id="org-name"
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--second-bg-color)',
                    borderColor: 'color-mix(in srgb, var(--text-color) 15%, transparent)',
                    color: 'var(--text-color)',
                  }}
                  placeholder="e.g. Shahid & Associates"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full text-sm">
                {loading ? 'Creating...' : 'Create organization'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

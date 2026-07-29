import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { setOrgId } from '../../lib/org'

export default function SignupModal({ isOpen, onClose, onSwitchToLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgName, setOrgName] = useState('')
  const [step, setStep] = useState('account')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debug, setDebug] = useState([])
  const userIdRef = useRef(null)

  if (!isOpen) return null

  function addDebug(msg) {
    console.log('[signup]', msg)
    setDebug(prev => [...prev, msg])
  }

  async function handleCreateAccount(e) {
    e.preventDefault()
    setError('')
    setDebug([])
    setLoading(true)
    addDebug('Calling auth.signUp...')

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + '/app' },
    })

    if (authError) {
      addDebug('auth.signUp ERROR: ' + authError.message)
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data?.user) {
      userIdRef.current = data.user.id
      addDebug('User created, id: ' + data.user.id)

      const { data: { session } } = await supabase.auth.getSession()
      addDebug('Session exists: ' + (session ? 'YES' : 'NO'))
      if (session) addDebug('Session user: ' + session.user.id)
    } else {
      addDebug('WARNING: signUp returned no user')
    }

    setLoading(false)
    setStep('org')
  }

  async function handleCreateOrg(e) {
    e.preventDefault()
    if (!orgName.trim()) return
    setError('')
    setLoading(true)
    addDebug('--- Starting org creation ---')

    try {
      addDebug('userIdRef.current = ' + userIdRef.current)

      // Try RPC first (security definer, bypasses RLS)
      addDebug('Calling RPC create_organization...')
      const rpcResponse = await supabase.rpc('create_organization', {
        org_name: orgName.trim(),
        user_id: userIdRef.current,
      })
      addDebug('RPC response: data=' + JSON.stringify(rpcResponse.data) + ' error=' + JSON.stringify(rpcResponse.error))

      if (rpcResponse.data) {
        addDebug('RPC SUCCESS, org id: ' + rpcResponse.data)
        setLoading(false)
        setOrgId(rpcResponse.data)
        addDebug('Saved to localStorage')
        const updateRes = await supabase.auth.updateUser({
          data: { default_organization_id: rpcResponse.data },
        })
        addDebug('updateUser: ' + (updateRes.error ? 'ERROR ' + updateRes.error.message : 'OK'))
        addDebug('--- DONE ---')
        onClose()
        return
      }

      addDebug('RPC failed, trying direct inserts...')

      // Fallback: direct inserts
      addDebug('Inserting organization...')
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: orgName.trim() })
        .select()
        .single()
      addDebug('Org insert: data=' + JSON.stringify(org) + ' error=' + JSON.stringify(orgError))

      if (orgError) {
        addDebug('ORG INSERT FAILED: ' + orgError.message)
        setError('Could not create org: ' + orgError.message)
        setLoading(false)
        return
      }

      addDebug('Inserting member...')
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .insert({ organization_id: org.id, user_id: userIdRef.current, role: 'owner' })
        .select()
      addDebug('Member insert: data=' + JSON.stringify(memberData) + ' error=' + JSON.stringify(memberError))

      if (memberError) {
        addDebug('MEMBER INSERT FAILED: ' + memberError.message)
        setError('Account created but could not link you to org: ' + memberError.message)
        setLoading(false)
        return
      }

      addDebug('Direct insert SUCCESS, org: ' + org.id)
      setLoading(false)
      setOrgId(org.id)
      addDebug('Saved to localStorage')
      const updateRes = await supabase.auth.updateUser({
        data: { default_organization_id: org.id },
      })
      addDebug('updateUser: ' + (updateRes.error ? 'ERROR: ' + updateRes.error.message : 'OK'))
      addDebug('--- DONE ---')
      onClose()
    } catch (e) {
      addDebug('UNCAUGHT EXCEPTION: ' + e.message)
      addDebug('Stack: ' + e.stack)
      setError('Unexpected error: ' + e.message)
      setLoading(false)
    }
  }

  function resetForm() {
    setEmail('')
    setPassword('')
    setOrgName('')
    setStep('account')
    setError('')
    setDebug([])
    userIdRef.current = null
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

            {debug.length > 0 && (
              <div className="mb-4 max-h-32 overflow-y-auto rounded-lg bg-gray-900/10 px-3 py-2 text-xs font-mono" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
                {debug.map((line, i) => <div key={i}>{line}</div>)}
              </div>
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

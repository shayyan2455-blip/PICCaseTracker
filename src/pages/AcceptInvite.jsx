import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function AcceptInvite() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('No invite token provided'); return }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setStatus('login_required')
        setMessage('Please log in or sign up to accept this invite.')
        return
      }

      handleAcceptInvite(session.user.id)
    })
  }, [token])

  async function handleAcceptInvite(userId) {
    setStatus('loading')
    setMessage('Accepting invite...')

    const { data: invite, error: invErr } = await supabase
      .from('invites')
      .select('*')
      .eq('token', token)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (invErr || !invite) {
      setStatus('error')
      setMessage('Invite not found or expired.')
      return
    }

    const { error: memberErr } = await supabase
      .from('members')
      .insert({
        organization_id: invite.organization_id,
        user_id: userId,
        role: invite.role,
      })

    if (memberErr) {
      console.error('Accept invite error:', memberErr)
      setStatus('error')
      setMessage('Failed to join the organization. The invite may have expired or already been used.')
      return
    }

    await supabase
      .from('invites')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invite.id)

    setStatus('success')
    setMessage('You have joined the organization!')
  }

  return (
    <div className="mx-auto max-w-md pt-20 text-center">
      <div className="card">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-b-transparent" style={{ borderColor: 'var(--main-color)', borderBottomColor: 'transparent' }} />
            <p className="text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>{message}</p>
          </div>
        )}

        {status === 'login_required' && (
          <div className="py-8">
            <p className="font-medium">{message}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link to="/" className="btn-primary text-sm px-6 py-2.5">Log In</Link>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <svg className="h-6 w-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="font-medium">{message}</p>
            <Link to="/app" className="btn-primary mt-6 inline-flex text-sm px-6 py-2.5">Go to Dashboard</Link>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <svg className="h-6 w-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <p className="font-medium" style={{ color: '#ef4444' }}>{message}</p>
            <Link to="/app" className="btn-ghost mt-6 inline-flex text-sm px-6 py-2.5">Dashboard</Link>
          </div>
        )}
      </div>
    </div>
  )
}

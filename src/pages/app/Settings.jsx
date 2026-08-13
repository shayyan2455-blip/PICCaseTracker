import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { getOrgId } from '../../lib/org'

export default function Settings() {
  const [reminderDays, setReminderDays] = useState(2)
  const [reminderTime, setReminderTime] = useState('07:00')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [loadingPrefs, setLoadingPrefs] = useState(true)
  const [members, setMembers] = useState([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('lawyer')
  const [inviting, setInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [currentUserRole, setCurrentUserRole] = useState(null)

  useEffect(() => {
    getOrgId().then(async (orgId) => {
      if (!orgId) { setLoadingPrefs(false); return }

      const { data: prefs } = await supabase
        .from('org_reminder_prefs')
        .select('*')
        .eq('organization_id', orgId)
        .maybeSingle()
      if (prefs) {
        setReminderDays(prefs.days_before)
        setReminderTime(prefs.send_at_time?.slice(0, 5) || '07:00')
      }

      const { data: m } = await supabase.rpc('get_org_members', { org_id: orgId })
      setMembers(m || [])

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const me = (m || []).find((mm) => mm.user_id === user.id)
        setCurrentUserRole(me?.role || null)
      }

      setLoadingPrefs(false)
    })
  }, [])

  async function handleSave() {
    setError('')
    setSaved(false)
    const orgId = await getOrgId()
    if (!orgId) { setError('No organization found'); return }

    const { error: err } = await supabase
      .from('org_reminder_prefs')
      .upsert({
        organization_id: orgId,
        days_before: reminderDays,
        send_at_time: reminderTime + ':00',
        enabled: true,
      }, { onConflict: 'organization_id' })

    if (err) { console.error('Save prefs error:', err); setError('Failed to save preferences. Please try again.'); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleInvite(e) {
    e.preventDefault()
    setInviteError('')
    setInviteSuccess('')

    if (!inviteEmail.trim()) return
    setInviting(true)

    const orgId = await getOrgId()
    if (!orgId) { setInviteError('No organization'); setInviting(false); return }

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!session || !token) { setInviteError('Not logged in'); setInviting(false); return }

    try {
      const res = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: 'invite-user',
          email: inviteEmail.trim(),
          role: inviteRole,
          orgId,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setInviteError(data.error || 'Failed to send invitation')
        setInviting(false)
        return
      }

      setInviteSuccess(`Invitation sent to ${inviteEmail.trim()}`)
      setInviteEmail('')
      setInviting(false)

      const { data: m } = await supabase.rpc('get_org_members', { org_id: orgId })
      setMembers(m || [])
    } catch (err) {
      console.error('Invite error:', err)
      setInviteError('Failed to connect to server. Please try again.')
      setInviting(false)
    }
  }

  async function handleSendTestReminder() {
    setSending(true)
    setError('')
    setSent(false)

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!session?.user?.email) {
      setError('No email found on your account')
      setSending(false)
      return
    }
    if (!token) {
      setError('Not logged in')
      setSending(false)
      return
    }

    try {
      const res = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ to: session.user.email, type: 'test' }),
      })

      if (!res.ok) {
        const errBody = await res.json()
        throw new Error(errBody.error || 'Failed to send')
      }

      setSent(true)
    } catch (e) {
      console.error('Test reminder error:', e)
      setError('Failed to send test email. Make sure the API is configured correctly.')
    }
    setSending(false)
  }

  function inputStyle() {
    return {
      backgroundColor: 'var(--second-bg-color)',
      borderColor: 'color-mix(in srgb, var(--text-color) 15%, transparent)',
      color: 'var(--text-color)',
    }
  }

  if (loadingPrefs) {
    return (
      <div className="mx-auto max-w-2xl pt-4">
        <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
        <p className="mt-4">Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl pt-4">
      <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
      <p className="mt-2" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
        Manage your organization and reminder preferences
      </p>

      <div className="mt-8 flex flex-col gap-6">
        <div className="card">
          <h2 className="text-lg font-bold">Reminder Preferences</h2>
          <p className="mt-1 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            Reminders are sent to all lawyers and owners in your firm
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
          )}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Send reminder (days before)</label>
              <select
                value={reminderDays}
                onChange={(e) => setReminderDays(Number(e.target.value))}
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none"
                style={inputStyle()}
              >
                <option value={0}>Same day</option>
                <option value={1}>1 day before</option>
                <option value={2}>2 days before</option>
                <option value={3}>3 days before</option>
                <option value={5}>5 days before</option>
                <option value={7}>7 days before</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Send at (PKT)</label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none"
                style={inputStyle()}
              />
            </div>
          </div>

          <button onClick={handleSave} className="btn-primary mt-5 text-sm px-6 py-2.5">
            {saved ? 'Saved!' : 'Save Preferences'}
          </button>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold">Test Reminder</h2>
          <p className="mt-1 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            Send a test email to your account to verify email delivery
          </p>
          {sent && (
            <div className="mt-4 rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-500">
              Test email sent! Check your inbox.
            </div>
          )}
          <button
            onClick={handleSendTestReminder}
            disabled={sending}
            className="btn-ghost mt-4 text-sm px-6 py-2.5"
          >
            {sending ? 'Sending...' : 'Send Test Email'}
          </button>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold">Members</h2>

          <div className="mt-4 flex flex-col gap-2">
            {members.map((m) => (
              <div
                key={m.user_id}
                className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
                style={{ borderColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }}
              >
                <div>
                  <p className="font-medium">{m.email}</p>
                  <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
                    {m.role} &middot; Joined {new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize" style={{
                  backgroundColor: m.role === 'owner' ? 'color-mix(in srgb, var(--main-color) 12%, transparent)' : 'color-mix(in srgb, var(--text-color) 8%, transparent)',
                  color: m.role === 'owner' ? 'var(--main-color)' : 'color-mix(in srgb, var(--text-color) 60%, transparent)',
                }}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>

          {currentUserRole === 'owner' ? (
            <>
              <form onSubmit={handleInvite} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium">Email</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@lawfirm.com"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    style={inputStyle()}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    style={inputStyle()}
                  >
                    <option value="lawyer">Lawyer</option>
                    <option value="clerk">Clerk</option>
                  </select>
                </div>
                <button type="submit" disabled={inviting} className="btn-primary text-sm px-4 py-2.5 whitespace-nowrap">
                  {inviting ? 'Inviting...' : 'Invite'}
                </button>
              </form>

              {inviteSuccess && (
                <div className="mt-3 rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--main-color) 12%, transparent)', color: 'var(--main-color)' }}>
                  {inviteSuccess}
                </div>
              )}

              {inviteError && (
                <div className="mt-3 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">{inviteError}</div>
              )}
            </>
          ) : (
            <p className="mt-4 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
              Only the organization owner can invite new members.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

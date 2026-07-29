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

  useEffect(() => {
    getOrgId().then(async (orgId) => {
      if (!orgId) { setLoadingPrefs(false); return }
      const { data } = await supabase
        .from('org_reminder_prefs')
        .select('*')
        .eq('organization_id', orgId)
        .maybeSingle()
      if (data) {
        setReminderDays(data.days_before)
        setReminderTime(data.send_at_time?.slice(0, 5) || '07:00')
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

    if (err) { setError(err.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleSendTestReminder() {
    setSending(true)
    setError('')
    setSent(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      setError('No email found on your account')
      setSending(false)
      return
    }

    try {
      const res = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: user.email, type: 'test' }),
      })

      if (!res.ok) {
        const errBody = await res.json()
        throw new Error(errBody.error || 'Failed to send')
      }

      setSent(true)
    } catch (e) {
      setError(e.message)
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

          <button
            onClick={handleSave}
            className="btn-primary mt-5 text-sm px-6 py-2.5"
          >
            {saved ? 'Saved!' : 'Save Preferences'}
          </button>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold">Test Reminder</h2>
          <p className="mt-1 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            Send a test email to your account to verify email delivery is working
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
          <p className="mt-1 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            Invite colleagues to your firm — coming in a later update
          </p>
          <div className="mt-4 rounded-lg px-4 py-8 text-center" style={{ backgroundColor: 'var(--second-bg-color)' }}>
            <p className="text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 40%, transparent)' }}>
              Member management will be available soon
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

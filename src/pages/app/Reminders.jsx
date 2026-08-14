import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { getOrgId } from '../../lib/org'
import { useCasesContext } from '../../lib/CasesContext'
import { useHearingsContext } from '../../lib/HearingsContext'

export default function Reminders() {
  const { cases } = useCasesContext()
  const { hearings, loading } = useHearingsContext()
  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(true)
  const [sendingReminders, setSendingReminders] = useState(false)
  const [sendResult, setSendResult] = useState('')

  useEffect(() => {
    getOrgId().then((orgId) => {
      if (!orgId) { setLogsLoading(false); return }
      supabase
        .from('reminder_log')
        .select('*, hearing:hearings!inner(case_id, due_date, outcome)')
        .eq('channel', 'email')
        .order('sent_at', { ascending: false })
        .limit(20)
        .then(({ data }) => {
          setLogs(data || [])
          setLogsLoading(false)
        })
    })
  }, [])

  async function handleSendReminders() {
    setSendingReminders(true)
    setSendResult('')
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) {
      setSendResult('Failed: not signed in')
      setSendingReminders(false)
      return
    }
    try {
      const res = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: 'daily' }),
      })
      const data = await res.json()
      if (res.ok) {
        setSendResult(`Sent ${data.sent} reminder email${data.sent !== 1 ? 's' : ''}`)
      } else {
        setSendResult('Failed: ' + (data.error || 'Unknown error'))
      }
    } catch (e) {
      setSendResult('Failed: ' + e.message)
    }
    setSendingReminders(false)
  }

  const { dueToday, dueThisWeek, dueLater } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekEnd = new Date(today)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const pending = (hearings || []).filter((h) => h.outcome === 'pending')
    const dueToday = pending.filter((h) => {
      const d = new Date(h.due_date); d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime()
    })
    const dueThisWeek = pending.filter((h) => {
      const d = new Date(h.due_date); d.setHours(0, 0, 0, 0)
      return d > today && d <= weekEnd
    })
    const dueLater = pending.filter((h) => {
      const d = new Date(h.due_date); d.setHours(0, 0, 0, 0)
      return d > weekEnd
    })
    return { dueToday, dueThisWeek, dueLater }
  }, [hearings])

  function getCaseTitle(caseId) {
    const c = cases.find((c) => c.id === caseId)
    return c?.title || `Case #${caseId.slice(0, 8)}`
  }

  function daysUntil(dateStr) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const d = new Date(dateStr); d.setHours(0, 0, 0, 0)
    return Math.round((d - today) / 86400000)
  }

  const hearingSections = [
    { label: 'Due Today', items: dueToday, color: 'var(--main-color)' },
    { label: 'Due This Week', items: dueThisWeek, color: 'var(--main-color)' },
    { label: 'Due Later', items: dueLater, color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' },
  ]

  return (
    <div className="mx-auto max-w-6xl pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Reminders</h1>
          <p className="mt-1 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
            Upcoming deadlines and sent reminder history
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          {sendResult && (
            <span className="self-center text-xs font-medium" style={{ color: sendResult.startsWith('Sent') ? 'var(--main-color)' : '#ef4444' }}>
              {sendResult}
            </span>
          )}
          <button
            onClick={handleSendReminders}
            disabled={sendingReminders}
            className="btn-ghost px-3 py-2 text-xs font-medium sm:text-sm"
          >
            {sendingReminders ? 'Sending...' : 'Send Reminders Now'}
          </button>
          <Link to="/app/settings" className="btn-primary px-3 py-2 text-xs font-medium sm:text-sm sm:px-4">
            Settings
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hearingSections.map((section) => (
              <div key={section.label} className="card p-0 overflow-hidden">
                <div className="px-4 py-3 border-b" style={{ borderColor: 'color-mix(in srgb, var(--text-color) 8%, transparent)' }}>
                  <h3 className="text-sm font-semibold" style={{ color: section.color }}>
                    {section.label} ({section.items.length})
                  </h3>
                </div>
                {section.items.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 40%, transparent)' }}>
                    All clear
                  </p>
                ) : (
                  <div className="flex flex-col">
                    {section.items.map((h) => (
                      <Link
                        key={h.id}
                        to={`/app/cases/${h.case_id}`}
                        className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm transition-colors hover:opacity-80"
                        style={{ borderColor: 'color-mix(in srgb, var(--text-color) 5%, transparent)' }}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{getCaseTitle(h.case_id)}</p>
                          <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 40%, transparent)' }}>
                            {new Date(h.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs font-medium" style={{ color: section.label === 'Due Later' ? 'color-mix(in srgb, var(--text-color) 50%, transparent)' : 'var(--main-color)' }}>
                          {daysUntil(h.due_date) === 0 ? 'Today' : daysUntil(h.due_date) < 0 ? `${Math.abs(daysUntil(h.due_date))}d overdue` : `${daysUntil(h.due_date)}d`}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-bold mb-4">Sent Reminder History</h2>
            <div className="card p-0 overflow-hidden">
              {logsLoading ? (
                <div className="p-6">
                  <div className="h-12 animate-pulse rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 8%, transparent)' }} />
                </div>
              ) : logs.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 40%, transparent)' }}>
                  No reminder emails have been sent yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: 'var(--second-bg-color)' }}>
                        <th className="px-4 py-3 text-left font-medium">Date Sent</th>
                        <th className="px-4 py-3 text-left font-medium">Case</th>
                        <th className="px-4 py-3 text-left font-medium">Due Date</th>
                        <th className="px-4 py-3 text-left font-medium">Channel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-t" style={{ borderColor: 'color-mix(in srgb, var(--text-color) 5%, transparent)' }}>
                          <td className="px-4 py-3">
                            {new Date(log.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-4 py-3">
                            {log.hearing ? (
                              <Link to={`/app/cases/${log.hearing.case_id}`} className="underline underline-offset-2 hover:opacity-80" style={{ color: 'var(--main-color)' }}>
                                {getCaseTitle(log.hearing.case_id)}
                              </Link>
                            ) : (
                              <span style={{ color: 'color-mix(in srgb, var(--text-color) 40%, transparent)' }}>Deleted case</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {log.hearing ? new Date(log.hearing.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: 'color-mix(in srgb, var(--main-color) 12%, transparent)', color: 'var(--main-color)' }}>
                              {log.channel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

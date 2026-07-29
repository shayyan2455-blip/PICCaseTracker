import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { setOrgId, getOrgId } from '../../lib/org'
import { useCasesContext } from '../../lib/CasesContext'
import { useHearingsContext } from '../../lib/HearingsContext'
import CaseStatusBadge from '../../components/cases/CaseStatusBadge'
import DueTodayList from '../../components/dashboard/DueTodayList'
import UpcomingWeekList from '../../components/dashboard/UpcomingWeekList'
import OverdueList from '../../components/dashboard/OverdueList'

export default function Dashboard() {
  const { cases } = useCasesContext()
  const { getPendingCounts } = useHearingsContext()
  const [orgState, setOrgState] = useState('loading')
  const [orgName, setOrgName] = useState('')
  const [orgLoading, setOrgLoading] = useState(false)
  const [orgError, setOrgError] = useState('')

  const { dueToday, dueThisWeek, overdue, totalPending } = getPendingCounts()

  useEffect(() => {
    getOrgId().then((id) => setOrgState(id ? 'ready' : 'no_org'))
  }, [])

  async function handleCreateOrg(e) {
    e.preventDefault()
    if (!orgName.trim()) return
    setOrgError('')
    setOrgLoading(true)

    const logs = []

    function dbg(msg) {
      logs.push(msg)
      console.log('[dbg]', msg)
      setOrgError(logs.join('\n'))
    }

    try {
      dbg('Step 1: Getting current user...')
      const { data: { user }, error: uErr } = await supabase.auth.getUser()
      if (uErr) { dbg('FAIL getUser: ' + uErr.message); setOrgLoading(false); return }
      if (!user) { dbg('FAIL: no user'); setOrgLoading(false); return }
      dbg('OK user=' + user.id)

      dbg('Step 2: Calling RPC create_organization...')
      let rpcResult, rpcError
      try {
        const resp = await supabase.rpc('create_organization', {
          org_name: orgName.trim(),
          user_id: user.id,
        })
        rpcResult = resp.data
        rpcError = resp.error
      } catch (rpcEx) {
        dbg('RPC THREW EXCEPTION: ' + rpcEx.message)
        rpcResult = null
      }
      dbg('RPC result=' + JSON.stringify(rpcResult) + ' error=' + JSON.stringify(rpcError))

      if (rpcResult) {
        dbg('RPC SUCCESS! Org=' + rpcResult)
        setOrgId(rpcResult)
        await supabase.auth.updateUser({ data: { default_organization_id: rpcResult } })
        dbg('DONE. Reloading...')
        window.location.reload()
        return
      }

      dbg('RPC unavailable. Trying direct insert...')
      const { data: org, error: orgErr } = await supabase
        .from('organizations')
        .insert({ name: orgName.trim() })
        .select()
        .single()
      dbg('Direct org insert: ' + (orgErr ? 'FAIL: ' + orgErr.message : 'OK id=' + org?.id))

      if (orgErr) { dbg('ABORT: ' + orgErr.message); setOrgLoading(false); return }

      dbg('Inserting member...')
      const { error: memErr } = await supabase
        .from('members')
        .insert({ organization_id: org.id, user_id: user.id, role: 'owner' })
      dbg('Member insert: ' + (memErr ? 'FAIL: ' + memErr.message : 'OK'))

      if (memErr) { dbg('ABORT: ' + memErr.message); setOrgLoading(false); return }

      dbg('Direct SUCCESS! Org=' + org.id)
      setOrgId(org.id)
      await supabase.auth.updateUser({ data: { default_organization_id: org.id } })
      dbg('DONE. Reloading...')
      window.location.reload()
    } catch (e) {
      dbg('UNCAUGHT EXCEPTION: ' + e.message + ' | stack: ' + (e.stack || ''))
      setOrgLoading(false)
    }
  }

  const activeCases = useMemo(() => cases.filter((c) => !['disposed', 'closed'].includes(c.status)), [cases])
  const recentCases = useMemo(() => [...cases].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5), [cases])

  const enrichedDueToday = useMemo(() =>
    dueToday.map((h) => ({ ...h, case_title: cases.find((c) => c.id === h.case_id)?.title })), [dueToday, cases])
  const enrichedDueThisWeek = useMemo(() =>
    dueThisWeek.map((h) => ({ ...h, case_title: cases.find((c) => c.id === h.case_id)?.title })), [dueThisWeek, cases])
  const enrichedOverdue = useMemo(() =>
    overdue.map((h) => ({ ...h, case_title: cases.find((c) => c.id === h.case_id)?.title })), [overdue, cases])

  if (orgState === 'loading') {
    return (
      <div className="mx-auto max-w-6xl pt-4">
        <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
        <p className="mt-4">Loading...</p>
      </div>
    )
  }

  if (orgState === 'no_org') {
    return (
      <div className="mx-auto max-w-md pt-20">
        <div className="card">
          <div className="mb-4 inline-flex rounded-xl p-3" style={{ backgroundColor: 'color-mix(in srgb, var(--main-color) 15%, transparent)', color: 'var(--main-color)' }}>
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">Set up your firm</h2>
          <p className="mt-2 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
            Create an organization to start tracking cases
          </p>

          {orgError && (
            <div className="mt-4 max-h-60 overflow-y-auto whitespace-pre-wrap rounded-lg bg-gray-900/10 px-4 py-3 text-left text-xs font-mono leading-relaxed" style={{ color: 'var(--text-color)' }}>
              {orgError}
            </div>
          )}

          <form onSubmit={handleCreateOrg} className="mt-6 flex flex-col gap-4">
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Shahid & Associates"
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none text-center"
              style={{
                backgroundColor: 'var(--second-bg-color)',
                borderColor: 'color-mix(in srgb, var(--text-color) 15%, transparent)',
                color: 'var(--text-color)',
              }}
              required
            />
            <button type="submit" disabled={orgLoading} className="btn-primary w-full text-sm py-2.5">
              {orgLoading ? 'Creating...' : 'Create Organization'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl pt-4">
      <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
      <p className="mt-2" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
        Your case deadlines at a glance
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <h3 className="text-sm font-medium uppercase tracking-wider" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            Due Today
          </h3>
          <p className="mt-2 text-3xl font-bold" style={{ color: dueToday.length > 0 ? 'var(--main-color)' : 'inherit' }}>
            {dueToday.length}
          </p>
          <p className="mt-1 text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            {dueToday.length > 0 ? 'Requiring attention' : 'No deadlines today'}
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium uppercase tracking-wider" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            This Week
          </h3>
          <p className="mt-2 text-3xl font-bold">{dueThisWeek.length}</p>
          <p className="mt-1 text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            {dueThisWeek.length > 0 ? 'Upcoming deadlines' : 'No upcoming deadlines'}
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium uppercase tracking-wider" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            Overdue
          </h3>
          <p className="mt-2 text-3xl font-bold" style={{ color: overdue.length > 0 ? '#ef4444' : 'inherit' }}>
            {overdue.length}
          </p>
          <p className="mt-1 text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            {overdue.length > 0 ? 'Past due date' : 'All up to date'}
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium uppercase tracking-wider" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            Active Cases
          </h3>
          <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--main-color)' }}>{activeCases.length}</p>
          <p className="mt-1 text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            {activeCases.length === 0 ? 'No cases yet' : `Pending (${totalPending} deadlines)`}
          </p>
        </div>
      </div>

      {enrichedOverdue.length > 0 && (
        <div className="mt-6">
          <OverdueList hearings={enrichedOverdue} />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {enrichedDueToday.length > 0 && <DueTodayList hearings={enrichedDueToday} />}
        {enrichedDueThisWeek.length > 0 && <UpcomingWeekList hearings={enrichedDueThisWeek} />}
      </div>

      <div className="mt-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent Cases</h3>
            <Link to="/app/cases" className="text-sm font-medium underline underline-offset-2" style={{ color: 'var(--main-color)' }}>
              View all
            </Link>
          </div>

          {recentCases.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <svg className="mb-4 h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" style={{ color: 'color-mix(in srgb, var(--text-color) 20%, transparent)' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              <p className="font-medium" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
                No cases yet
              </p>
              <Link to="/app/cases/new" className="btn-primary mt-4 text-sm px-4 py-2">
                Create your first case
              </Link>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {recentCases.map((c) => (
                <Link
                  key={c.id}
                  to={`/app/cases/${c.id}`}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:opacity-80"
                  style={{ borderColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{c.title}</p>
                    <p className="truncate text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
                      {c.case_number || `${c.applicant_name} vs ${c.public_body}`}
                    </p>
                  </div>
                  <CaseStatusBadge status={c.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

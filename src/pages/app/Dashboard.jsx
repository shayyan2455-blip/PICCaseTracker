import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCasesContext } from '../../lib/CasesContext'
import CaseStatusBadge from '../../components/cases/CaseStatusBadge'

export default function Dashboard() {
  const { cases } = useCasesContext()

  const activeCases = useMemo(() => cases.filter((c) => !['disposed', 'closed'].includes(c.status)), [cases])
  const dueToday = 0
  const dueThisWeek = 0
  const recentCases = useMemo(() => [...cases].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5), [cases])

  return (
    <div className="mx-auto max-w-6xl pt-4">
      <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
      <p className="mt-2" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
        Your case deadlines at a glance
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card">
          <h3 className="text-sm font-medium uppercase tracking-wider" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            Due Today
          </h3>
          <p className="mt-2 text-3xl font-bold" style={{ color: dueToday > 0 ? 'var(--main-color)' : 'inherit' }}>{dueToday}</p>
          <p className="mt-1 text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            {dueToday > 0 ? 'Deadlines requiring attention' : 'No deadlines today'}
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium uppercase tracking-wider" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            This Week
          </h3>
          <p className="mt-2 text-3xl font-bold">{dueThisWeek}</p>
          <p className="mt-1 text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            {dueThisWeek > 0 ? 'Upcoming this week' : 'No upcoming deadlines'}
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium uppercase tracking-wider" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            Active Cases
          </h3>
          <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--main-color)' }}>{activeCases.length}</p>
          <p className="mt-1 text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            {activeCases.length === 0 ? 'No cases yet — create your first' : 'In progress'}
          </p>
        </div>
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

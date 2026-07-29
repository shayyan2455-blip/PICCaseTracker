export default function Dashboard() {
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
          <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--main-color)' }}>0</p>
          <p className="mt-1 text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            No deadlines today
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium uppercase tracking-wider" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            This Week
          </h3>
          <p className="mt-2 text-3xl font-bold">0</p>
          <p className="mt-1 text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            Upcoming this week
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium uppercase tracking-wider" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            Active Cases
          </h3>
          <p className="mt-2 text-3xl font-bold">0</p>
          <p className="mt-1 text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            No cases yet — create your first
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="card">
          <h3 className="mb-4 text-lg font-bold">Recent Activity</h3>
          <div className="flex flex-col items-center py-12 text-center">
            <svg className="mb-4 h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" style={{ color: 'color-mix(in srgb, var(--text-color) 20%, transparent)' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <p className="font-medium" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
              No activity yet
            </p>
            <p className="mt-1 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 40%, transparent)' }}>
              Upload a case to get started
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'

export default function UpcomingWeekList({ hearings }) {
  if (hearings.length === 0) return null

  return (
    <div className="card">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
        This Week ({hearings.length})
      </h3>
      <div className="flex flex-col gap-2">
        {hearings.map((h) => (
          <Link
            key={h.id}
            to={`/app/cases/${h.case_id}`}
            className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:opacity-80"
            style={{ borderColor: 'color-mix(in srgb, var(--text-color) 8%, transparent)' }}
          >
            <span className="truncate font-medium">{h.case_title || `Case #${h.case_id.slice(0, 8)}`}</span>
            <span className="shrink-0 text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
              {new Date(h.due_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

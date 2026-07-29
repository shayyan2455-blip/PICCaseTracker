import { Link } from 'react-router-dom'

export default function OverdueList({ hearings }) {
  if (hearings.length === 0) return null

  return (
    <div className="card border-0 p-0 overflow-hidden" style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
      <div className="px-4 py-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)' }}>
        <h3 className="text-sm font-semibold text-red-500">
          Overdue ({hearings.length})
        </h3>
      </div>
      <div className="flex flex-col">
        {hearings.map((h) => (
          <Link
            key={h.id}
            to={`/app/cases/${h.case_id}`}
            className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm transition-colors hover:opacity-80"
            style={{ borderColor: 'color-mix(in srgb, var(--text-color) 5%, transparent)' }}
          >
            <span className="font-medium truncate">{h.case_title || `Case #${h.case_id.slice(0, 8)}`}</span>
            <span className="shrink-0 text-xs font-medium text-red-500">
              {Math.ceil((Date.now() - new Date(h.due_date).getTime()) / 86400000)} days overdue
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

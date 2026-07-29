import { Link } from 'react-router-dom'

export default function DueTodayList({ hearings }) {
  if (hearings.length === 0) return null

  return (
    <div className="card border-0 p-0 overflow-hidden" style={{ border: '1px solid color-mix(in srgb, var(--main-color) 30%, transparent)' }}>
      <div className="px-4 py-3" style={{ backgroundColor: 'color-mix(in srgb, var(--main-color) 8%, transparent)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--main-color)' }}>
          Due Today ({hearings.length})
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
            <span className="shrink-0 text-xs font-medium" style={{ color: 'var(--main-color)' }}>
              Respond today
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

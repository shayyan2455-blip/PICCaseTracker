import { Link } from 'react-router-dom'

function getReminderLabel(notes) {
  if (!notes) return 'Hearing'
  const n = notes.toLowerCase()
  if (n.includes('rti') && n.includes('appeal')) return 'Appeal deadline'
  if (n.includes('rti') && n.includes('filing')) return 'RTI filing'
  if (n.includes('appeal')) return 'Appeal deadline'
  if (n.includes('notice')) return 'Notice deadline'
  return 'Hearing'
}

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
            <div className="shrink-0 flex items-center gap-2 text-right">
              <span className="text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
                {getReminderLabel(h.notes)}
              </span>
              <span className="shrink-0 text-xs font-medium" style={{ color: 'var(--main-color)' }}>
                Respond today
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

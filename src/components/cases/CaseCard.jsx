import { Link } from 'react-router-dom'
import CaseStatusBadge from './CaseStatusBadge'

export default function CaseCard({ c }) {
  return (
    <Link to={`/app/cases/${c.id}`} className="card block">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{c.title}</h3>
          <p className="mt-0.5 text-sm truncate" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
            {c.applicant_name} vs {c.public_body}
          </p>
          {c.case_number && (
            <p className="mt-0.5 text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 40%, transparent)' }}>
              {c.case_number}
            </p>
          )}
        </div>
        <CaseStatusBadge status={c.status} />
      </div>
      <p className="mt-3 text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 40%, transparent)' }}>
        Created {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
    </Link>
  )
}

import { Link } from 'react-router-dom'
import CaseStatusBadge from './CaseStatusBadge'

export default function CaseCard({ c }) {
  const titleParts = c.title.split(/\s+vs\.?\s+/i)
  const hasVs = titleParts.length > 1

  return (
    <Link to={`/app/cases/${c.id}`} className="card block">
      <div className="flex items-start justify-between gap-4">
        <h3 className="min-w-0 flex-1 break-words font-semibold leading-snug">
          {hasVs ? (
            <>
              <span className="block">{titleParts[0]}</span>
              <span
                className="my-0.5 block text-[11px] font-medium uppercase tracking-wide"
                style={{ color: 'color-mix(in srgb, var(--text-color) 40%, transparent)' }}
              >
                vs
              </span>
              <span className="block">{titleParts.slice(1).join(' vs ')}</span>
            </>
          ) : (
            c.title
          )}
        </h3>
        <CaseStatusBadge status={c.status} />
      </div>

      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex gap-3">
          <dt className="w-24 shrink-0 pt-px text-[11px] font-medium uppercase tracking-wide" style={{ color: 'color-mix(in srgb, var(--text-color) 40%, transparent)' }}>
            Applicant
          </dt>
          <dd className="min-w-0 flex-1 break-words">{c.applicant_name}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-24 shrink-0 pt-px text-[11px] font-medium uppercase tracking-wide" style={{ color: 'color-mix(in srgb, var(--text-color) 40%, transparent)' }}>
            Public Body
          </dt>
          <dd className="min-w-0 flex-1 break-words">{c.public_body}</dd>
        </div>
        {c.case_number && (
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 pt-px text-[11px] font-medium uppercase tracking-wide" style={{ color: 'color-mix(in srgb, var(--text-color) 40%, transparent)' }}>
              Appeal No.
            </dt>
            <dd className="min-w-0 flex-1 break-words">{c.case_number}</dd>
          </div>
        )}
      </dl>

      <p className="mt-3 text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 40%, transparent)' }}>
        Created {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
    </Link>
  )
}

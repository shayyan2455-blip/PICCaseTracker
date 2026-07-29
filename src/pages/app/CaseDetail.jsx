import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCasesContext } from '../../lib/CasesContext'
import CaseStatusBadge from '../../components/cases/CaseStatusBadge'

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getCase } = useCasesContext()
  const c = getCase(id)

  if (!c) {
    return (
      <div className="mx-auto max-w-2xl pt-20 text-center">
        <h2 className="text-xl font-bold">Case not found</h2>
        <p className="mt-2" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
          This case does not exist or has been removed.
        </p>
        <Link to="/app/cases" className="btn-primary mt-6 inline-flex text-sm px-6 py-2.5">
          Back to cases
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl pt-4">
      <button
        onClick={() => navigate('/app/cases')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
        style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to cases
      </button>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{c.title}</h1>
          {c.case_number && (
            <p className="mt-1 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
              Appeal No. {c.case_number}
            </p>
          )}
        </div>
        <CaseStatusBadge status={c.status} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            Applicant
          </p>
          <p className="mt-1 font-medium">{c.applicant_name}</p>
          {c.applicant_address && (
            <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
              {c.applicant_address}
            </p>
          )}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            Public Body
          </p>
          <p className="mt-1 font-medium">{c.public_body}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            Created
          </p>
          <p className="mt-1 font-medium">
            {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          {c.closed_at && (
            <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
              Closed {new Date(c.closed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Documents</h2>
          <button className="btn-primary text-sm px-4 py-2">
            + Upload
          </button>
        </div>
        <div className="card mt-4 flex flex-col items-center py-16 text-center">
          <svg className="mb-4 h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" style={{ color: 'color-mix(in srgb, var(--text-color) 20%, transparent)' }}>
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="12" x2="12" y2="18" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <p className="font-medium" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            No documents uploaded yet
          </p>
          <p className="mt-1 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 40%, transparent)' }}>
            Upload the RTI request, appeal, notices, and order here
          </p>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCasesContext } from '../../lib/CasesContext'
import { useDocumentsContext } from '../../lib/DocumentsContext'
import CaseStatusBadge from '../../components/cases/CaseStatusBadge'
import DocumentTimeline from '../../components/cases/DocumentTimeline'
import UploadModal from '../../components/upload/UploadModal'

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getCase } = useCasesContext()
  const { addDocument } = useDocumentsContext()
  const [uploadOpen, setUploadOpen] = useState(false)
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Documents</h2>
          <button onClick={() => setUploadOpen(true)} className="btn-primary text-sm px-4 py-2">
            + Upload
          </button>
        </div>
        <DocumentTimeline caseId={id} />
      </div>

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        caseId={id}
        onUpload={addDocument}
      />
    </div>
  )
}

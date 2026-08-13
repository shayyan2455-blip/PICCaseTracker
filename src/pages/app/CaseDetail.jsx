import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCasesContext } from '../../lib/CasesContext'
import { useDocumentsContext } from '../../lib/DocumentsContext'
import { useHearingsContext } from '../../lib/HearingsContext'
import CaseStatusBadge from '../../components/cases/CaseStatusBadge'
import DocumentTimeline from '../../components/cases/DocumentTimeline'
import UploadModal from '../../components/upload/UploadModal'

const statusOptions = ['draft', 'rti_filed', 'appeal_filed', 'under_notice', 'disposed', 'closed']

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cases, loading: casesLoading, getCase, updateCase, deleteCase } = useCasesContext()
  const { addDocument, deleteDocument, getDocumentsForCase } = useDocumentsContext()
  const { addHearing, getHearingsForCase, resolveHearing, updateHearing } = useHearingsContext()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [deleting, setDeleting] = useState(false)
  const [colorScheme, setColorScheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
    }
    return 'dark'
  })
  const c = getCase(id)

  useEffect(() => {
    const handler = () => {
      setColorScheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark')
    }
    window.addEventListener('storage', handler)
    const observer = new MutationObserver(handler)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => { window.removeEventListener('storage', handler); observer.disconnect() }
  }, [])

  const caseDocs = getDocumentsForCase ? getDocumentsForCase(id) : []

  if (casesLoading && !c) {
    return (
      <div className="mx-auto max-w-4xl pt-4">
        <div className="mb-4 h-4 w-24 animate-pulse rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }} />
        <div className="mb-2 h-8 w-3/4 animate-pulse rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }} />
        <div className="mt-6 grid animate-pulse gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }} />
              <div className="h-5 w-40 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }} />
            </div>
          ))}
        </div>
        <div className="mt-10">
          <div className="mb-4 h-6 w-32 animate-pulse rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }} />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 8%, transparent)' }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  async function handleUpload(doc) {
    // appeal_no and is_disposed are case-level facts, not document columns —
    // strip them before the insert and apply them to the case separately.
    const { _appeal_no, _is_disposed, ...docFields } = doc
    const newDoc = await addDocument(docFields)

    if (docFields.document_type === 'rti_request' && docFields.rti_filing_date) {
      const appealDue = new Date(docFields.rti_filing_date)
      appealDue.setDate(appealDue.getDate() + 10)
      await addHearing({
        case_id: id,
        document_id: newDoc.id,
        due_date: appealDue.toISOString().split('T')[0],
        outcome: 'pending',
        next_date: null,
        notes: 'File appeal within 10 days of RTI filing',
      })
    }

    if (docFields.extracted_date && newDoc) {
      // A notice's hearing date often matches a next-hearing date already set
      // on an existing pending hearing — don't create a duplicate for the same day.
      const existing = getHearingsForCase(id).find(
        (h) => h.outcome === 'pending' && h.due_date === docFields.extracted_date
      )
      if (!existing) {
        await addHearing({
          case_id: id,
          document_id: newDoc.id,
          due_date: docFields.extracted_date,
          outcome: 'pending',
          next_date: null,
          notes: 'Hearing',
        })
      }
    }

    if (_appeal_no && !c.case_number) {
      await updateCase(id, { case_number: _appeal_no })
    }

    if (docFields.document_type === 'order' && _is_disposed) {
      await updateCase(id, { status: 'closed', closed_at: new Date().toISOString() })
    }
  }

  async function handleDeleteDoc(docId) {
    await deleteDocument(docId)
  }

  function startEdit() {
    setEditForm({
      title: c.title,
      case_number: c.case_number || '',
      applicant_name: c.applicant_name,
      applicant_address: c.applicant_address || '',
      public_body: c.public_body,
      status: c.status,
    })
    setEditing(true)
  }

  async function saveEdit() {
    await updateCase(id, editForm)
    setEditing(false)
  }

  async function handleDelete() {
    if (!window.confirm('Delete this case and all associated documents and hearings?')) return
    setDeleting(true)
    try {
      await deleteCase(id)
      navigate('/app/cases')
    } catch {
      setDeleting(false)
    }
  }

  async function handleResolve(hearingId, outcome) {
    await resolveHearing(hearingId, outcome)
  }

  async function handleStatusChange(status) {
    if (status === c.status) return
    const updates = { status }
    if (status === 'closed') {
      updates.closed_at = c.closed_at || new Date().toISOString()
    } else {
      updates.closed_at = null
    }
    try {
      await updateCase(id, updates)
    } catch (e) {
      console.error('Status update failed:', e)
      window.alert('Failed to update status. Please try again.')
    }
  }

  async function handleSetNext(hearingId, nextDate) {
    await updateHearing(hearingId, { due_date: nextDate })
  }

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

  const hearings = getHearingsForCase(id)
  const pendingHearings = hearings.filter((h) => h.outcome === 'pending')

  function inputStyle() {
    return {
      backgroundColor: 'var(--second-bg-color)',
      borderColor: 'color-mix(in srgb, var(--text-color) 15%, transparent)',
      color: 'var(--text-color)',
    }
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
        <div className="flex-1">
          {editing ? (
            <input
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-xl font-bold outline-none"
              style={inputStyle()}
            />
          ) : (
            <h1 className="text-2xl font-bold sm:text-3xl">{c.title}</h1>
          )}
          {!editing && c.case_number && (
            <p className="mt-1 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
              Appeal No. {c.case_number}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CaseStatusBadge status={c.status} />
          {!editing && (
            <select
              value={c.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-lg border px-2 py-1 text-xs font-medium outline-none"
              style={inputStyle()}
              title="Update case status"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</option>
              ))}
            </select>
          )}
          {!editing && (
            <button onClick={startEdit} className="btn-ghost p-2" title="Edit case">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
          {!editing && (
            <button onClick={handleDelete} disabled={deleting} className="btn-ghost p-2" title="Delete case" style={{ color: '#ef4444' }}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            Applicant
          </p>
          {editing ? (
            <input
              value={editForm.applicant_name}
              onChange={(e) => setEditForm({ ...editForm, applicant_name: e.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-1.5 text-sm outline-none"
              style={inputStyle()}
            />
          ) : (
            <p className="mt-1 font-medium">{c.applicant_name}</p>
          )}
          {!editing && c.applicant_address && (
            <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
              {c.applicant_address}
            </p>
          )}
          {editing && (
            <input
              value={editForm.applicant_address}
              onChange={(e) => setEditForm({ ...editForm, applicant_address: e.target.value })}
              placeholder="Address"
              className="mt-2 w-full rounded-lg border px-3 py-1.5 text-sm outline-none"
              style={inputStyle()}
            />
          )}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            Public Body
          </p>
          {editing ? (
            <input
              value={editForm.public_body}
              onChange={(e) => setEditForm({ ...editForm, public_body: e.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-1.5 text-sm outline-none"
              style={inputStyle()}
            />
          ) : (
            <p className="mt-1 font-medium">{c.public_body}</p>
          )}
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

      {editing && (
        <div className="mt-4 flex gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium">Status</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="rounded-lg border px-3 py-1.5 text-sm outline-none"
              style={inputStyle()}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Case No.</label>
            <input
              value={editForm.case_number}
              onChange={(e) => setEditForm({ ...editForm, case_number: e.target.value })}
              className="rounded-lg border px-3 py-1.5 text-sm outline-none"
              style={inputStyle()}
            />
          </div>
          <div className="flex items-end gap-2">
            <button onClick={saveEdit} className="btn-primary text-sm px-4 py-1.5">Save</button>
            <button onClick={() => setEditing(false)} className="btn-ghost text-sm px-4 py-1.5">Cancel</button>
          </div>
        </div>
      )}

      {pendingHearings.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Pending Deadlines</h2>
          <div className="flex flex-col gap-2">
            {pendingHearings.map((h) => (
              <PendingHearingRow
                key={h.id}
                hearing={h}
                colorScheme={colorScheme}
                onResolve={handleResolve}
                onSetNext={handleSetNext}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Documents</h2>
          <button onClick={() => setUploadOpen(true)} className="btn-ghost text-sm px-4 py-2">
            + Upload
          </button>
        </div>
        <DocumentTimeline caseId={id} onDeleteDoc={handleDeleteDoc} />
      </div>

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        caseId={id}
        onUpload={handleUpload}
        existingDocs={caseDocs}
      />
    </div>
  )
}

function PendingHearingRow({ hearing: h, colorScheme, onResolve, onSetNext }) {
  const [nextDate, setNextDate] = useState('')

  function inputStyle() {
    return {
      backgroundColor: 'var(--second-bg-color)',
      borderColor: 'color-mix(in srgb, var(--text-color) 15%, transparent)',
      color: 'var(--text-color)',
    }
  }

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3"
      style={{ borderColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium">
          {h.notes || 'Hearing'} — Due: {new Date(h.due_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        {h.next_date && (
          <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            Next hearing: {new Date(h.next_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
        <div className="mt-2 flex items-center gap-1.5">
          <input
            type="date"
            value={nextDate}
            onChange={(e) => setNextDate(e.target.value)}
            className="rounded border px-2 py-1 text-xs outline-none"
            style={{ ...inputStyle(), colorScheme }}
            title="Date of the next hearing"
          />
          <button
            onClick={() => {
              if (!nextDate) return
              onSetNext(h.id, nextDate)
              setNextDate('')
            }}
            className="rounded px-2.5 py-1 text-xs font-medium"
            style={{ backgroundColor: 'color-mix(in srgb, var(--main-color) 12%, transparent)', color: 'var(--main-color)' }}
          >
            Set next hearing
          </button>
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
        <button
          onClick={() => onResolve(h.id, 'resolved')}
          className="rounded px-2.5 py-1 text-xs font-medium text-green-500"
          style={{ backgroundColor: 'color-mix(in srgb, #22c55e 12%, transparent)' }}
        >
          Resolved
        </button>
        <button
          onClick={() => onResolve(h.id, 'adjourned')}
          className="rounded px-2.5 py-1 text-xs font-medium"
          style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 8%, transparent)', color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}
        >
          Adjourned
        </button>
      </div>
    </div>
  )
}

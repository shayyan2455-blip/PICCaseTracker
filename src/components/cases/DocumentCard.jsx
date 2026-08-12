import { useState } from 'react'
import DocumentViewerModal from './DocumentViewerModal'

const typeLabels = {
  rti_request: 'RTI Request',
  appeal_to_pic: 'Appeal to PIC',
  first_notice: 'First Notice',
  second_notice: 'Second Notice',
  final_notice: 'Final Notice',
  opposing_comments: 'Opposing Comments',
  rejoinder: 'Rejoinder',
  our_reply: 'Our Reply',
  order: 'Order',
  other: 'Other',
}

const typeIcons = {
  rti_request: (
    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
  ),
  order: (
    <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
  ),
  default: (
    <path d="M7 21h10a2 2 0 0 0 2-2V9.414a1 1 0 0 0-.293-.707l-5.414-5.414A1 1 0 0 0 12.586 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
  ),
}

export default function DocumentCard({ doc, onDelete }) {
  const label = typeLabels[doc.document_type] || doc.document_type
  const icon = typeIcons[doc.document_type] || typeIcons.default
  const [viewerOpen, setViewerOpen] = useState(false)

  return (
    <div className="flex items-start gap-4 rounded-xl border p-4" style={{ borderColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }}>
      <div
        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: 'color-mix(in srgb, var(--main-color) 12%, transparent)', color: 'var(--main-color)' }}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          {icon}
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{label}</span>
          {doc.extraction_confidence === 'low' && (
            <span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-medium text-yellow-500">
              Review
            </span>
          )}
        </div>
        <p className="truncate text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
          {doc.file_name}
        </p>
        {doc.extracted_date && (
          <p className="mt-1 text-xs font-medium" style={{ color: 'var(--main-color)' }}>
            Due: {new Date(doc.extracted_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}
        <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 40%, transparent)' }}>
          {new Date(doc.uploaded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
        <div className="mt-2 flex gap-2">
          {doc.file_path && (
            <button
              onClick={() => setViewerOpen(true)}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors hover:opacity-80"
              style={{ backgroundColor: 'color-mix(in srgb, var(--main-color) 12%, transparent)', color: 'var(--main-color)' }}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Open
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => { if (window.confirm('Delete this document?')) onDelete(doc.id) }}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors hover:opacity-80"
              style={{ backgroundColor: 'color-mix(in srgb, #ef4444 12%, transparent)', color: '#ef4444' }}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
              Delete
            </button>
          )}
        </div>
      </div>
      <DocumentViewerModal isOpen={viewerOpen} onClose={() => setViewerOpen(false)} doc={doc} />
    </div>
  )
}

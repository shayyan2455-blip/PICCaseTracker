import { useDocumentsContext } from '../../lib/DocumentsContext'
import DocumentCard from './DocumentCard'

export default function DocumentTimeline({ caseId, onDeleteDoc }) {
  const { getDocumentsForCase } = useDocumentsContext()
  const docs = getDocumentsForCase(caseId)

  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
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
    )
  }

  return (
    <div className="relative flex flex-col gap-4 pl-6">
      <div
        className="absolute left-[17px] top-3 bottom-3 w-0.5"
        style={{ backgroundColor: 'color-mix(in srgb, var(--main-color) 20%, transparent)' }}
      />
      {docs.map((doc, idx) => (
        <div key={doc.id} className="relative">
          <div
            className="absolute -left-6 mt-5 h-3 w-3 rounded-full border-2"
            style={{
              backgroundColor: 'var(--bg-color)',
              borderColor: 'var(--main-color)',
            }}
          />
          <DocumentCard doc={doc} onDelete={onDeleteDoc} />
        </div>
      ))}
    </div>
  )
}

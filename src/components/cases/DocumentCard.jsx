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

export default function DocumentCard({ doc }) {
  const label = typeLabels[doc.document_type] || doc.document_type
  const icon = typeIcons[doc.document_type] || typeIcons.default

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
      </div>
    </div>
  )
}

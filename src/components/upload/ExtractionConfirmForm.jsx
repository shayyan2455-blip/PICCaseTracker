const typeOptions = [
  { value: 'rti_request', label: 'RTI Request' },
  { value: 'appeal_to_pic', label: 'Appeal to PIC' },
  { value: 'first_notice', label: 'First Notice' },
  { value: 'second_notice', label: 'Second Notice' },
  { value: 'final_notice', label: 'Final Notice' },
  { value: 'opposing_comments', label: 'Opposing Comments' },
  { value: 'rejoinder', label: 'Rejoinder' },
  { value: 'our_reply', label: 'Our Reply' },
  { value: 'order', label: 'Order' },
  { value: 'other', label: 'Other' },
]

export default function ExtractionConfirmForm({ extraction, onConfirm, onEdit, onCancel }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)', backgroundColor: 'color-mix(in srgb, var(--main-color) 5%, transparent)' }}>
      <div className="flex items-center gap-2 mb-4">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--main-color)' }}>
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <span className="font-semibold text-sm">Extracted Information</span>
        {extraction.confidence === 'low' && (
          <span className="ml-auto rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-500">
            Needs review
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 text-sm">
        <div className="flex justify-between">
          <span style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>Document Type</span>
          <span className="font-medium">{typeOptions.find(t => t.value === extraction.document_type)?.label || extraction.document_type}</span>
        </div>
        {extraction.appeal_no && (
          <div className="flex justify-between">
            <span style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>Appeal No.</span>
            <span className="font-medium">{extraction.appeal_no}</span>
          </div>
        )}
        {extraction.applicant && (
          <div className="flex justify-between">
            <span style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>Applicant</span>
            <span className="font-medium text-right max-w-[60%] truncate">{extraction.applicant}</span>
          </div>
        )}
        {extraction.due_date && (
          <div className="flex justify-between">
            <span style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>Due Date</span>
            <span className="font-medium" style={{ color: 'var(--main-color)' }}>
              {new Date(extraction.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        )}
        {extraction.is_disposed && (
          <div className="flex justify-between">
            <span style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>Status</span>
            <span className="font-medium text-green-500">Disposed</span>
          </div>
        )}
      </div>

      {extraction.missing_fields?.length > 0 && (
        <div className="mt-3 rounded-lg bg-yellow-500/5 px-3 py-2 text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
          Could not extract: {extraction.missing_fields.join(', ')}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button onClick={onEdit} className="btn-ghost flex-1 text-xs py-2">
          Edit
        </button>
        <button onClick={onConfirm} className="btn-primary flex-1 text-xs py-2">
          Confirm
        </button>
      </div>
    </div>
  )
}

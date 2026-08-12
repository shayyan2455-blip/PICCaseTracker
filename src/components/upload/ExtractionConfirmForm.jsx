import { EXTRACTABLE_FIELDS } from '../../extraction/parseNoticeOrder'

const typeOptions = [
  { value: 'rti_request', label: 'RTI Request' },
  { value: 'appeal_to_pic', label: 'Appeal to PIC' },
  { value: 'first_notice', label: 'First Notice' },
  { value: 'second_notice', label: 'Second Notice' },
  { value: 'final_notice', label: 'Final Notice' },
  { value: 'opposing_comments', label: 'Information Shared' },
  { value: 'rejoinder', label: 'Rejoinder' },
  { value: 'our_reply', label: 'Our Reply' },
  { value: 'order', label: 'Order' },
  { value: 'other', label: 'Other' },
]

function inputStyle() {
  return {
    backgroundColor: 'var(--second-bg-color)',
    borderColor: 'color-mix(in srgb, var(--text-color) 15%, transparent)',
    color: 'var(--text-color)',
  }
}

// filed_date is already surfaced as its own dedicated "RTI Filing Date" field
// higher up in UploadModal — don't duplicate it here.
const SKIP_KEYS = new Set(['filed_date'])

export default function ExtractionConfirmForm({ extraction, onFieldChange, onConfirm, onEdit, onCancel }) {
  const showEdit = typeof onEdit === 'function'
  const fields = (EXTRACTABLE_FIELDS[extraction.document_type] || []).filter((f) => !SKIP_KEYS.has(f.key))

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
        {extraction.applicant && (
          <div className="flex justify-between">
            <span style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>Applicant</span>
            <span className="font-medium text-right max-w-[60%] truncate">{extraction.applicant}</span>
          </div>
        )}
      </div>

      {fields.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          {fields.map((field) => {
            const wasDetected = field.type === 'select' ? undefined : Boolean(extraction[field.key])
            return (
              <div key={field.key}>
                <label className="mb-1 flex items-center gap-2 text-xs font-medium">
                  {field.label}
                  {wasDetected === true && (
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ color: 'var(--main-color)', backgroundColor: 'color-mix(in srgb, var(--main-color) 12%, transparent)' }}>
                      Auto-detected — verify
                    </span>
                  )}
                  {wasDetected === false && (
                    <span className="text-[10px]" style={{ color: 'color-mix(in srgb, var(--text-color) 45%, transparent)' }}>
                      Not detected — enter manually
                    </span>
                  )}
                </label>

                {field.type === 'select' ? (
                  <select
                    value={extraction[field.key] ? 'true' : 'false'}
                    onChange={(e) => onFieldChange(field.key, e.target.value === 'true')}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    style={inputStyle()}
                  >
                    <option value="false">Pending</option>
                    <option value="true">Disposed</option>
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={extraction[field.key] || ''}
                    onChange={(e) => onFieldChange(field.key, e.target.value)}
                    placeholder={field.type === 'text' ? `Enter ${field.label.toLowerCase()}` : undefined}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{ ...inputStyle(), ...(field.type === 'date' ? { colorScheme: 'dark' } : {}) }}
                  />
                )}

                {field.key === 'appeal_no' && (
                  <p className="mt-1 text-[11px]" style={{ color: 'color-mix(in srgb, var(--text-color) 45%, transparent)' }}>
                    Saved as this case's appeal number if not already set
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {showEdit && (
          <button onClick={onEdit} className="btn-ghost flex-1 text-xs py-2">
            Edit
          </button>
        )}
        <button onClick={onConfirm} className="btn-primary flex-1 text-xs py-2">
          Confirm
        </button>
      </div>
    </div>
  )
}

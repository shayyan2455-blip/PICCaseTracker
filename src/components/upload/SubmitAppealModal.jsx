import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { getOrgId } from '../../lib/org'

export default function SubmitAppealModal({ isOpen, onClose, caseId, onUpload }) {
  const [rtiFile, setRtiFile] = useState(null)
  const [receiptFile, setReceiptFile] = useState(null)
  const [appealFile, setAppealFile] = useState(null)
  const [rtiFilingDate, setRtiFilingDate] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const rtiRef = useRef(null)
  const receiptRef = useRef(null)
  const appealRef = useRef(null)

  if (!isOpen) return null

  async function handleSubmit() {
    if (!rtiFile || !receiptFile || !appealFile) {
      setUploadError('Please select all three files: RTI, Receipt, and Appeal')
      return
    }

    setUploadError('')
    setUploading(true)

    try {
      const orgId = await getOrgId()
      if (!orgId) throw new Error('No organization found')
      const { data: { user } } = await supabase.auth.getUser()

      const docs = [
        { file: rtiFile, type: 'rti_request', date: rtiFilingDate || null },
        { file: receiptFile, type: 'receipt', date: null },
        { file: appealFile, type: 'appeal_to_pic', date: null },
      ]

      for (const doc of docs) {
        const ext = doc.file.name.split('.').pop()
        const storagePath = `${orgId}/${crypto.randomUUID()}-${doc.file.name}`

        const { error: uploadErr } = await supabase.storage
          .from('documents')
          .upload(storagePath, doc.file, { cacheControl: '3600', upsert: false })

        if (uploadErr) throw new Error(uploadErr.message)

        await onUpload({
          case_id: caseId,
          document_type: doc.type,
          file_path: storagePath,
          file_name: doc.file.name,
          uploaded_by: user?.id,
          extracted_date: null,
          extraction_source: 'upload',
          extraction_confidence: 'high',
          raw_text: null,
          rti_filing_date: doc.date,
        })
      }

      resetAndClose()
    } catch (e) {
      setUploadError(e.message)
    } finally {
      setUploading(false)
    }
  }

  function resetAndClose() {
    setRtiFile(null)
    setReceiptFile(null)
    setAppealFile(null)
    setRtiFilingDate('')
    setUploadError('')
    if (rtiRef.current) rtiRef.current.value = ''
    if (receiptRef.current) receiptRef.current.value = ''
    if (appealRef.current) appealRef.current.value = ''
    onClose()
  }

  function fileBox(file, setter, ref, label, accent) {
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium">{label}</p>
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors hover:opacity-80"
          style={{
            borderColor: file ? accent : 'color-mix(in srgb, var(--text-color) 20%, transparent)',
            backgroundColor: 'var(--second-bg-color)',
          }}
          onClick={() => ref.current?.click()}
        >
          {file ? (
            <div className="flex flex-col items-center gap-1">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: accent }}>
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="text-xs font-medium">{file.name}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: 'color-mix(in srgb, var(--text-color) 30%, transparent)' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>Select file</span>
            </div>
          )}
          <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setter(e.target.files?.[0] || null)} className="hidden" />
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={resetAndClose}>
      <div
        className="flex max-h-[95vh] w-full max-w-xl flex-col overflow-y-auto rounded-2xl p-6 sm:p-8 sm:max-h-[90vh]"
        style={{
          backgroundColor: 'var(--bg-color)',
          border: '1px solid color-mix(in srgb, var(--text-color) 15%, transparent)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Submit Appeal</h2>
          <button onClick={resetAndClose} className="rounded-lg p-1" style={{ color: 'var(--text-color)' }} aria-label="Close">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-3">
            {fileBox(rtiFile, setRtiFile, rtiRef, 'RTI Request', 'var(--main-color)')}
            {fileBox(receiptFile, setReceiptFile, receiptRef, 'Receipt', 'var(--main-color)')}
            {fileBox(appealFile, setAppealFile, appealRef, 'Appeal to PIC', 'var(--main-color)')}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">RTI Filing Date</label>
            <input
              type="date"
              value={rtiFilingDate}
              onChange={(e) => setRtiFilingDate(e.target.value)}
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: 'var(--second-bg-color)',
                borderColor: 'color-mix(in srgb, var(--text-color) 15%, transparent)',
                color: 'var(--text-color)',
                colorScheme: 'dark',
              }}
            />
            <p className="mt-1 text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
              A reminder to file the appeal will be created 10 days after this date
            </p>
          </div>

          {uploadError && (
            <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">{uploadError}</div>
          )}

          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="btn-primary w-full text-sm py-2.5"
          >
            {uploading ? 'Uploading...' : 'Submit Appeal'}
          </button>
        </div>
      </div>
    </div>
  )
}

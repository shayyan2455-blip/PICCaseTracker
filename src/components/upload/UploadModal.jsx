import { useState, useRef } from 'react'
import Tesseract from 'tesseract.js'
import { supabase } from '../../lib/supabaseClient'
import { getOrgId } from '../../lib/org'
import { parseNoticeOrder } from '../../extraction/parseNoticeOrder'
import ExtractionConfirmForm from './ExtractionConfirmForm'

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

export default function UploadModal({ isOpen, onClose, caseId, onUpload }) {
  const [docType, setDocType] = useState('rti_request')
  const [file, setFile] = useState(null)
  const [extraction, setExtraction] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [ocrStatus, setOcrStatus] = useState('')
  const fileRef = useRef(null)

  if (!isOpen) return null

  function handleFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setExtraction(null)
    setUploadError('')
    setOcrStatus('')
  }

  async function handleAnalyze() {
    if (!file) return
    setUploadError('')
    setOcrStatus('Running OCR...')
    setExtraction(null)

    try {
      const ext = file.name.split('.').pop()?.toLowerCase()

      let rawText = ''

      if (ext === 'pdf' || ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
        setOcrStatus('Extracting text from document...')
        const result = await Tesseract.recognize(file, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const pct = Math.round(m.progress * 100)
              setOcrStatus(`Reading text... ${pct}%`)
            }
          },
        })
        rawText = result.data.text
      } else if (ext === 'docx') {
        setOcrStatus('DOCX text extraction not supported — using filename only')
        await new Promise((r) => setTimeout(r, 800))
      }

      const result = parseNoticeOrder(rawText, file.name)

      if (!result.document_type || result.document_type === 'rti_request' || result.document_type === 'appeal_to_pic') {
        result.document_type = docType
      }
      result.document_type = docType

      setExtraction(result)
      setOcrStatus('')
    } catch (e) {
      console.error('OCR failed:', e)
      const errMsg = e?.message || (typeof e === 'string' ? e : 'unknown error')
      setUploadError('Text extraction failed: ' + errMsg + ' — you can still upload manually')
      const fallback = parseNoticeOrder('', file.name)
      fallback.document_type = docType
      setExtraction(fallback)
      setOcrStatus('')
    }
  }

  async function handleConfirm() {
    if (!file) return
    setUploadError('')
    setUploading(true)

    try {
      const orgId = await getOrgId()
      if (!orgId) throw new Error('No organization found')

      const ext = file.name.split('.').pop()
      const storagePath = `${orgId}/${crypto.randomUUID()}-${file.name}`

      const { error: uploadErr } = await supabase.storage
        .from('documents')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadErr) throw new Error(uploadErr.message)

      const { data: { user } } = await supabase.auth.getUser()

      onUpload({
        case_id: caseId,
        document_type: docType,
        file_path: storagePath,
        file_name: file.name,
        uploaded_by: user?.id,
        extracted_date: extraction?.due_date || null,
        extraction_source: 'digital',
        extraction_confidence: extraction?.confidence || 'high',
        raw_text: null,
      })
      resetAndClose()
    } catch (e) {
      setUploadError(e.message)
    } finally {
      setUploading(false)
    }
  }

  function resetAndClose() {
    setFile(null)
    setExtraction(null)
    setUploadError('')
    setOcrStatus('')
    setDocType('rti_request')
    if (fileRef.current) fileRef.current.value = ''
    onClose()
  }

  function inputStyle() {
    return {
      backgroundColor: 'var(--second-bg-color)',
      borderColor: 'color-mix(in srgb, var(--text-color) 15%, transparent)',
      color: 'var(--text-color)',
    }
  }

  return (
    <div className="modal-overlay" onClick={resetAndClose}>
      <div
        className="flex max-h-[95vh] w-full max-w-lg flex-col overflow-y-auto rounded-2xl p-6 sm:p-8 sm:max-h-[90vh]"
        style={{
          backgroundColor: 'var(--bg-color)',
          border: '1px solid color-mix(in srgb, var(--text-color) 15%, transparent)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Upload Document</h2>
          <button onClick={resetAndClose} className="rounded-lg p-1" style={{ color: 'var(--text-color)' }} aria-label="Close">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none"
              style={inputStyle()}
            >
              {typeOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">File (PDF, JPG, PNG)</label>
            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors hover:opacity-80"
              style={{
                borderColor: file ? 'var(--main-color)' : 'color-mix(in srgb, var(--text-color) 20%, transparent)',
                backgroundColor: 'var(--second-bg-color)',
              }}
              onClick={() => fileRef.current?.click()}
            >
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: 'var(--main-color)' }}>
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: 'color-mix(in srgb, var(--text-color) 30%, transparent)' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span className="text-sm font-medium" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
                    Click to select a file
                  </span>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {uploadError && (
            <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">{uploadError}</div>
          )}

          {ocrStatus && (
            <div className="flex items-center justify-center gap-2 py-3 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              {ocrStatus}
            </div>
          )}

          {file && !extraction && !ocrStatus && (
            <button onClick={handleAnalyze} className="btn-primary w-full text-sm py-2.5">
              Analyze Document
            </button>
          )}

          {uploading && (
            <div className="flex items-center justify-center gap-2 py-3 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Uploading...
            </div>
          )}

          {extraction && !uploading && (
            <ExtractionConfirmForm
              extraction={extraction}
              onConfirm={handleConfirm}
              onCancel={resetAndClose}
            />
          )}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function DocumentViewerModal({ isOpen, onClose, doc }) {
  const [signedUrl, setSignedUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pdfConverting, setPdfConverting] = useState(false)

  useEffect(() => {
    if (!isOpen || !doc?.file_path) return
    let cancelled = false
    setLoading(true)
    setError('')

    ;(async () => {
      try {
        const { data, error: sErr } = await supabase.storage
          .from('documents')
          .createSignedUrl(doc.file_path, 60)

        if (sErr) throw new Error(sErr.message)
        if (!data?.signedUrl) throw new Error('No signed URL returned')

        if (!cancelled) setSignedUrl(data.signedUrl)
      } catch (e) {
        console.error('View failed:', e)
        if (!cancelled) setError(e.message || 'Failed to open document')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
      setSignedUrl('')
    }
  }, [isOpen, doc])

  if (!isOpen) return null

  function baseName() {
    return (doc?.file_name || 'document').replace(/\.[^.]+$/, '')
  }

  function fileExt() {
    return (doc?.file_name || '').split('.').pop()?.toLowerCase() || ''
  }

  async function handleDownloadOriginal() {
    if (!signedUrl) return
    try {
      const res = await fetch(signedUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc?.file_name || 'document'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      window.open(signedUrl, '_blank')
    }
  }

  async function handleDownloadPdf() {
    if (!signedUrl || pdfConverting) return
    const ext = fileExt()

    if (ext === 'pdf') {
      handleDownloadOriginal()
      return
    }

    setPdfConverting(true)
    try {
      const res = await fetch(signedUrl)
      if (!res.ok) throw new Error('Failed to read file')
      const blob = await res.blob()

      const img = new Image()
      img.src = URL.createObjectURL(blob)
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = () => reject(new Error('Could not read image'))
      })

      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      const jpegData = canvas.toDataURL('image/jpeg', 0.95)

      const { jsPDF } = await import('jspdf')
      const orientation = canvas.width > canvas.height ? 'l' : 'p'
      const pdf = new jsPDF({ orientation, unit: 'pt' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const scale = Math.min(pageW / canvas.width, pageH / canvas.height)
      const w = canvas.width * scale
      const h = canvas.height * scale
      const x = (pageW - w) / 2
      const y = (pageH - h) / 2
      pdf.addImage(jpegData, 'JPEG', x, y, w, h)
      pdf.save(baseName() + '.pdf')
    } catch (e) {
      console.error('PDF conversion failed:', e)
      setError('Failed to convert to PDF')
    } finally {
      setPdfConverting(false)
    }
  }

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl p-8"
          style={{ backgroundColor: 'var(--bg-color)', border: '1px solid color-mix(in srgb, var(--text-color) 15%, transparent)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-b-transparent" style={{ borderColor: 'var(--main-color)', borderBottomColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>Loading document...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl p-8 text-center"
          style={{ backgroundColor: 'var(--bg-color)', border: '1px solid color-mix(in srgb, var(--text-color) 15%, transparent)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm font-medium" style={{ color: '#ef4444' }}>{error}</p>
          <button onClick={onClose} className="btn-primary text-sm px-6 py-2">Close</button>
        </div>
      </div>
    )
  }

  const ext = fileExt()
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
  const isPdf = ext === 'pdf'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="flex h-[90vh] w-[95vw] max-w-5xl flex-col overflow-hidden rounded-2xl"
        style={{ backgroundColor: '#101010' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-4 py-3" style={{ backgroundColor: '#1a1a1a' }}>
          <p className="truncate text-sm font-medium" style={{ color: '#e5e5e5' }}>
            {doc?.file_name || 'Document'}
          </p>
          <div className="flex items-center gap-2">
            {!isPdf && (
              <button
                onClick={handleDownloadOriginal}
                disabled={pdfConverting}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#e5e5e5' }}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download as {ext.toUpperCase() || 'File'}
              </button>
            )}
            <button
              onClick={handleDownloadPdf}
              disabled={pdfConverting}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ backgroundColor: 'var(--main-color)', color: '#ffffff' }}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {pdfConverting ? 'Converting...' : 'Download as PDF'}
            </button>
            <button onClick={onClose} className="rounded-lg p-1 transition-colors hover:opacity-70" style={{ color: '#e5e5e5' }} aria-label="Close viewer">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        {isImage ? (
          <img
            src={signedUrl}
            alt={doc?.file_name || 'Document'}
            className="max-h-full w-full object-contain"
            style={{ backgroundColor: '#ffffff' }}
          />
        ) : (
          <iframe
            src={signedUrl}
            className="w-full flex-1"
            style={{ border: 'none', backgroundColor: '#ffffff' }}
            title="Document viewer"
          />
        )}
      </div>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function DocumentViewerModal({ isOpen, onClose, doc }) {
  const [objectUrl, setObjectUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const objectUrlRef = useRef(null)

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

        const res = await fetch(data.signedUrl)
        if (!res.ok) throw new Error('Failed to load file')

        const blob = await res.blob()
        if (cancelled) return

        objectUrlRef.current = URL.createObjectURL(blob)
        setObjectUrl(objectUrlRef.current)
      } catch (e) {
        console.error('View failed:', e)
        if (!cancelled) setError(e.message || 'Failed to open document')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
      setObjectUrl('')
    }
  }, [isOpen, doc])

  if (!isOpen) return null

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
          <button onClick={onClose} className="rounded-lg p-1 transition-colors hover:opacity-70" style={{ color: '#e5e5e5' }} aria-label="Close viewer">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <iframe
          src={objectUrl}
          className="w-full flex-1"
          style={{ border: 'none', backgroundColor: '#ffffff' }}
          title="Document viewer"
        />
      </div>
    </div>
  )
}

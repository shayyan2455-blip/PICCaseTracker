import { useState } from 'react'

const seedDocs = [
  {
    id: 'd1',
    case_id: '1',
    document_type: 'rti_request',
    file_name: 'RTI_Request_Rana.pdf',
    uploaded_by: 'user-1',
    uploaded_at: '2026-07-15T10:30:00Z',
    extracted_date: null,
    extraction_source: 'digital',
    extraction_confidence: null,
    raw_text: null,
  },
  {
    id: 'd2',
    case_id: '1',
    document_type: 'appeal_to_pic',
    file_name: 'Appeal_to_PIC.pdf',
    uploaded_by: 'user-1',
    uploaded_at: '2026-07-18T14:00:00Z',
    extracted_date: null,
    extraction_source: 'digital',
    extraction_confidence: null,
    raw_text: null,
  },
  {
    id: 'd3',
    case_id: '1',
    document_type: 'first_notice',
    file_name: 'First_Notice_5837.pdf',
    uploaded_by: 'user-1',
    uploaded_at: '2026-07-22T09:15:00Z',
    extracted_date: '2026-08-10',
    extraction_source: 'digital',
    extraction_confidence: 'high',
    raw_text: 'First Notice\nAppeal No. 5837-07/26\nDate: July 22, 2026\n...Commission by August 10, 2026 failing which...',
  },
]

export function useDocuments() {
  const [docs, setDocs] = useState(seedDocs)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function getDocumentsForCase(caseId) {
    return docs.filter((d) => d.case_id === caseId)
  }

  function addDocument(doc) {
    setDocs((prev) => [
      {
        ...doc,
        id: crypto.randomUUID(),
        uploaded_by: 'user-1',
        uploaded_at: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  function updateDocument(id, updates) {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)))
  }

  return { docs, loading, error, getDocumentsForCase, addDocument, updateDocument }
}

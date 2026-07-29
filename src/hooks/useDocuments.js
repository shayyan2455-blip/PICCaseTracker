import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getOrgId } from '../lib/org'

export function useDocuments() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadDocs = useCallback(async () => {
    setLoading(true)
    setError(null)
    const orgId = await getOrgId()
    if (!orgId) { setDocs([]); setLoading(false); return }

    const { data, error: err } = await supabase
      .from('documents')
      .select('*')
      .eq('organization_id', orgId)
      .order('uploaded_at', { ascending: true })

    if (err) { setError(err.message) }
    else { setDocs(data || []) }
    setLoading(false)
  }, [])

  useEffect(() => { loadDocs() }, [loadDocs])

  const getDocumentsForCase = useCallback((caseId) => {
    return docs.filter((d) => d.case_id === caseId)
  }, [docs])

  const addDocument = useCallback(async (doc) => {
    const orgId = await getOrgId()
    if (!orgId) throw new Error('No organization found')

    const { data, error: err } = await supabase
      .from('documents')
      .insert({ ...doc, organization_id: orgId })
      .select()
      .single()

    if (err) throw new Error(err.message)
    setDocs((prev) => [...prev, data])
    return data
  }, [])

  const updateDocument = useCallback(async (id, updates) => {
    const { error: err } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)

    if (err) throw new Error(err.message)
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)))
  }, [])

  return { docs, loading, error, getDocumentsForCase, addDocument, updateDocument, refresh: loadDocs }
}

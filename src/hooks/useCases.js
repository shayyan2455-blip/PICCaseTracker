import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getOrgId } from '../lib/org'

export function useCases() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadCases = useCallback(async () => {
    setLoading(true)
    setError(null)
    const orgId = await getOrgId()
    if (!orgId) { setCases([]); setLoading(false); return }

    const { data, error: err } = await supabase
      .from('cases')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })

    if (err) { setError(err.message) }
    else { setCases(data || []) }
    setLoading(false)
  }, [])

  useEffect(() => { loadCases() }, [loadCases])

  const addCase = useCallback(async (newCase) => {
    const orgId = await getOrgId()
    if (!orgId) throw new Error('No organization found')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error: err } = await supabase
      .from('cases')
      .insert({ ...newCase, organization_id: orgId, created_by: user.id })
      .select()
      .single()

    if (err) throw new Error(err.message)
    setCases((prev) => [data, ...prev])
    return data
  }, [])

  const getCase = useCallback((id) => {
    return cases.find((c) => c.id === id) || null
  }, [cases])

  return { cases, loading, error, addCase, getCase, refresh: loadCases }
}

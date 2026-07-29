import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getOrgId } from '../lib/org'

export function useHearings() {
  const [hearings, setHearings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadHearings = useCallback(async () => {
    setLoading(true)
    setError(null)
    const orgId = await getOrgId()
    if (!orgId) { setHearings([]); setLoading(false); return }

    const { data, error: err } = await supabase
      .from('hearings')
      .select('*')
      .eq('organization_id', orgId)
      .order('due_date', { ascending: true })

    if (err) { setError(err.message) }
    else { setHearings(data || []) }
    setLoading(false)
  }, [])

  useEffect(() => { loadHearings() }, [loadHearings])

  const getHearingsForCase = useCallback((caseId) => {
    return hearings.filter((h) => h.case_id === caseId)
  }, [hearings])

  const addHearing = useCallback(async (hearing) => {
    const orgId = await getOrgId()
    if (!orgId) throw new Error('No organization found')

    const { data, error: err } = await supabase
      .from('hearings')
      .insert({ ...hearing, organization_id: orgId })
      .select()
      .single()

    if (err) throw new Error(err.message)
    setHearings((prev) => [...prev, data])
    return data
  }, [])

  const updateHearing = useCallback(async (id, updates) => {
    const { error: err } = await supabase
      .from('hearings')
      .update(updates)
      .eq('id', id)

    if (err) throw new Error(err.message)
    setHearings((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)))
  }, [])

  const resolveHearing = useCallback(async (id, outcome = 'resolved', notes = '') => {
    const now = new Date().toISOString()
    const { error: err } = await supabase
      .from('hearings')
      .update({ outcome, notes, resolved_at: now })
      .eq('id', id)

    if (err) throw new Error(err.message)
    setHearings((prev) =>
      prev.map((h) => (h.id === id ? { ...h, outcome, notes, resolved_at: now } : h))
    )
  }, [])

  const getPendingCounts = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekEnd = new Date(today)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const pending = hearings.filter((h) => h.outcome === 'pending')

    const dueToday = pending.filter((h) => {
      const d = new Date(h.due_date)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime()
    })

    const dueThisWeek = pending.filter((h) => {
      const d = new Date(h.due_date)
      d.setHours(0, 0, 0, 0)
      return d > today && d <= weekEnd
    })

    const overdue = pending.filter((h) => {
      const d = new Date(h.due_date)
      d.setHours(0, 0, 0, 0)
      return d < today
    })

    return { dueToday, dueThisWeek, overdue, totalPending: pending.length }
  }, [hearings])

  return {
    hearings, loading, error,
    getHearingsForCase, addHearing, updateHearing, resolveHearing, getPendingCounts, refresh: loadHearings,
  }
}

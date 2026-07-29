import { useState, useCallback } from 'react'

const seedHearings = [
  {
    id: 'h1',
    case_id: '1',
    document_id: 'd3',
    due_date: '2026-08-10',
    outcome: 'pending',
    next_date: null,
    notes: null,
    created_at: '2026-07-22T09:15:00Z',
    resolved_at: null,
  },
]

export function useHearings() {
  const [hearings, setHearings] = useState(seedHearings)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getHearingsForCase = useCallback((caseId) => {
    return hearings.filter((h) => h.case_id === caseId)
  }, [hearings])

  const addHearing = useCallback((hearing) => {
    setHearings((prev) => [
      {
        ...hearing,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        resolved_at: null,
      },
      ...prev,
    ])
  }, [])

  const updateHearing = useCallback((id, updates) => {
    setHearings((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
    )
  }, [])

  const resolveHearing = useCallback((id, outcome = 'resolved', notes = '') => {
    setHearings((prev) =>
      prev.map((h) =>
        h.id === id
          ? { ...h, outcome, notes, resolved_at: new Date().toISOString() }
          : h
      )
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
    getHearingsForCase, addHearing, updateHearing, resolveHearing, getPendingCounts,
  }
}

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { setOrgId, getOrgId } from '../../lib/org'

export default function OrgSetup({ onCreated }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: name.trim() })
      .select()
      .single()

    if (orgError) {
      setError(orgError.message)
      setLoading(false)
      return
    }

    const { error: memberError } = await supabase
      .from('members')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: 'owner',
      })

    if (memberError) {
      setError(memberError.message)
      setLoading(false)
      return
    }

    setOrgId(org.id)
    setLoading(false)
    onCreated()
  }

  return (
    <div className="mx-auto max-w-md pt-20 text-center">
      <div className="card">
        <div className="mb-4 inline-flex rounded-xl p-3" style={{ backgroundColor: 'color-mix(in srgb, var(--main-color) 15%, transparent)', color: 'var(--main-color)' }}>
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h2 className="text-xl font-bold">Set up your firm</h2>
        <p className="mt-2 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
          Create an organization to start tracking cases
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
        )}

        <form onSubmit={handleCreate} className="mt-6 flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Shahid & Associates"
            className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none text-center"
            style={{
              backgroundColor: 'var(--second-bg-color)',
              borderColor: 'color-mix(in srgb, var(--text-color) 15%, transparent)',
              color: 'var(--text-color)',
            }}
            required
          />
          <button type="submit" disabled={loading} className="btn-primary w-full text-sm py-2.5">
            {loading ? 'Creating...' : 'Create Organization'}
          </button>
        </form>
      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCasesContext } from '../../lib/CasesContext'
import CaseStatusBadge from '../../components/cases/CaseStatusBadge'
import CaseCard from '../../components/cases/CaseCard'
import { TableSkeleton } from '../../components/ui/Skeleton'

const PAGE_SIZE = 20

export default function CaseList() {
  const { cases, loading } = useCasesContext()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.applicant_name.toLowerCase().includes(search.toLowerCase()) ||
        c.public_body.toLowerCase().includes(search.toLowerCase()) ||
        (c.case_number && c.case_number.toLowerCase().includes(search.toLowerCase()))

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [cases, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  function handleSearchChange(val) {
    setSearch(val)
    setPage(0)
  }

  function handleStatusFilter(val) {
    setStatusFilter(val)
    setPage(0)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl pt-4">
        <h1 className="text-2xl font-bold sm:text-3xl">Cases</h1>
        <div className="mt-6"><TableSkeleton rows={6} /></div>
      </div>
    )
  }

  const statuses = ['all', 'draft', 'rti_filed', 'appeal_filed', 'under_notice', 'disposed', 'closed']

  return (
    <div className="mx-auto max-w-6xl pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">Cases</h1>
        <Link to="/app/cases/new" className="btn-primary text-sm px-4 py-2.5 self-start sm:self-auto">
          + New Case
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ color: 'color-mix(in srgb, var(--text-color) 40%, transparent)' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by title, applicant, or case number..."
            className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors"
            style={{
              backgroundColor: 'var(--second-bg-color)',
              borderColor: 'color-mix(in srgb, var(--text-color) 15%, transparent)',
              color: 'var(--text-color)',
            }}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => handleStatusFilter(s)}
            className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              backgroundColor: statusFilter === s ? 'var(--main-color)' : 'color-mix(in srgb, var(--text-color) 8%, transparent)',
              color: statusFilter === s ? 'white' : 'color-mix(in srgb, var(--text-color) 60%, transparent)',
            }}
          >
            {s === 'all' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center py-16 text-center">
          <svg className="mb-4 h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" style={{ color: 'color-mix(in srgb, var(--text-color) 20%, transparent)' }}>
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p className="font-medium" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            {search || statusFilter !== 'all' ? 'No cases match your filters' : 'No cases yet'}
          </p>
          {!search && statusFilter === 'all' && (
            <Link to="/app/cases/new" className="btn-primary mt-4 text-sm px-4 py-2">
              Create your first case
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden sm:block">
            <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: 'var(--second-bg-color)' }}>
                    <th className="px-4 py-3 text-left font-medium">Case</th>
                    <th className="px-4 py-3 text-left font-medium">Applicant</th>
                    <th className="px-4 py-3 text-left font-medium">Public Body</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((c) => (
                    <tr
                      key={c.id}
                      className="cursor-pointer border-t transition-colors hover:opacity-80"
                      style={{ borderColor: 'color-mix(in srgb, var(--text-color) 5%, transparent)' }}
                      onClick={() => window.location.href = `/app/cases/${c.id}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{c.title}</div>
                        {c.case_number && <div className="text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 40%, transparent)' }}>{c.case_number}</div>}
                      </td>
                      <td className="px-4 py-3">{c.applicant_name}</td>
                      <td className="px-4 py-3">{c.public_body}</td>
                      <td className="px-4 py-3"><CaseStatusBadge status={c.status} /></td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
                        {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile card list */}
          <div className="mt-6 flex flex-col gap-4 sm:hidden">
            {paginated.map((c) => (
              <CaseCard key={c.id} c={c} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
              Showing {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-30"
                style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 8%, transparent)' }}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: i === safePage ? 'var(--main-color)' : 'color-mix(in srgb, var(--text-color) 8%, transparent)',
                    color: i === safePage ? 'white' : 'color-mix(in srgb, var(--text-color) 60%, transparent)',
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safePage >= totalPages - 1}
                className="rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-30"
                style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 8%, transparent)' }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

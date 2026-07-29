export function CardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="mb-2 h-3 w-24 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }} />
      <div className="mb-1 h-8 w-16 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }} />
      <div className="h-3 w-32 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }} />
    </div>
  )
}

export function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border p-4 animate-pulse" style={{ borderColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }}>
      <div className="h-10 w-10 shrink-0 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }} />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }} />
        <div className="h-3 w-1/2 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }} />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="animate-pulse space-y-3">
      <div className="flex gap-4 px-4 py-3">
        <div className="h-3 w-1/3 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }} />
        <div className="h-3 w-1/4 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }} />
        <div className="h-3 w-1/4 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 border-t px-4 py-4" style={{ borderColor: 'color-mix(in srgb, var(--text-color) 5%, transparent)' }}>
          <div className="h-4 w-1/3 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }} />
          <div className="h-4 w-1/4 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }} />
          <div className="h-4 w-1/4 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }} />
          <div className="h-4 w-16 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }} />
        </div>
      ))}
    </div>
  )
}

export function StatGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  )
}

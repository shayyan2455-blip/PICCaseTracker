export default function NewCase() {
  return (
    <div className="mx-auto max-w-2xl pt-4">
      <h1 className="text-2xl font-bold sm:text-3xl">New Case</h1>
      <p className="mt-2" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
        Create a new case — coming soon
      </p>
      <div className="card mt-8 flex flex-col items-center py-16 text-center">
        <svg className="mb-4 h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" style={{ color: 'color-mix(in srgb, var(--text-color) 20%, transparent)' }}>
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        <p className="font-medium" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
          Case creation form will go here
        </p>
      </div>
    </div>
  )
}

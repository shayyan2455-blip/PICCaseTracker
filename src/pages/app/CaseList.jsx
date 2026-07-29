export default function CaseList() {
  return (
    <div className="mx-auto max-w-6xl pt-4">
      <h1 className="text-2xl font-bold sm:text-3xl">Cases</h1>
      <p className="mt-2" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
        Your case list — coming soon
      </p>
      <div className="card mt-8 flex flex-col items-center py-16 text-center">
        <svg className="mb-4 h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" style={{ color: 'color-mix(in srgb, var(--text-color) 20%, transparent)' }}>
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <p className="font-medium" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
          No cases yet
        </p>
      </div>
    </div>
  )
}

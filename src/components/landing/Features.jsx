const features = [
  {
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
    title: 'OCR-powered extraction',
    description: 'Upload a scanned notice — the system reads the due date, appeal number, and parties automatically. No manual data entry.',
  },
  {
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
    title: 'Deadline dashboard',
    description: 'See what is due today, this week, and what is overdue — at a glance. No more digging through paper files.',
  },
  {
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: 'Per-case timeline',
    description: 'Every document filed chronologically — RTI request to final order. See the full lifecycle of each appeal.',
  },
  {
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Multi-lawyer support',
    description: 'Invite colleagues and clerks to your firm. Everyone sees the same cases, no duplication.',
  },
]

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Everything you need to{' '}
          <span className="gradient-text">manage PIC appeals</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl" style={{ color: 'color-mix(in srgb, var(--text-color) 65%, transparent)' }}>
          Built specifically for RTI practice before the Pakistan Information Commission — 
          not a generic case management tool.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, idx) => (
          <div key={idx} className="card">
            <div className="mb-4 inline-flex rounded-lg p-3" style={{ backgroundColor: 'color-mix(in srgb, var(--main-color) 15%, transparent)', color: 'var(--main-color)' }}>
              {feature.icon}
            </div>
            <h3 className="mb-2 text-lg font-bold">{feature.title}</h3>
            <p className="text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 65%, transparent)' }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

const problems = [
  {
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 9h.01M15 9h.01M9 13h6M9 17h6" />
        <path d="M9 12v-2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    ),
    problem: 'Manual tracking is error-prone',
    solution: 'Auto-extract response dates from notice documents — no data entry needed.',
  },
  {
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    problem: 'Scattered case files',
    solution: 'One timeline per case — RTI request, appeal, notices, order — all in one place.',
  },
  {
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    problem: 'Deadlines have real consequences',
    solution: 'Reminders via email before the due date, plus a dashboard that shows what needs attention.',
  },
]

export default function ProblemSolution() {
  return (
    <section id="problem" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {problems.map((item, idx) => (
          <div key={idx} className="card">
            <div className="mb-4 inline-flex rounded-lg p-3" style={{ backgroundColor: 'color-mix(in srgb, var(--main-color) 15%, transparent)', color: 'var(--main-color)' }}>
              {item.icon}
            </div>
            <h3 className="mb-2 text-lg font-bold">{item.problem}</h3>
            <p className="text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 65%, transparent)' }}>
              {item.solution}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

const steps = [
  {
    step: 1,
    title: 'Upload',
    description: 'Upload a PIC notice document — scanned or digital. The system reads it automatically.',
  },
  {
    step: 2,
    title: 'Confirm',
    description: 'Review the extracted fields and confirm. Low-confidence extractions flag for manual review.',
  },
  {
    step: 3,
    title: 'Get reminded',
    description: 'The dashboard shows your deadlines. Get email reminders before the due date arrives.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--second-bg-color)' }}>
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Three steps to{' '}
          <span className="gradient-text">stay on top</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl" style={{ color: 'color-mix(in srgb, var(--text-color) 65%, transparent)' }}>
          From upload to reminder in minutes.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-3">
        {steps.map((item) => (
          <div key={item.step} className="relative flex flex-col items-center text-center">
            <div
              className="mb-6 flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--main-color) 15%, transparent)',
                color: 'var(--main-color)',
              }}
            >
              {item.step}
            </div>
            {item.step < 3 && (
              <div
                className="absolute left-[60%] top-7 hidden h-px w-[60%] sm:block"
                style={{ backgroundColor: 'color-mix(in srgb, var(--main-color) 30%, transparent)' }}
              />
            )}
            <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
            <p className="max-w-xs text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 65%, transparent)' }}>
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

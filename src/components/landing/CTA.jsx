export default function CTA({ onOpenSignup }) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <div className="card border-0 p-8 sm:p-16" style={{ background: 'linear-gradient(135deg, var(--second-bg-color), color-mix(in srgb, var(--main-color) 8%, var(--second-bg-color)))' }}>
        <h2 className="text-3xl font-bold sm:text-4xl">
          Ready to stop chasing deadlines?
        </h2>
        <p className="mx-auto mt-4 max-w-lg" style={{ color: 'color-mix(in srgb, var(--text-color) 65%, transparent)' }}>
          Start tracking your PIC cases today. Free to try, no credit card needed.
        </p>
        <button onClick={onOpenSignup} className="btn-primary mt-8 text-base px-8 py-4">
          Start free
        </button>
        <p className="mt-3 text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 40%, transparent)' }}>
          Built for Pakistani RTI practice
        </p>
      </div>
    </section>
  )
}

export default function Hero({ onOpenSignup }) {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 pt-20 text-center sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium" style={{ borderColor: 'color-mix(in srgb, var(--main-color) 30%, transparent)', color: 'var(--main-color)' }}>
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--main-color)' }} />
          Built for Pakistani RTI practice
        </div>

        <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
          Never miss a{' '}
          <span className="gradient-text">PIC deadline</span>
          <br />
          again
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg" style={{ color: 'color-mix(in srgb, var(--text-color) 65%, transparent)' }}>
          Track your Right-to-Information appeals before the Pakistan Information Commission — 
          from initial request through notices and final order. Automatic deadline extraction, 
          smart reminders, and a dashboard that keeps your entire practice in one place.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button onClick={onOpenSignup} className="btn-primary text-base px-8 py-4">
            Start free
          </button>
          <a href="#how-it-works" className="btn-ghost text-base px-8 py-4">
            See how it works
          </a>
        </div>

        <p className="mt-4 text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 40%, transparent)' }}>
          No credit card required
        </p>
      </div>
    </section>
  )
}

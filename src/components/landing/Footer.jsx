export default function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }}>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
          &copy; {new Date().getFullYear()} DocketDesk. Built for RTI practice before the Pakistan Information Commission.
        </p>
        <div className="flex items-center gap-4">
          <a href="mailto:hello@pictracker.com" className="text-xs underline underline-offset-2 transition-colors" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
            Contact
          </a>
        </div>
      </div>
    </footer>
  )
}

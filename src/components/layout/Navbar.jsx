import { useState } from 'react'
import ThemeToggle from '../ui/ThemeToggle'

export default function Navbar({ onOpenLogin, onOpenSignup }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b" style={{ backgroundColor: 'var(--bg-color)', borderColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)' }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2">
          <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill="#ea580c"/>
            <path d="M8 10h16v2H8zm0 5h16v2H8zm0 5h10v2H8z" fill="#fff" opacity="0.9"/>
            <circle cx="24" cy="22" r="4" fill="#fff"/>
            <path d="M23 22h2m-1-1v2" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-xl font-bold">
            PIC<span className="gradient-text">Tracker</span>
          </span>
        </a>

        <div className="hidden items-center gap-4 sm:flex">
          <ThemeToggle />
          <button onClick={onOpenLogin} className="btn-ghost text-sm">Log in</button>
          <button onClick={onOpenSignup} className="btn-primary text-sm">Sign up free</button>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="btn-ghost px-2 py-2" aria-label="Menu">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t px-4 py-4 sm:hidden" style={{ borderColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)', backgroundColor: 'var(--bg-color)' }}>
          <div className="flex flex-col gap-3">
            <button onClick={() => { setMobileOpen(false); onOpenLogin(); }} className="btn-ghost w-full text-sm">Log in</button>
            <button onClick={() => { setMobileOpen(false); onOpenSignup(); }} className="btn-primary w-full text-sm">Sign up free</button>
          </div>
        </div>
      )}
    </nav>
  )
}

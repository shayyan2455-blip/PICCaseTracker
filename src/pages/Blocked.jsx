import { Link } from 'react-router-dom'

export default function Blocked() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-8"
      style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
    >
      <div className="max-w-md text-center">
        <div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl"
          style={{ backgroundColor: 'color-mix(in srgb, #ef4444 12%, transparent)', color: '#ef4444' }}
        >
          <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <line x1="9" y1="12" x2="15" y2="12" />
          </svg>
        </div>
        <h1 className="mt-6 text-7xl font-bold" style={{ color: '#ef4444' }}>403</h1>
        <p className="mt-4 text-lg font-medium">Access Denied</p>
        <p className="mt-2 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
          Your account has been blocked and you no longer have access to this application.
          Please contact your organization administrator if you believe this is a mistake.
        </p>
        <Link to="/" className="btn-primary mt-8 inline-flex text-sm px-6 py-2.5">
          Back to home
        </Link>
      </div>
    </div>
  )
}

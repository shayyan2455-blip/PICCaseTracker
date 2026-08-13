import { Link, useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-8"
      style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
    >
      <div className="max-w-md text-center">
        <div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl"
          style={{ backgroundColor: 'color-mix(in srgb, var(--main-color) 12%, transparent)', color: 'var(--main-color)' }}
        >
          <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
        </div>
        <h1
          className="mt-6 text-7xl font-bold"
          style={{ background: 'var(--span-color)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
        >
          404
        </h1>
        <p className="mt-4 text-lg font-medium">Page not found</p>
        <p className="mt-2 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost text-sm px-6 py-2.5">
            Go back
          </button>
          <Link to="/" className="btn-primary text-sm px-6 py-2.5">
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}

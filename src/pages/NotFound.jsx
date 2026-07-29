import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold" style={{ color: 'var(--main-color)' }}>404</h1>
        <p className="mt-4 text-lg font-medium">Page not found</p>
        <p className="mt-2 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary mt-6 inline-flex text-sm px-6 py-2.5">
          Go home
        </Link>
      </div>
    </div>
  )
}

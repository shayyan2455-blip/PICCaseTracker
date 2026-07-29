import { NavLink, Outlet, useLocation } from 'react-router-dom'
import TopBar from './TopBar'

const icon = {
  dashboard: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  cases: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  newCase: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  settings: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
}

const items = [
  { to: '/app', label: 'Dashboard', key: 'dashboard' },
  { to: '/app/cases', label: 'Cases', key: 'cases' },
  { to: '/app/cases/new', label: 'New Case', key: 'newCase' },
  { to: '/app/settings', label: 'Settings', key: 'settings' },
]

export default function AppShell() {
  const location = useLocation()

  function activeStyle(path) {
    const active =
      path === '/app'
        ? location.pathname === '/app'
        : path === '/app/cases'
          ? location.pathname.startsWith('/app/cases') && location.pathname !== '/app/cases/new'
          : location.pathname === path
    return {
      backgroundColor: active ? 'color-mix(in srgb, var(--main-color) 15%, var(--bg-color))' : 'transparent',
      color: active ? 'var(--main-color)' : 'color-mix(in srgb, var(--text-color) 60%, transparent)',
    }
  }

  function activeColor(path) {
    const active =
      path === '/app'
        ? location.pathname === '/app'
        : path === '/app/cases'
          ? location.pathname.startsWith('/app/cases') && location.pathname !== '/app/cases/new'
          : location.pathname === path
    return active ? 'var(--main-color)' : 'color-mix(in srgb, var(--text-color) 50%, transparent)'
  }

  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      <TopBar />

      {/* Desktop sidebar */}
      <aside className="hidden sm:flex sm:w-56 sm:flex-col sm:pt-16">
        <nav className="flex flex-col gap-1 px-3 py-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:opacity-80"
              style={activeStyle(item.to)}
            >
              {icon[item.key]}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-4 pt-20 pb-24 sm:ml-0 sm:pt-20 sm:pb-8 sm:pr-6 lg:pr-8">
        <Outlet />
      </main>

      {/* Bottom tab bar — mobile only */}
      <nav className="bottom-tab-bar sm:hidden">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className="flex flex-col items-center gap-0.5 text-xs"
            style={{ color: activeColor(item.to) }}
          >
            {icon[item.key]}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

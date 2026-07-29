import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../ui/ThemeToggle'
import { supabase } from '../../lib/supabaseClient'
import { clearOrgId } from '../../lib/org'

export default function TopBar() {
  const navigate = useNavigate()

  async function handleLogout() {
    clearOrgId()
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between border-b px-4 py-3 sm:px-6 lg:px-8"
      style={{
        backgroundColor: 'var(--bg-color)',
        borderColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)',
      }}
    >
      <a href="/app" className="flex items-center gap-2">
        <svg className="h-7 w-7" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="var(--main-color)"/>
          <path d="M8 10h16v2H8zm0 5h16v2H8zm0 5h10v2H8z" fill="var(--bg-color)" opacity="0.9"/>
          <circle cx="24" cy="22" r="4" fill="var(--bg-color)"/>
          <path d="M23 22h2m-1-1v2" stroke="var(--main-color)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span className="text-lg font-bold">
          PIC<span style={{ color: 'var(--main-color)' }}>Tracker</span>
        </span>
      </a>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button onClick={handleLogout} className="btn-ghost px-3 py-2 text-sm">
          Log out
        </button>
      </div>
    </header>
  )
}

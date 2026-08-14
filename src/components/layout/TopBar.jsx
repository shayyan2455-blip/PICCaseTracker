import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../ui/ThemeToggle'
import BrandLogo from '../ui/BrandLogo'
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
        <BrandLogo className="h-7 w-7" />
        <span className="text-lg font-bold">
          Docket<span style={{ color: 'var(--main-color)' }}>Desk</span>
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

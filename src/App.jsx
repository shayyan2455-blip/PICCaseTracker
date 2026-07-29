import { useState, useEffect } from 'react'
import { getTheme, initTheme } from './lib/theme'
import LandingPage from './pages/LandingPage'
import LoginModal from './components/auth/LoginModal'
import SignupModal from './components/auth/SignupModal'
import { supabase } from './lib/supabaseClient'

export default function App() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initTheme()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener?.subscription.unsubscribe()
  }, [])

  // User is logged in — redirect to /app
  useEffect(() => {
    if (session && !loading) {
      window.location.href = '/app'
    }
  }, [session, loading])

  function openLogin() {
    setSignupOpen(false)
    setLoginOpen(true)
  }

  function openSignup() {
    setLoginOpen(false)
    setSignupOpen(true)
  }

  function switchToLogin() {
    setSignupOpen(false)
    setLoginOpen(true)
  }

  function switchToSignup() {
    setLoginOpen(false)
    setSignupOpen(true)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-b-transparent" style={{ borderColor: 'var(--main-color)', borderBottomColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <>
      <LandingPage onOpenLogin={openLogin} onOpenSignup={openSignup} />
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToSignup={switchToSignup}
      />
      <SignupModal
        isOpen={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSwitchToLogin={switchToLogin}
      />
    </>
  )
}

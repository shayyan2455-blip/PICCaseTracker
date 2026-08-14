import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { initTheme } from './lib/theme'
import { supabase } from './lib/supabaseClient'
import ErrorBoundary from './components/ErrorBoundary'
import LandingPage from './pages/LandingPage'
import NotFound from './pages/NotFound'
import Blocked from './pages/Blocked'
import LoginModal from './components/auth/LoginModal'
import SignupModal from './components/auth/SignupModal'
import ChangePasswordModal from './components/auth/ChangePasswordModal'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/app/Dashboard'
import CaseList from './pages/app/CaseList'
import CaseDetail from './pages/app/CaseDetail'
import NewCase from './pages/app/NewCase'
import Settings from './pages/app/Settings'
import Reminders from './pages/app/Reminders'
import { CasesProvider } from './lib/CasesContext'
import { DocumentsProvider } from './lib/DocumentsContext'
import { HearingsProvider } from './lib/HearingsContext'

function ProtectedRoute({ blocked, children }) {
  if (!session) return <Navigate to="/" replace />
  if (blocked) return <Navigate to="/blocked" replace />
  return children
}

export default function App() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    initTheme()

    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)

      if (session) {
        const { data: flags } = await supabase.rpc('get_my_flags')
        setBlocked(flags?.blocked === true)
        setMustChangePassword(flags?.must_change_password === true)
      }

      setLoading(false)
    }

    loadSession()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)

      if (session) {
        const { data: flags } = await supabase.rpc('get_my_flags')
        setBlocked(flags?.blocked === true)
        setMustChangePassword(flags?.must_change_password === true)
      } else {
        setBlocked(false)
        setMustChangePassword(false)
      }
    })

    return () => listener?.subscription.unsubscribe()
  }, [])

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

  function closeModals() {
    setLoginOpen(false)
    setSignupOpen(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-b-transparent" style={{ borderColor: 'var(--main-color)', borderBottomColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              session ? (
                <Navigate to="/app" replace />
              ) : (
                <>
                  <LandingPage onOpenLogin={openLogin} onOpenSignup={openSignup} />
                  <LoginModal
                    isOpen={loginOpen}
                    onClose={closeModals}
                    onSwitchToSignup={switchToSignup}
                  />
                  <SignupModal
                    isOpen={signupOpen}
                    onClose={closeModals}
                    onSwitchToLogin={switchToLogin}
                  />
                </>
              )
            }
          />
          <Route
            path="/app"
            element={
              <ProtectedRoute blocked={blocked}>
                <CasesProvider>
                  <DocumentsProvider>
                    <HearingsProvider>
                      <AppShell />
                    </HearingsProvider>
                  </DocumentsProvider>
                </CasesProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="cases" element={<CaseList />} />
            <Route path="cases/new" element={<NewCase />} />
            <Route path="cases/:id" element={<CaseDetail />} />
            <Route path="reminders" element={<Reminders />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route
            path="/blocked"
            element={
              session && !session.user?.user_metadata?.blocked ? (
                <Navigate to="/app" replace />
              ) : (
                <Blocked />
              )
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {session && mustChangePassword && <ChangePasswordModal />}
      </BrowserRouter>
    </ErrorBoundary>
  )
}

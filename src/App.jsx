import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { initTheme } from './lib/theme'
import { supabase } from './lib/supabaseClient'
import ErrorBoundary from './components/ErrorBoundary'
import LandingPage from './pages/LandingPage'
import NotFound from './pages/NotFound'
import LoginModal from './components/auth/LoginModal'
import SignupModal from './components/auth/SignupModal'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/app/Dashboard'
import CaseList from './pages/app/CaseList'
import CaseDetail from './pages/app/CaseDetail'
import NewCase from './pages/app/NewCase'
import Settings from './pages/app/Settings'
import AcceptInvite from './pages/AcceptInvite'
import { CasesProvider } from './lib/CasesContext'
import { DocumentsProvider } from './lib/DocumentsContext'
import { HearingsProvider } from './lib/HearingsContext'

function ProtectedRoute({ session, children }) {
  if (!session) return <Navigate to="/" replace />
  return children
}

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
          <Route path="/accept-invite" element={<AcceptInvite />} />
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
              <ProtectedRoute session={session}>
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
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

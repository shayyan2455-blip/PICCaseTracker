import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(120)
  const timerRef = useRef(null)
  const otpRefs = useRef([])

  useEffect(() => {
    if (step === 'forgot_otp') {
      setCountdown(120)
      timerRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(timerRef.current); return 0 }
          return c - 1
        })
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [step])

  useEffect(() => {
    if (step === 'forgot_otp' && countdown === 0) {
      setError('OTP has expired. Please request a new one.')
    }
  }, [countdown, step])

  if (!isOpen) return null

  function resetForm() {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setOtp('')
    setStep('login')
    setError('')
    if (timerRef.current) clearInterval(timerRef.current)
  }

  function handleClose() { resetForm(); onClose() }
  function handleSwitchToSignup() { resetForm(); onSwitchToSignup() }

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) { setError(authError.message); return }
    onClose()
  }

  async function handleSendOtp(e) {
    e.preventDefault()
    if (!email.trim()) { setError('Enter your email address'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'send-otp', email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to send OTP'); setLoading(false); return }
      setStep('forgot_otp')
    } catch (e) {
      setError('Failed to connect to server. Please try again.')
    }
    setLoading(false)
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    if (otp.length !== 8) { setError('Enter the 8-digit OTP'); return }
    if (countdown === 0) { setError('OTP has expired. Request a new one.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'verify-otp', email: email.trim(), otp }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Invalid OTP'); setLoading(false); return }
      setStep('forgot_password')
    } catch (e) {
      setError('Failed to connect to server. Please try again.')
    }
    setLoading(false)
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reset-password', email: email.trim(), otp, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to reset password'); setLoading(false); return }
      resetForm()
      onClose()
    } catch (e) {
      setError('Failed to connect to server. Please try again.')
    }
    setLoading(false)
  }

  function inputStyle() {
    return {
      backgroundColor: 'var(--second-bg-color)',
      borderColor: 'color-mix(in srgb, var(--text-color) 15%, transparent)',
      color: 'var(--text-color)',
    }
  }

  function handleOtpDigit(index, e) {
    const val = e.target.value.replace(/\D/g, '')
    if (val.length > 1) return
    const newOtp = otp.split('')
    newOtp[index] = val
    const joined = newOtp.join('').slice(0, 8)
    setOtp(joined)
    if (val && index < 7) otpRefs.current[index + 1]?.focus()
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  function handleOtpPaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8)
    if (pasted) {
      setOtp(pasted)
      const target = pasted.length < 8 ? pasted.length - 1 : 7
      setTimeout(() => otpRefs.current[target]?.focus(), 0)
    }
  }

  const title = step === 'login' ? 'Welcome back'
    : step === 'forgot_email' ? 'Forgot Password'
    : step === 'forgot_otp' ? 'Enter OTP'
    : 'Reset Password'

  const subtitle = step === 'login' ? 'Log in to your DocketDesk account'
    : step === 'forgot_email' ? 'Enter your email to receive a reset code'
    : step === 'forgot_otp' ? `An 8-digit code was sent to ${email}`
    : 'Choose a new password'

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleClose} className="absolute right-4 top-4 rounded-lg p-1 transition-colors" style={{ color: 'var(--text-color)' }} aria-label="Close">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 className="mb-1 text-2xl font-bold">{title}</h2>
        <p className="mb-6 text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>{subtitle}</p>

        {error && <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>}

        {step === 'login' && (
          <>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label htmlFor="login-email" className="mb-1 block text-sm font-medium">Email</label>
                <input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors"
                  style={inputStyle()} placeholder="you@lawfirm.com" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="login-password" className="block text-sm font-medium">Password</label>
                  <button type="button" onClick={() => { setStep('forgot_email'); setError('') }} className="text-xs underline underline-offset-2" style={{ color: 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
                    Forgot?
                  </button>
                </div>
                <input id="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors"
                  style={inputStyle()} placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full text-sm">
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>
            <p className="mt-5 text-center text-sm" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
              Don't have an account?{' '}
              <button onClick={handleSwitchToSignup} className="font-semibold underline underline-offset-2" style={{ color: 'var(--main-color)' }}>Sign up</button>
            </p>
          </>
        )}

        {step === 'forgot_email' && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div>
              <label htmlFor="forgot-email" className="mb-1 block text-sm font-medium">Email</label>
              <input id="forgot-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors"
                style={inputStyle()} placeholder="you@lawfirm.com" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-sm">
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
            <button type="button" onClick={() => { setStep('login'); setError('') }} className="text-sm underline underline-offset-2" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
              Back to login
            </button>
          </form>
        )}

        {step === 'forgot_otp' && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div onPaste={handleOtpPaste}>
              <label className="mb-2 block text-sm font-medium">8-Digit Code</label>
              <div className="flex justify-between gap-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[i] || ''}
                    onChange={(e) => handleOtpDigit(i, e)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-full rounded-lg border text-center text-lg font-bold outline-none transition-colors"
                    style={{
                      ...inputStyle(),
                      aspectRatio: '1',
                      borderColor: otp[i] ? 'var(--main-color)' : 'color-mix(in srgb, var(--text-color) 15%, transparent)',
                    }}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
            </div>
            <p className="text-center text-xs" style={{ color: countdown === 0 ? '#ef4444' : 'color-mix(in srgb, var(--text-color) 50%, transparent)' }}>
              {countdown > 0
                ? `Code expires in ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`
                : 'Code expired'}
            </p>
            <button type="submit" disabled={loading || countdown === 0} className="btn-primary w-full text-sm">
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <div className="flex justify-between">
              <button type="button" onClick={() => { setStep('forgot_email'); setError('') }} className="text-xs underline underline-offset-2" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
                Change email
              </button>
              <button type="button" onClick={handleSendOtp} disabled={loading} className="text-xs underline underline-offset-2" style={{ color: 'var(--main-color)' }}>
                Resend code
              </button>
            </div>
          </form>
        )}

        {step === 'forgot_password' && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div>
              <label htmlFor="new-password" className="mb-1 block text-sm font-medium">New Password</label>
              <input id="new-password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors"
                style={inputStyle()} placeholder="At least 6 characters" />
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium">Confirm Password</label>
              <input id="confirm-password" type="password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors"
                style={inputStyle()} placeholder="Re-enter your password" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-sm">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button type="button" onClick={() => { setStep('login'); setError('') }} className="text-sm underline underline-offset-2" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
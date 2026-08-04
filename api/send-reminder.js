import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function getTransporter() {
  const smtpUser = process.env.GMAIL_SMTP_USER
  const smtpPass = process.env.GMAIL_SMTP_PASS

  if (!smtpUser || !smtpPass) {
    throw new Error('GMAIL_SMTP_USER and GMAIL_SMTP_PASS must be set')
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: smtpUser, pass: smtpPass },
  })
}

function generateOtp() {
  return String(Math.floor(10000000 + Math.random() * 90000000))
}

function generateTempPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghjkmnpqrstuvwxyz'
  const digits = '23456789'
  const chars = upper + lower + digits
  let pw = upper[Math.floor(Math.random() * upper.length)]
  pw += digits[Math.floor(Math.random() * digits.length)]
  for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)]
  return pw.split('').sort(() => Math.random() - 0.5).join('')
}

async function handleInviteUser({ email, role, orgId, inviterUserId }) {
  const normalizedEmail = (email || '').trim().toLowerCase()
  if (!normalizedEmail) return { error: 'Missing email' }
  if (!['lawyer', 'clerk'].includes(role)) return { error: 'Invalid role' }
  if (!orgId || !inviterUserId) return { error: 'Missing organization or user' }

  // Only the owner can invite
  const { data: inviter } = await supabaseAdmin
    .from('members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', inviterUserId)
    .maybeSingle()

  if (!inviter || inviter.role !== 'owner') {
    return { error: 'Only the organization owner can invite members' }
  }

  // Does the account already exist?
  const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  const existing = users?.users?.find((u) => u.email === normalizedEmail)

  if (existing) {
    const { data: mem } = await supabaseAdmin
      .from('members')
      .select('id')
      .eq('organization_id', orgId)
      .eq('user_id', existing.id)
      .maybeSingle()

    if (mem) return { error: 'This user is already a member of your organization' }

    const { error: mErr } = await supabaseAdmin
      .from('members')
      .insert({ organization_id: orgId, user_id: existing.id, role })

    if (mErr) return { error: 'Failed to add member' }

    const transporter = getTransporter()
    await transporter.sendMail({
      from: `"PIC Case Tracker" <${process.env.GMAIL_SMTP_USER}>`,
      to: normalizedEmail,
      subject: 'You were added to a PIC Case Tracker organization',
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 8px">PIC Case Tracker</h2>
        <p style="color:#666;margin:0 0 24px">You have been added to an organization as <strong>${role}</strong>. Log in with your existing account to access it.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
        <p style="color:#999;font-size:12px">PIC Case Tracker</p>
      </div>`,
    })

    return { success: true, existing: true }
  }

  // Create a new account with a temporary password
  const tempPassword = generateTempPassword()
  const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
    email: normalizedEmail,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { must_change_password: true },
  })

  if (cErr) return { error: cErr.message }

  const { error: mErr2 } = await supabaseAdmin
    .from('members')
    .insert({ organization_id: orgId, user_id: created.user.id, role })

  if (mErr2) return { error: 'Failed to add member' }

  const transporter = getTransporter()
  await transporter.sendMail({
    from: `"PIC Case Tracker" <${process.env.GMAIL_SMTP_USER}>`,
    to: normalizedEmail,
    subject: 'Your PIC Case Tracker account',
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 8px">PIC Case Tracker</h2>
      <p style="color:#666;margin:0 0 4px">An account has been created for you as <strong>${role}</strong>. Log in with:</p>
      <p style="margin:8px 0 4px"><strong>Email:</strong> ${normalizedEmail}</p>
      <p style="margin:0 0 8px"><strong>Temporary password:</strong> <span style="font-size:18px;font-weight:700;color:#ea580c">${tempPassword}</span></p>
      <p style="color:#666;margin:0 0 24px">You will be asked to set a new password after your first login.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
      <p style="color:#999;font-size:12px">PIC Case Tracker</p>
    </div>`,
  })

  return { success: true, existing: false }
}

async function sendTestEmail(to) {
  const transporter = getTransporter()
  await transporter.sendMail({
    from: `"PIC Case Tracker" <${process.env.GMAIL_SMTP_USER}>`,
    to,
    subject: 'PIC Case Tracker — Test Email',
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 8px">PIC Case Tracker</h2>
      <p style="color:#666;margin:0 0 24px">This is a test email to confirm your reminder delivery is working.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
      <p style="color:#999;font-size:12px">PIC Case Tracker</p>
    </div>`,
  })
}

async function handleSendOtp(email) {
  // Check if email exists in auth.users
  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const user = users?.users?.find((u) => u.email === email)
  if (!user) return { error: 'No account found with this email address' }

  // Invalidate any previous unused OTPs for this email
  await supabaseAdmin
    .from('password_resets')
    .update({ used: true })
    .eq('email', email)
    .eq('used', false)

  // Generate and store OTP
  const otp = generateOtp()
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString()

  const { error: insertErr } = await supabaseAdmin
    .from('password_resets')
    .insert({ email, otp, expires_at: expiresAt })

  if (insertErr) return { error: 'Failed to generate OTP' }

  // Send email
  const transporter = getTransporter()
  try {
    await transporter.sendMail({
      from: `"PIC Case Tracker" <${process.env.GMAIL_SMTP_USER}>`,
      to: email,
      subject: 'PIC Case Tracker — Password Reset OTP',
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 8px">PIC Case Tracker</h2>
        <p style="color:#666;margin:0 0 4px">Your OTP for password reset is:</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;margin:24px 0;color:#ea580c">${otp}</div>
        <p style="color:#999;font-size:13px">This OTP expires in 2 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
        <p style="color:#999;font-size:12px">PIC Case Tracker</p>
      </div>`,
    })
  } catch {
    return { error: 'Failed to send OTP email. Check SMTP configuration.' }
  }

  return { success: true }
}

async function handleVerifyOtp(email, otp) {
  const { data, error } = await supabaseAdmin
    .from('password_resets')
    .select('*')
    .eq('email', email)
    .eq('otp', otp)
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return { error: 'Invalid or expired OTP' }
  return { success: true, resetId: data.id }
}

async function handleResetPassword(email, otp, newPassword) {
  // Verify OTP again
  const { data: record, error: fetchErr } = await supabaseAdmin
    .from('password_resets')
    .select('*')
    .eq('email', email)
    .eq('otp', otp)
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fetchErr || !record) return { error: 'Invalid or expired OTP' }

  // Find user by email
  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const user = users?.users?.find((u) => u.email === email)
  if (!user) return { error: 'User not found' }

  // Update password via admin API
  const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { password: newPassword }
  )

  if (updateErr) return { error: 'Failed to update password' }

  // Mark OTP as used
  await supabaseAdmin
    .from('password_resets')
    .update({ used: true })
    .eq('id', record.id)

  return { success: true }
}

async function sendDailyReminders() {
  const transporter = getTransporter()

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // Fetch upcoming hearings for all orgs with enabled prefs
  const { data: hearings, error: hErr } = await supabaseAdmin
    .from('hearings')
    .select(`
      id, case_id, due_date,
      cases!inner(title, organization_id)
    `)
    .eq('outcome', 'pending')
    .gte('due_date', todayStr)

  if (hErr) throw new Error('DB query failed: ' + hErr.message)
  if (!hearings || hearings.length === 0) return { sent: 0 }

  // Get reminder prefs
  const orgIds = [...new Set(hearings.map(h => h.cases.organization_id))]
  const { data: prefs, error: pErr } = await supabaseAdmin
    .from('org_reminder_prefs')
    .select('*')
    .in('organization_id', orgIds)
    .eq('enabled', true)

  if (pErr) throw new Error('Prefs query failed: ' + pErr.message)

  // Filter hearings by reminder window (due_date <= today + days_before)
  const prefsMap = (prefs || []).reduce((acc, p) => { acc[p.organization_id] = p; return acc }, {})
  const filtered = hearings.filter(h => {
    const p = prefsMap[h.cases.organization_id]
    if (!p) return false
    const due = new Date(h.due_date)
    const windowEnd = new Date(today)
    windowEnd.setDate(windowEnd.getDate() + p.days_before)
    return due >= today && due <= windowEnd
  })

  if (filtered.length === 0) return { sent: 0 }

  // Group by org
  const byOrg = {}
  for (const h of filtered) {
    const orgId = h.cases.organization_id
    if (!byOrg[orgId]) byOrg[orgId] = { hearings: [] }
    byOrg[orgId].hearings.push(h)
  }

  // Get members per org
  const memberMap = {}
  for (const orgId of Object.keys(byOrg)) {
    const { data: members } = await supabaseAdmin
      .from('members')
      .select('user_id')
      .eq('organization_id', orgId)
      .in('role', ['owner', 'lawyer'])

    const emails = []
    for (const m of members || []) {
      const { data: u } = await supabaseAdmin.auth.admin.getUserById(m.user_id)
      if (u?.user?.email) emails.push(u.user.email)
    }
    memberMap[orgId] = emails
  }

  // Send emails
  const vercelUrl = process.env.VERCEL_URL
    ? 'https://' + process.env.VERCEL_URL
    : 'http://localhost:5173'

  let sentCount = 0

  for (const [orgId, group] of Object.entries(byOrg)) {
    const emails = memberMap[orgId]
    if (!emails || emails.length === 0) continue

    const rows = group.hearings.map(h => {
      const date = new Date(h.due_date).toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long',
      })
      const isOverdue = new Date(h.due_date) < today
      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">${h.cases?.title || 'Untitled Case'}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;color:${isOverdue ? '#ef4444' : '#ea580c'}">${date}${isOverdue ? ' (OVERDUE)' : ''}</td>
        <td style="padding:8px;border-bottom:1px solid #eee"><a href="${vercelUrl}/app/cases/${h.case_id}" style="color:#ea580c">View</a></td>
      </tr>`
    }).join('')

    const todayDisplay = today.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    })

    const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 8px">PIC Case Tracker</h2>
      <p style="color:#666;margin:0 0 4px">Your deadlines for ${todayDisplay}</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0">${rows}</table>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
      <p style="color:#999;font-size:12px">PIC Case Tracker</p>
    </div>`

    const subject = `${group.hearings.length} deadline${group.hearings.length > 1 ? 's' : ''} need${group.hearings.length > 1 ? '' : 's'} attention`

    for (const email of emails) {
      try {
        await transporter.sendMail({
          from: `"PIC Case Tracker" <${process.env.GMAIL_SMTP_USER}>`,
          to: email,
          subject: `PIC Case Tracker — ${subject}`,
          html,
        })
        sentCount++
      } catch (e) {
        console.error('Failed to send to', email, e.message)
      }
    }

    // Log reminders
    for (const h of group.hearings) {
      try {
        await supabaseAdmin.from('reminder_log').insert({
          hearing_id: h.id,
          channel: 'email',
        })
      } catch (e) {
        // Likely dedupe conflict — skip
      }
    }
  }

  return { sent: sentCount }
}

export default async function handler(req, res) {
  const start = Date.now()

  try {
    const { to, type } = req.body || {}

    if (req.headers['x-vercel-cron'] || type === 'daily') {
      const result = await sendDailyReminders()
      return res.status(200).json({
        ...result,
        elapsed_ms: Date.now() - start,
      })
    }

    if (type === 'test') {
      if (!to) return res.status(400).json({ error: 'Missing recipient email' })
      await sendTestEmail(to)
      return res.status(200).json({ success: true, elapsed_ms: Date.now() - start })
    }

    if (type === 'send-otp') {
      const { email } = req.body || {}
      if (!email) return res.status(400).json({ error: 'Missing email' })
      const result = await handleSendOtp(email)
      return res.status(result.error ? 400 : 200).json({ ...result, elapsed_ms: Date.now() - start })
    }

    if (type === 'verify-otp') {
      const { email, otp } = req.body || {}
      if (!email || !otp) return res.status(400).json({ error: 'Missing email or OTP' })
      const result = await handleVerifyOtp(email, otp)
      return res.status(result.error ? 400 : 200).json({ ...result, elapsed_ms: Date.now() - start })
    }

    if (type === 'reset-password') {
      const { email, otp, password } = req.body || {}
      if (!email || !otp || !password) return res.status(400).json({ error: 'Missing required fields' })
      if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
      const result = await handleResetPassword(email, otp, password)
      return res.status(result.error ? 400 : 200).json({ ...result, elapsed_ms: Date.now() - start })
    }

    if (type === 'invite-user') {
      const { email, role, orgId, inviterUserId } = req.body || {}
      const result = await handleInviteUser({ email, role, orgId, inviterUserId })
      return res.status(result.error ? 400 : 200).json({ ...result, elapsed_ms: Date.now() - start })
    }

    return res.status(400).json({ error: 'Invalid request' })
  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: err.message, elapsed_ms: Date.now() - start })
  }
}

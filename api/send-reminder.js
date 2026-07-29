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

    return res.status(400).json({ error: 'Invalid request' })
  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: err.message, elapsed_ms: Date.now() - start })
  }
}

const nodemailer = require('nodemailer')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { to, type, hearings } = req.body

  if (!to) {
    return res.status(400).json({ error: 'Missing recipient email' })
  }

  const smtpUser = process.env.GMAIL_SMTP_USER
  const smtpPass = process.env.GMAIL_SMTP_PASS

  if (!smtpUser || !smtpPass) {
    return res.status(500).json({
      error: 'GMAIL_SMTP_USER and GMAIL_SMTP_PASS must be set in environment variables',
    })
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: smtpUser, pass: smtpPass },
  })

  let subject, html

  if (type === 'test') {
    subject = 'PIC Case Tracker — Test Email'
    html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 8px">PIC Case Tracker</h2>
      <p style="color:#666;margin:0 0 24px">This is a test email to confirm your reminder delivery is working.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
      <p style="color:#999;font-size:12px">PIC Case Tracker &mdash; Never miss a PIC deadline again.</p>
    </div>`
  } else if (type === 'daily' && hearings?.length > 0) {
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    subject = `PIC Case Tracker — ${hearings.length} deadline${hearings.length > 1 ? 's' : ''} need${hearings.length > 1 ? '' : 's'} attention`

    const rows = hearings.map((h) => {
      const date = new Date(h.due_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
      const isOverdue = new Date(h.due_date) < new Date()
      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">${h.case_title || 'Untitled Case'}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;color:${isOverdue ? '#ef4444' : '#ea580c'}">${date}${isOverdue ? ' (OVERDUE)' : ''}</td>
        <td style="padding:8px;border-bottom:1px solid #eee"><a href="${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:5173'}/app/cases/${h.case_id}" style="color:#ea580c">View →</a></td>
      </tr>`
    }).join('')

    html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 8px">PIC Case Tracker</h2>
      <p style="color:#666;margin:0 0 4px">Your deadlines for ${today}</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0">${rows}</table>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
      <p style="color:#999;font-size:12px">PIC Case Tracker &mdash; Never miss a PIC deadline again.</p>
    </div>`
  } else {
    return res.status(400).json({ error: 'Invalid email type' })
  }

  try {
    await transporter.sendMail({
      from: `"PIC Case Tracker" <${smtpUser}>`,
      to,
      subject,
      html,
    })
    res.status(200).json({ success: true })
  } catch (err) {
    console.error('Email send error:', err)
    res.status(500).json({ error: err.message })
  }
}

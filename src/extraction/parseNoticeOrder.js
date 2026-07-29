const monthNames = ['january','february','march','april','may','june','july','august','september','october','november','december']
const monthAbbr = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']

function parseDate(text) {
  const patterns = [
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    /(\d{4})-(\d{2})-(\d{2})/,
    /(\d{1,2})-(\d{1,2})-(\d{4})/,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  }

  const wordDate = new RegExp(`(${[...monthNames, ...monthAbbr].join('|')})\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})`, 'gi')
  const wm = text.match(wordDate)
  if (wm) {
    const parts = wm[0].match(/(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i)
    if (parts) {
      const monthIdx = [...monthNames, ...monthAbbr].indexOf(parts[1].toLowerCase())
      if (monthIdx >= 0) {
        const realMonth = (monthIdx % 12) + 1
        return `${parts[3]}-${String(realMonth).padStart(2, '0')}-${parts[2].padStart(2, '0')}`
      }
    }
  }
  return null
}

export function parseNoticeOrder(rawText, fileName) {
  const result = {
    document_type: null,
    appeal_no: null,
    applicant: null,
    respondent: null,
    notice_date: null,
    due_date: null,
    is_disposed: false,
    confidence: 'high',
    missing_fields: [],
  }

  const text = rawText || ''
  const lower = text.toLowerCase()
  const nameLower = fileName.toLowerCase()

  const noticeTypes = [
    { match: /first notice/i, type: 'first_notice' },
    { match: /second notice/i, type: 'second_notice' },
    { match: /final notice/i, type: 'final_notice' },
    { match: /^notice/i, type: 'first_notice' },
  ]

  const orderMatch = /order/i
  const noticeMatch = /notice/i

  if (orderMatch.test(text) || orderMatch.test(fileName)) {
    if (!noticeMatch.test(text) && !noticeMatch.test(fileName)) {
      result.document_type = 'order'
    }
  }

  if (!result.document_type) {
    for (const nt of noticeTypes) {
      if (nt.match.test(text) || nt.match.test(nameLower)) {
        result.document_type = nt.type
        break
      }
    }
  }

  if (!result.document_type) {
    if (lower.includes('rti') || lower.includes('request') || nameLower.includes('rti')) {
      result.document_type = 'rti_request'
    } else if (lower.includes('appeal') || nameLower.includes('appeal')) {
      result.document_type = 'appeal_to_pic'
    }
  }

  const appealNoMatch = text.match(/Appeal\s*No\.?\s*(\d{3,5}-\d{2}\/\d{2,4})/i)
  if (appealNoMatch) result.appeal_no = appealNoMatch[1]

  const vsMatch = text.match(/(.+?)(?:\s*\n\s*)?(?:vs|versus|v\/s)(?:\s*\n\s*)?(.+?)(?:\n|$)/i)
  if (vsMatch) {
    result.applicant = vsMatch[1].trim()
    result.respondent = vsMatch[2].trim()
  }

  const dateLabelMatch = text.match(/Date\s*:\s*(.+)/i)
  if (dateLabelMatch) {
    result.notice_date = parseDate(dateLabelMatch[1])
  }
  if (!result.notice_date) {
    result.notice_date = parseDate(text)
  }

  const dueAnchor = text.match(/Commission\s+by\s+(.+?)(?:failing|\.|$)/i)
  if (dueAnchor) {
    result.due_date = parseDate(dueAnchor[1])
  }

  if (lower.includes('appeal stands disposed')) {
    result.is_disposed = true
  }

  const requiredFields = ['document_type', 'appeal_no']
  for (const field of requiredFields) {
    if (!result[field]) result.missing_fields.push(field)
  }
  if (result.document_type && result.document_type.includes('notice')) {
    if (!result.due_date) result.missing_fields.push('due_date')
  }
  if (result.document_type === 'order') {
    if (!result.is_disposed) result.missing_fields.push('disposed_status')
  }

  if (result.missing_fields.length > 0) {
    result.confidence = 'low'
  }

  return result
}

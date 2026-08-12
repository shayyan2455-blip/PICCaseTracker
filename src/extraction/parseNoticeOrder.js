const monthNames = ['january','february','march','april','may','june','july','august','september','october','november','december']
const monthAbbr = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']

function pad(n) {
  return String(n).padStart(2, '0')
}

// Pakistan uses DD/MM/YYYY — interpret numeric dates in that order
function normalizeNumericDate(day, month, year) {
  const y = year.length === 2 ? '20' + year : year
  return `${y}-${pad(month)}-${pad(day)}`
}

const numericDateRe = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/g

function isLikelyDay(n) { return n >= 1 && n <= 31 }
function isLikelyMonth(n) { return n >= 1 && n <= 12 }

function collectNumericDates(text) {
  const out = []
  let m
  const re = new RegExp(numericDateRe.source, 'g')
  while ((m = re.exec(text))) {
    const a = parseInt(m[1], 10)
    const b = parseInt(m[2], 10)
    const y = m[3]
    if (!isLikelyDay(a) || !isLikelyMonth(b)) continue
    if (isLikelyMonth(a) && !isLikelyDay(b)) continue
    if (b > 12 && a <= 12) continue // treat as DD/MM only when unambiguous
    out.push({
      iso: normalizeNumericDate(a, b, y),
      index: m.index,
      ctx: text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40).toLowerCase(),
    })
  }
  return out
}

function collectWordDates(text) {
  const out = []
  const re = new RegExp(`(${[...monthNames, ...monthAbbr].join('|')})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\s*,?\\s*(\\d{4})`, 'gi')
  let m
  while ((m = re.exec(text))) {
    const monthIdx = [...monthNames, ...monthAbbr].indexOf(m[1].toLowerCase())
    if (monthIdx < 0) continue
    const realMonth = (monthIdx % 12) + 1
    const iso = `${m[3]}-${pad(realMonth)}-${pad(parseInt(m[2], 10))}`
    out.push({ iso, index: m.index, ctx: text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40).toLowerCase() })
  }
  return out
}

function scoreFilingCandidate(c) {
  let score = 0
  if (/\bfiled\b|\bfiling\b/.test(c.ctx)) score += 3
  if (/\bdated\b|\bdate\b|\bdate of\b/.test(c.ctx)) score += 3
  if (/\breceived\b|\bsubmitted\b|\bapplied\b|\bpresented\b/.test(c.ctx)) score += 2
  if (/\bcommission\b|\bombudsman\b|\bdepartment\b/.test(c.ctx)) score += 1
  return score
}

// Best-effort detection of the RTI filing date (often handwritten on the side)
function extractFilingDate(text) {
  const candidates = [...collectNumericDates(text), ...collectWordDates(text)]
  if (candidates.length === 0) return null

  const scored = candidates.map((c, i) => ({ ...c, score: scoreFilingCandidate(c) + (candidates.length === 1 ? 1 : 0) }))
  scored.sort((a, b) => b.score - a.score || a.index - b.index)
  const best = scored[0]
  if (best.score <= 0) return null
  return best.iso
}

function scoreDueDateCandidate(c) {
  let score = 0
  if (/\bby\b/.test(c.ctx)) score += 3
  if (/\bfailing\b/.test(c.ctx)) score += 3
  if (/\bprovide\b|\binformation\b|\bcomments?\b/.test(c.ctx)) score += 2
  if (/\bfurther action\b|\binitiated\b/.test(c.ctx)) score += 1
  if (/\bcommission\b/.test(c.ctx)) score += 1
  return score
}

// The strict "Commission by <date> failing" anchor is precise but brittle —
// a single OCR-misread character anywhere in "Commission" (easy on a folded,
// photographed scan) breaks it entirely. Fall back to scoring every date
// found near the same keywords, same approach as extractFilingDate.
function extractDueDate(text) {
  const candidates = [...collectNumericDates(text), ...collectWordDates(text)]
  if (candidates.length === 0) return null
  const scored = candidates.map((c) => ({ ...c, score: scoreDueDateCandidate(c) }))
  scored.sort((a, b) => b.score - a.score || a.index - b.index)
  const best = scored[0]
  if (best.score <= 0) return null
  return best.iso
}

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

// Which fields are actually meaningful per document type, and how to edit them.
// This drives both the "missing fields" check and the editable inputs shown
// in the confirm form — a field never appears as "could not extract" unless
// it's actually relevant to that document type.
export const EXTRACTABLE_FIELDS = {
  rti_request: [{ key: 'filed_date', label: 'RTI filing date', type: 'date' }],
  receipt: [],
  appeal_to_pic: [{ key: 'appeal_no', label: 'Appeal number', type: 'text' }],
  notice: [
    { key: 'appeal_no', label: 'Appeal number', type: 'text' },
    { key: 'due_date', label: 'Response due date', type: 'date' },
  ],
  opposing_comments: [],
  rejoinder: [],
  our_reply: [],
  order: [
    { key: 'appeal_no', label: 'Appeal number', type: 'text' },
    { key: 'is_disposed', label: 'Disposed status', type: 'select' },
  ],
  other: [],
}

export function parseNoticeOrder(rawText, fileName) {
  const result = {
    document_type: null,
    appeal_no: null,
    applicant: null,
    respondent: null,
    notice_date: null,
    due_date: null,
    filed_date: null,
    is_disposed: false,
    confidence: 'high',
    missing_fields: [],
  }

  const text = rawText || ''
  // Collapse all whitespace runs (including line wraps from OCR/PDF text
  // extraction) to single spaces before matching. A date or phrase that
  // happens to wrap across a visual line in the scan should never break
  // extraction just because a \n landed in the middle of it.
  const flatText = text.replace(/\s+/g, ' ')
  const lower = text.toLowerCase()
  const nameLower = fileName.toLowerCase()

  const noticeTypes = [
    { match: /first notice/i, type: 'notice' },
    { match: /second notice/i, type: 'notice' },
    { match: /final notice/i, type: 'notice' },
    { match: /^notice/i, type: 'notice' },
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

  const appealNoMatch = flatText.match(/Appeal\s*No\.?\s*(\d{3,5}-\d{2}\/\d{2,4})/i)
  if (appealNoMatch) result.appeal_no = appealNoMatch[1]

  const vsMatch = text.match(/(.+?)(?:\s*\n\s*)?(?:vs|versus|v\/s)(?:\s*\n\s*)?(.+?)(?:\n|$)/i)
  if (vsMatch) {
    result.applicant = vsMatch[1].trim()
    result.respondent = vsMatch[2].trim()
  }

  const dateLabelMatch = flatText.match(/Date\s*:\s*(.+)/i)
  if (dateLabelMatch) {
    result.notice_date = parseDate(dateLabelMatch[1])
  }
  if (!result.notice_date) {
    result.notice_date = parseDate(flatText)
  }

  const dueAnchor = flatText.match(/Commission\s+by\s+(.+?)(?:failing|\.|$)/i)
  if (dueAnchor) {
    result.due_date = parseDate(dueAnchor[1])
  }
  if (!result.due_date) {
    // Anchor phrase didn't match cleanly — likely an OCR misread somewhere
    // in "Commission by ... failing". Fall back to scoring every date found
    // against the same surrounding keywords instead of requiring an exact
    // contiguous phrase.
    result.due_date = extractDueDate(flatText)
  }

  if (lower.includes('appeal stands disposed')) {
    result.is_disposed = true
  }

  if (result.document_type === 'rti_request') {
    result.filed_date = extractFilingDate(text)
    // Filing dates are usually a handwritten diary stamp, often rotated —
    // always flag for verification even when something was detected, and
    // always leave the field editable (handled in EXTRACTABLE_FIELDS below).
    if (result.filed_date) {
      result.confidence = 'low'
    }
  }

  if (!result.document_type) result.missing_fields.push('document_type')

  // Only check fields that actually apply to this document type — e.g. an
  // RTI Request has no appeal number yet, and a Notice has no disposed status.
  const relevantFields = EXTRACTABLE_FIELDS[result.document_type] || []
  for (const field of relevantFields) {
    // is_disposed is a boolean the lawyer confirms either way, not something
    // that's "missing" just because it defaulted to false.
    if (field.type === 'select') continue
    if (!result[field.key]) result.missing_fields.push(field.key)
  }

  if (result.missing_fields.length > 0) {
    result.confidence = 'low'
  }

  return result
}

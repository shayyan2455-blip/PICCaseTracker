export const NOTICE_LAST = 0
export const MAX_NOTICE_NUMBER = 10

export function formatNoticeNumber(n) {
  if (n == null || n === '') return ''
  const num = Number(n)
  if (num === NOTICE_LAST) return 'Last'
  const lastTwo = num % 100
  if (lastTwo >= 11 && lastTwo <= 13) return `${num}th`
  const lastDigit = num % 10
  const suffix = lastDigit === 1 ? 'st' : lastDigit === 2 ? 'nd' : lastDigit === 3 ? 'rd' : 'th'
  return `${num}${suffix}`
}

export const NOTICE_NUMBER_OPTIONS = [
  ...Array.from({ length: MAX_NOTICE_NUMBER }, (_, i) => ({
    value: String(i + 1),
    label: formatNoticeNumber(i + 1),
  })),
  { value: String(NOTICE_LAST), label: 'Last Notice' },
]

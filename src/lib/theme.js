const STORAGE_KEY = 'pic_tracker_theme'

function getPreferredTheme() {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function getTheme() {
  if (typeof window === 'undefined') return 'dark'
  return localStorage.getItem(STORAGE_KEY) || getPreferredTheme()
}

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(STORAGE_KEY, theme)

  const link = document.querySelector('link[rel="icon"]')
  if (link) {
    link.href = theme === 'light' ? '/favicon-light.svg' : '/favicon.svg'
  }
}

export function toggleTheme() {
  const current = getTheme()
  const next = current === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}

export function initTheme() {
  setTheme(getTheme())
}

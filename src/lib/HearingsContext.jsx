import { createContext, useContext } from 'react'
import { useHearings } from '../hooks/useHearings'

const HearingsContext = createContext(null)

export function HearingsProvider({ children }) {
  const hearingsData = useHearings()
  return <HearingsContext.Provider value={hearingsData}>{children}</HearingsContext.Provider>
}

export function useHearingsContext() {
  const ctx = useContext(HearingsContext)
  if (!ctx) throw new Error('useHearingsContext must be used within HearingsProvider')
  return ctx
}

import { createContext, useContext } from 'react'
import { useCases } from '../hooks/useCases'

const CasesContext = createContext(null)

export function CasesProvider({ children }) {
  const casesData = useCases()
  return <CasesContext.Provider value={casesData}>{children}</CasesContext.Provider>
}

export function useCasesContext() {
  const ctx = useContext(CasesContext)
  if (!ctx) throw new Error('useCasesContext must be used within CasesProvider')
  return ctx
}

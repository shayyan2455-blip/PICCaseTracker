import { createContext, useContext } from 'react'
import { useDocuments } from '../hooks/useDocuments'

const DocumentsContext = createContext(null)

export function DocumentsProvider({ children }) {
  const docsData = useDocuments()
  return <DocumentsContext.Provider value={docsData}>{children}</DocumentsContext.Provider>
}

export function useDocumentsContext() {
  const ctx = useContext(DocumentsContext)
  if (!ctx) throw new Error('useDocumentsContext must be used within DocumentsProvider')
  return ctx
}

import { useState } from 'react'

// Seed data for development — replaced with Supabase queries later
const seedCases = [
  {
    id: '1',
    organization_id: 'org-1',
    case_number: '5837-07/26',
    title: 'Rana Abdul Qayyum vs NIRC',
    public_body: 'NIRC',
    applicant_name: 'Rana Abdul Qayyum',
    applicant_address: 'Lahore, Punjab',
    status: 'under_notice',
    created_by: 'user-1',
    created_at: '2026-07-15T10:00:00Z',
    closed_at: null,
  },
  {
    id: '2',
    organization_id: 'org-1',
    case_number: '5912-07/26',
    title: 'Ahmed Hassan vs Senate Secretariat',
    public_body: 'Senate Secretariat',
    applicant_name: 'Ahmed Hassan',
    applicant_address: 'Islamabad',
    status: 'appeal_filed',
    created_by: 'user-1',
    created_at: '2026-07-20T14:30:00Z',
    closed_at: null,
  },
  {
    id: '3',
    organization_id: 'org-1',
    case_number: '6015-07/26',
    title: 'Zainab Ali vs Ministry of Law',
    public_body: 'Ministry of Law',
    applicant_name: 'Zainab Ali',
    applicant_address: 'Karachi, Sindh',
    status: 'rti_filed',
    created_by: 'user-1',
    created_at: '2026-07-25T09:15:00Z',
    closed_at: null,
  },
  {
    id: '4',
    organization_id: 'org-1',
    case_number: '5720-06/26',
    title: 'Omar Farooq vs PEMRA',
    public_body: 'PEMRA',
    applicant_name: 'Omar Farooq',
    applicant_address: 'Rawalpindi',
    status: 'disposed',
    created_by: 'user-1',
    created_at: '2026-06-10T11:00:00Z',
    closed_at: '2026-07-28T16:00:00Z',
  },
]

export function useCases() {
  const [cases, setCases] = useState(seedCases)
  const [loading] = useState(false)
  const [error] = useState(null)

  function addCase(newCase) {
    setCases((prev) => [
      {
        ...newCase,
        id: crypto.randomUUID(),
        organization_id: 'org-1',
        created_by: 'user-1',
        created_at: new Date().toISOString(),
        closed_at: null,
      },
      ...prev,
    ])
  }

  function getCase(id) {
    return cases.find((c) => c.id === id) || null
  }

  return { cases, loading, error, addCase, getCase }
}

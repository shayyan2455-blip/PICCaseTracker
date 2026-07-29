import { supabase } from './supabaseClient'

let cachedOrgId = null

export async function getOrgId() {
  if (cachedOrgId) return cachedOrgId
  const { data, error } = await supabase.rpc('default_organization_id')
  if (error || !data) return null
  cachedOrgId = data
  return data
}

export function clearOrgCache() {
  cachedOrgId = null
}

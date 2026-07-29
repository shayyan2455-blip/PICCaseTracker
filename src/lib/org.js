import { supabase } from './supabaseClient'

const LS_KEY = 'pic_org_id'

export function setOrgId(orgId) {
  if (orgId) localStorage.setItem(LS_KEY, orgId)
}

export function clearOrgId() {
  localStorage.removeItem(LS_KEY)
}

export async function getOrgId() {
  const localId = localStorage.getItem(LS_KEY)
  if (localId) {
    console.log('[getOrgId] found in localStorage:', localId)
    return localId
  }

  console.log('[getOrgId] localStorage empty, checking auth...')
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) {
    console.error('[getOrgId] auth.getUser error:', userError.message)
    return null
  }
  if (!user) {
    console.error('[getOrgId] no authenticated user')
    return null
  }
  console.log('[getOrgId] user:', user.id)

  const metadataId = user.user_metadata?.default_organization_id
  if (metadataId) {
    console.log('[getOrgId] found in user_metadata:', metadataId)
    setOrgId(metadataId)
    return metadataId
  }

  console.log('[getOrgId] querying members table...')
  const { data, error } = await supabase
    .from('members')
    .select('organization_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[getOrgId] members query error:', error.message)
    return null
  }

  if (!data) {
    console.error('[getOrgId] no member row found for user', user.id)
    return null
  }

  console.log('[getOrgId] found in members table:', data.organization_id)
  setOrgId(data.organization_id)
  return data.organization_id
}

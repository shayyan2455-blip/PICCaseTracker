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
  if (localId) return localId

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const metadataId = user.user_metadata?.default_organization_id
    if (metadataId) {
      setOrgId(metadataId)
      return metadataId
    }

    const { data, error } = await supabase
      .from('members')
      .select('organization_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('getOrgId query error:', error.message)
      return null
    }

    if (data?.organization_id) {
      setOrgId(data.organization_id)
      return data.organization_id
    }

    return null
  } catch (e) {
    console.error('getOrgId error:', e)
    return null
  }
}

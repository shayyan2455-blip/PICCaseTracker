import { supabase } from './supabaseClient'

const LS_KEY = 'pic_org_id'

const isDev = import.meta.env.DEV

export function setOrgId(orgId) {
  if (orgId) localStorage.setItem(LS_KEY, orgId)
}

export function clearOrgId() {
  localStorage.removeItem(LS_KEY)
}

export async function getOrgId() {
  const localId = localStorage.getItem(LS_KEY)
  if (localId) {
    if (isDev) console.log('[getOrgId] found in localStorage:', localId)
    return localId
  }

  if (isDev) console.log('[getOrgId] localStorage empty, checking auth...')
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) {
    if (isDev) console.error('[getOrgId] auth.getUser error:', userError.message)
    return null
  }
  if (!user) {
    if (isDev) console.error('[getOrgId] no authenticated user')
    return null
  }
  if (isDev) console.log('[getOrgId] user:', user.id)

  const metadataId = user.user_metadata?.default_organization_id
  if (metadataId) {
    if (isDev) console.log('[getOrgId] found in user_metadata:', metadataId)
    setOrgId(metadataId)
    return metadataId
  }

  if (isDev) console.log('[getOrgId] querying members table...')
  const { data, error } = await supabase
    .from('members')
    .select('organization_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    if (isDev) console.error('[getOrgId] members query error:', error.message)
  }

  if (data) {
    if (isDev) console.log('[getOrgId] found in members table:', data.organization_id)
    setOrgId(data.organization_id)
    return data.organization_id
  }

  if (isDev) console.log('[getOrgId] trying RPC fallback...')
  const { data: rpcResult, error: rpcError } = await supabase.rpc('get_default_org_id', {
    for_user_id: user.id,
  })

  if (rpcError) {
    if (isDev) console.error('[getOrgId] RPC error:', rpcError.message)
    return null
  }

  if (rpcResult) {
    if (isDev) console.log('[getOrgId] found via RPC:', rpcResult)
    setOrgId(rpcResult)
    return rpcResult
  }

  if (isDev) console.error('[getOrgId] no org found via any method for user', user.id)
  return null
}

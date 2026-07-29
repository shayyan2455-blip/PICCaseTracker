import { supabase } from './supabaseClient'

export async function getOrgId() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

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

  return data?.organization_id || null
}

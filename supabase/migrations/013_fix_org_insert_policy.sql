-- ============================================================
-- Fix: org creation fails due to missing/broken RLS policy
-- ============================================================

-- 1. Ensure RLS is enabled
alter table organizations enable row level security;

-- 2. Drop and re-create the org insert policy
drop policy if exists "users can create orgs" on organizations;

create policy "users can create orgs"
  on organizations for insert
  with check (true);

-- 3. Ensure the security-definer RPC exists (bypasses RLS entirely)
create or replace function create_organization(org_name text, user_id uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  new_org_id uuid;
begin
  insert into organizations (name) values (org_name) returning id into new_org_id;
  insert into members (organization_id, user_id, role)
  values (new_org_id, user_id, 'owner')
  on conflict (organization_id, user_id) do nothing;
  return new_org_id;
end;
$$;

grant execute on function create_organization to anon;
grant execute on function create_organization to authenticated;

create or replace function get_default_org_id(for_user_id uuid)
returns uuid
language sql
security definer
stable
as $$
  select organization_id from members
  where user_id = for_user_id
  order by created_at asc
  limit 1;
$$;

grant execute on function get_default_org_id to anon;
grant execute on function get_default_org_id to authenticated;

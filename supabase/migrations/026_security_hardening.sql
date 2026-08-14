-- ============================================================
-- Security hardening: lock down RPCs + fix RLS policies
-- Run this migration in Supabase SQL Editor after applying 025
-- ============================================================

-- 1. get_org_members: require caller to be a member of the org
create or replace function get_org_members(org_id uuid)
returns table (
  user_id uuid,
  email text,
  role text,
  created_at timestamptz
)
language sql
security definer
stable
as $$
  -- Authorization: caller must be a member of the requested org
  select m.user_id, u.email, m.role, m.created_at
  from members m
  join auth.users u on u.id = m.user_id
  where m.organization_id = org_id
    and exists (
      select 1 from members
      where organization_id = org_id
        and user_id = auth.uid()
    )
  order by m.created_at asc;
$$;

revoke execute on function get_org_members from anon;
grant execute on function get_org_members to authenticated;

-- 2. create_organization: require owner_id = auth.uid()
drop function if exists create_organization(text, uuid);

create or replace function create_organization(org_name text, owner_id uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  new_org_id uuid;
begin
  -- Authorization: caller can only create orgs for themselves
  if owner_id != auth.uid() then
    raise exception 'Cannot create organization for another user';
  end if;

  insert into organizations (name) values (org_name) returning id into new_org_id;

  insert into members (organization_id, user_id, role)
  values (new_org_id, owner_id, 'owner')
  on conflict (organization_id, user_id) do nothing;

  return new_org_id;
end;
$$;

revoke execute on function create_organization(text, uuid) from anon;
grant execute on function create_organization(text, uuid) to authenticated;

-- 3. get_default_org_id: require for_user_id = auth.uid()
create or replace function get_default_org_id(for_user_id uuid)
returns uuid
language sql
security definer
stable
as $$
  select organization_id from members
  where user_id = for_user_id
    and user_id = auth.uid()
  order by created_at asc
  limit 1;
$$;

revoke execute on function get_default_org_id from anon;
grant execute on function get_default_org_id to authenticated;

-- 4. Invites: remove the world-readable policy
--    The "org members can read invites" policy (line 61-63 of 008) already
--    lets org members see their own invites. The "anyone can read invite
--    by token" policy with USING (true) lets ANY user see ALL invites.
drop policy if exists "anyone can read invite by token" on invites;

-- 5. reminder_log: remove the wide-open insert policy
--    The serverless function uses service_role key (bypasses RLS), so it
--    doesn't need a permissive insert policy. This prevents any client
--    from inserting fake reminder log entries.
drop policy if exists "edge function can insert reminder_log" on reminder_log;

-- 6. organizations: restrict insert to authenticated users only
drop policy if exists "users can create orgs" on organizations;
create policy "authenticated users can create orgs"
  on organizations for insert
  to authenticated
  with check (true);

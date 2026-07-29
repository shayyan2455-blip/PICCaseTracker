-- RPC to list org members with emails (bypasses RLS to reach auth.users)
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
  select m.user_id, u.email, m.role, m.created_at
  from members m
  join auth.users u on u.id = m.user_id
  where m.organization_id = org_id
  order by m.created_at asc;
$$;

grant execute on function get_org_members to anon;
grant execute on function get_org_members to authenticated;

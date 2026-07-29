-- security definer RPC to create an org and add the creator as owner
-- Bypasses all RLS ambiguity by running as the table owner
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

-- security definer RPC to get the user's first org from members
-- Bypasses RLS — the caller just needs to know any valid user_id
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

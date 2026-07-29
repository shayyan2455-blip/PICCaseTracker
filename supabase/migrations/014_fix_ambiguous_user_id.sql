-- Fix: ambiguous column reference in create_organization RPC
-- (parameter name "user_id" clashes with members.user_id column)
drop function if exists create_organization(text, uuid);

create or replace function create_organization(org_name text, owner_id uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  new_org_id uuid;
begin
  insert into organizations (name) values (org_name) returning id into new_org_id;

  insert into members (organization_id, user_id, role)
  values (new_org_id, owner_id, 'owner')
  on conflict (organization_id, user_id) do nothing;

  return new_org_id;
end;
$$;

grant execute on function create_organization(text, uuid) to anon;
grant execute on function create_organization(text, uuid) to authenticated;

-- Fix: ensure the organizations insert policy exists and works
drop policy if exists "users can create orgs" on organizations;
create policy "users can create orgs"
  on organizations for insert
  with check (true);

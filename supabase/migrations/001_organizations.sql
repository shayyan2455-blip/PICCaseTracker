-- Organizations (tenants)
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Helper function for RLS
create or replace function is_member_of(org_id uuid)
returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from members
    where organization_id = org_id and user_id = auth.uid()
  );
$$;

-- Helper function to get current user's default organization
create or replace function default_organization_id()
returns uuid
language sql security definer stable as $$
  select organization_id from members
  where user_id = auth.uid()
  order by created_at asc
  limit 1;
$$;

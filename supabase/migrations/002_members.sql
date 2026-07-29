-- Membership (a user belongs to one or more orgs, with a role)
create table members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','lawyer','clerk')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index members_user_idx on members(user_id);
create index members_org_idx on members(organization_id);

-- Helper function for RLS (defined here after members table exists)
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

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

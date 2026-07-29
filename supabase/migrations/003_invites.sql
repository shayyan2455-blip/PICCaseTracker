-- Invites
create table invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('lawyer','clerk')),
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

create index invites_org_idx on invites(organization_id);
create index invites_token_idx on invites(token);

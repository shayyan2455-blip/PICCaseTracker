-- Hearings / Deadlines (derived from Notice documents)
create table hearings (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  document_id uuid not null references documents(id) on delete cascade,
  due_date date not null,
  outcome text not null default 'pending' check (outcome in ('pending','resolved','adjourned')),
  next_date date,
  notes text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index hearings_org_due_idx on hearings(organization_id, due_date);
create index hearings_pending_idx on hearings(organization_id, outcome) where outcome = 'pending';

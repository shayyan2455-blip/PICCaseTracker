-- Cases
create table cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  case_number text,
  title text not null,
  public_body text not null,
  applicant_name text not null,
  applicant_address text,
  status text not null default 'rti_filed'
    check (status in ('draft','rti_filed','appeal_filed','under_notice','disposed','closed')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create index cases_org_idx on cases(organization_id);
create index cases_status_idx on cases(organization_id, status);

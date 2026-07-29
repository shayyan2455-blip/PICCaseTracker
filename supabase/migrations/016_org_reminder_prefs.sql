-- Per-org reminder preferences
create table org_reminder_prefs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade unique,
  days_before int not null default 2,
  send_at_time time not null default '07:00',
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table org_reminder_prefs enable row level security;

create policy "org members can read their reminder prefs"
  on org_reminder_prefs for select
  using (is_member_of(organization_id));

create policy "org members can insert reminder prefs"
  on org_reminder_prefs for insert
  with check (is_member_of(organization_id));

create policy "org members can update reminder prefs"
  on org_reminder_prefs for update
  using (is_member_of(organization_id));

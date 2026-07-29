-- Reminder log (dedupe so we don't send the same alert twice)
create table reminder_log (
  id uuid primary key default gen_random_uuid(),
  hearing_id uuid not null references hearings(id) on delete cascade,
  sent_at timestamptz not null default now(),
  channel text not null check (channel in ('email','dashboard'))
);

create unique index reminder_log_dedupe on reminder_log(hearing_id, channel, (sent_at::date));

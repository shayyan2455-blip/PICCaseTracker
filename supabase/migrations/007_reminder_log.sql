-- Reminder log (dedupe so we don't send the same alert twice)
create table reminder_log (
  id uuid primary key default gen_random_uuid(),
  hearing_id uuid not null references hearings(id) on delete cascade,
  sent_at timestamptz not null default now(),
  sent_date date not null default current_date,
  channel text not null check (channel in ('email','dashboard'))
);

create unique index reminder_log_dedupe on reminder_log(hearing_id, channel, sent_date);
create index reminder_log_hearing_idx on reminder_log(hearing_id);

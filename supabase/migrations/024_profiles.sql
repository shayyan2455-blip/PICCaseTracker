-- Profiles table: a read-side mirror of auth.users containing only the fields
-- this app needs (id, email). Kept in sync automatically by a trigger on
-- auth.users and backfilled below. This lets the serverless functions look up
-- users by email/id with a direct indexed query instead of paging through the
-- auth admin API (listUsers() paginates at ~50/page, so account lookups
-- silently miss once the user base grows past one page).

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

-- Case-insensitive email lookup + uniqueness (the primary key already
-- provides the index on id).
create unique index profiles_email_lower_idx on profiles (lower(email));

-- Keep profiles in sync with auth.users (new signups + email changes).
-- Runs as the function owner (security definer), bypassing RLS on profiles.
create or replace function sync_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

create trigger profiles_after_insert
  after insert on auth.users
  for each row execute function sync_profile();

create trigger profiles_after_update_email
  after update of email on auth.users
  for each row execute function sync_profile();

-- One-time backfill so accounts created before this migration are present.
insert into profiles (id, email)
select id, email from auth.users
on conflict (id) do update
  set email = excluded.email;

-- RLS: members can read profiles of users they share an org with (mirrors the
-- members-table access pattern). Writes are handled exclusively by the
-- security-definer trigger above — no insert/update policies for end users.
alter table profiles enable row level security;

create policy "members can read profiles of users in their orgs"
  on profiles for select
  using (
    exists (
      select 1
      from members mine
      join members other on other.organization_id = mine.organization_id
      where mine.user_id = auth.uid()
        and other.user_id = profiles.id
    )
  );

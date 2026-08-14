-- ============================================================
-- Security hardening batch 2: password_resets, invite role,
-- blocked flags, and remaining RPC lockdowns
-- ============================================================

-- 1. password_resets: enable RLS (only service_role needs access)
alter table password_resets enable row level security;
-- No permissive policies = authenticated/anon role gets zero access.
-- The edge function uses service_role which bypasses RLS.

-- 2. Invite role escalation fix: add role check to the invited-users
--    insert policy so a clerk invite can't self-promote to owner.
drop policy if exists "invited users can be added as members" on members;

create policy "invited users can be added as members"
  on members for insert
  with check (
    exists (
      select 1 from invites
      where invites.organization_id = members.organization_id
        and invites.email = (select email from auth.users where id = auth.uid())
        and invites.role = members.role
        and invites.accepted_at is null
        and invites.expires_at > now()
    )
  );

-- 3. blocked / must_change_password: move out of user_metadata into a
--    server-controlled table that only service_role can write to.
create table if not exists user_flags (
  user_id uuid primary key references auth.users(id) on delete cascade,
  blocked boolean not null default false,
  must_change_password boolean not null default false,
  created_at timestamptz not null default now()
);

alter table user_flags enable row level security;
-- No permissive policies = only service_role can read/write.

-- RPC for the app to check its own flags (security definer bypasses RLS)
create or replace function get_my_flags()
returns table (blocked boolean, must_change_password boolean)
language sql
security definer
stable
as $$
  select u.blocked, u.must_change_password
  from user_flags u
  where u.user_id = auth.uid();
$$;

revoke execute on function get_my_flags() from anon;
grant execute on function get_my_flags() to authenticated;

-- RPC to clear must_change_password after user changes their password
-- (only clears for the authenticated user's own record)
create or replace function clear_must_change_password()
returns void
language plpgsql
security definer
as $$
begin
  update user_flags
  set must_change_password = false
  where user_id = auth.uid();
end;
$$;

revoke execute on function clear_must_change_password() from anon;
grant execute on function clear_must_change_password() to authenticated;

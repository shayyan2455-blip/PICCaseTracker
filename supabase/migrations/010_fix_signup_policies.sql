-- Fix: allow first member (owner) to be added during signup
-- The existing policy "org owners can add members" requires the user
-- to already be an owner — impossible when creating a brand-new org.
-- This policy lets a user add themselves as owner to an org with no members yet.

create policy "users can add themselves as owner to a new org"
  on members for insert
  with check (
    user_id = auth.uid()
    and role = 'owner'
    and not exists (
      select 1 from members m2
      where m2.organization_id = members.organization_id
    )
  );

-- Also allow a user who was invited (via invites table) to be added
create policy "invited users can be added as members"
  on members for insert
  with check (
    exists (
      select 1 from invites
      where invites.organization_id = members.organization_id
        and invites.email = (select email from auth.users where id = auth.uid())
        and invites.accepted_at is null
        and invites.expires_at > now()
    )
  );

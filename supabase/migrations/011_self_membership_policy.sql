-- Allow users to read their own membership rows (needed to find their org)
-- Without this, the "members can read members of their orgs" policy creates
-- a chicken-and-egg problem: you need to be a member to see members.
create policy "users can read their own memberships"
  on members for select
  using (user_id = auth.uid());

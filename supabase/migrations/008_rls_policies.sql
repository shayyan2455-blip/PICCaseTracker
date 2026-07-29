-- Enable RLS on all tables
alter table organizations enable row level security;
alter table members enable row level security;
alter table invites enable row level security;
alter table cases enable row level security;
alter table documents enable row level security;
alter table hearings enable row level security;
alter table reminder_log enable row level security;

-- Organizations
create policy "org members can read orgs they belong to"
  on organizations for select
  using (is_member_of(id));

create policy "users can create orgs"
  on organizations for insert
  with check (true);

create policy "org owners can update their org"
  on organizations for update
  using (
    exists (select 1 from members
      where organization_id = id
        and user_id = auth.uid()
        and role = 'owner')
  );

-- Members
create policy "members can read members of their orgs"
  on members for select
  using (is_member_of(organization_id));

create policy "org owners can add members"
  on members for insert
  with check (
    exists (select 1 from members
      where organization_id = members.organization_id
        and user_id = auth.uid()
        and role = 'owner')
  );

create policy "org owners can update members"
  on members for update
  using (
    exists (select 1 from members
      where organization_id = members.organization_id
        and user_id = auth.uid()
        and role = 'owner')
  );

create policy "org owners can delete members"
  on members for delete
  using (
    exists (select 1 from members
      where organization_id = members.organization_id
        and user_id = auth.uid()
        and role = 'owner')
  );

-- Invites
create policy "org members can read invites"
  on invites for select
  using (is_member_of(organization_id));

create policy "org owners can create invites"
  on invites for insert
  with check (
    exists (select 1 from members
      where organization_id = invites.organization_id
        and user_id = auth.uid()
        and role = 'owner')
  );

create policy "anyone can read invite by token"
  on invites for select
  using (true);

-- Cases
create policy "org members can read cases"
  on cases for select
  using (is_member_of(organization_id));

create policy "lawyers/owners can create cases"
  on cases for insert
  with check (
    is_member_of(organization_id)
    and
    exists (select 1 from members
      where organization_id = cases.organization_id
        and user_id = auth.uid()
        and role in ('owner','lawyer'))
  );

create policy "lawyers/owners can update cases"
  on cases for update
  using (is_member_of(organization_id))
  with check (
    exists (select 1 from members
      where organization_id = cases.organization_id
        and user_id = auth.uid()
        and role in ('owner','lawyer'))
  );

create policy "only lawyer+ can delete cases"
  on cases for delete
  using (
    exists (select 1 from members
      where organization_id = cases.organization_id
        and user_id = auth.uid()
        and role in ('owner','lawyer'))
  );

-- Documents
create policy "org members can read documents"
  on documents for select
  using (is_member_of(organization_id));

create policy "lawyers/owners can upload documents"
  on documents for insert
  with check (
    is_member_of(organization_id)
    and
    exists (select 1 from members
      where organization_id = documents.organization_id
        and user_id = auth.uid()
        and role in ('owner','lawyer'))
  );

create policy "clerks can upload documents"
  on documents for insert
  with check (
    is_member_of(organization_id)
    and
    exists (select 1 from members
      where organization_id = documents.organization_id
        and user_id = auth.uid()
        and role = 'clerk')
  );

create policy "lawyers/owners can update documents"
  on documents for update
  using (is_member_of(organization_id));

create policy "only lawyer+ can delete documents"
  on documents for delete
  using (
    exists (select 1 from members
      where organization_id = documents.organization_id
        and user_id = auth.uid()
        and role in ('owner','lawyer'))
  );

-- Hearings
create policy "org members can read hearings"
  on hearings for select
  using (is_member_of(organization_id));

create policy "lawyers/owners can create hearings"
  on hearings for insert
  with check (
    is_member_of(organization_id)
    and
    exists (select 1 from members
      where organization_id = hearings.organization_id
        and user_id = auth.uid()
        and role in ('owner','lawyer'))
  );

create policy "lawyers/owners can update hearings"
  on hearings for update
  using (is_member_of(organization_id));

create policy "only lawyer+ can delete hearings"
  on hearings for delete
  using (
    exists (select 1 from members
      where organization_id = hearings.organization_id
        and user_id = auth.uid()
        and role in ('owner','lawyer'))
  );

-- Reminder Log
create policy "org members can read reminder_log"
  on reminder_log for select
  using (
    exists (select 1 from hearings
      where hearings.id = reminder_log.hearing_id
        and is_member_of(hearings.organization_id))
  );

create policy "edge function can insert reminder_log"
  on reminder_log for insert
  with check (true);

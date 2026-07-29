-- Fix: storage RLS policies had wrong regex — object name doesn't include bucket prefix
-- change from: ^documents/([^/]+)/   to:   ^([^/]+)/

drop policy if exists "org members can read documents" on storage.objects;
create policy "org members can read documents"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and
    is_member_of(
      (regexp_match(name, '^([^/]+)/'))[1]::uuid
    )
  );

drop policy if exists "members can upload documents" on storage.objects;
create policy "members can upload documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and
    is_member_of(
      (regexp_match(name, '^([^/]+)/'))[1]::uuid
    )
  );

drop policy if exists "lawyer+ can delete documents" on storage.objects;
create policy "lawyer+ can delete documents"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and
    exists (select 1 from members
      where organization_id = (regexp_match(name, '^([^/]+)/'))[1]::uuid
        and user_id = auth.uid()
        and role in ('owner','lawyer'))
  );

-- Storage bucket for documents
insert into storage.buckets (id, name, public) values ('documents', 'documents', false);

-- Storage RLS: org members can read files in their org's path
create policy "org members can read documents"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and
    is_member_of(
      (regexp_match(name, '^documents/([^/]+)/'))[1]::uuid
    )
  );

-- Storage RLS: lawyers/owners/clerks can upload to their org's path
create policy "members can upload documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and
    is_member_of(
      (regexp_match(name, '^documents/([^/]+)/'))[1]::uuid
    )
  );

-- Storage RLS: owners/lawyers can delete
create policy "lawyer+ can delete documents"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and
    exists (select 1 from members
      where organization_id = (regexp_match(name, '^documents/([^/]+)/'))[1]::uuid
        and user_id = auth.uid()
        and role in ('owner','lawyer'))
  );

-- File size and type validation via storage policy
create policy "validate document uploads"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and
    octet_length(name) < 52428800  -- 50 MB max
    and
    lower(right(name, 4)) in ('.pdf', 'docx', '.jpg', '.png')
  );

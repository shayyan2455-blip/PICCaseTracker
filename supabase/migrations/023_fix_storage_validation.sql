-- Replace the broken "validate document uploads" storage policy.
--
-- Why the old policy was non-functional:
--   * `octet_length(name)` measures the object's PATH STRING
--     (e.g. "orgId/uuid-filename.pdf"), not the file's byte content — the
--     "50MB limit" never blocked anything.
--   * `lower(right(name, 4)) in ('.pdf','docx','.jpg','.png')` is a spoofable
--     string match on the filename (any content renamed to *.pdf passes) and
--     also silently rejected legitimate .jpeg uploads.
--   * It was a PERMISSIVE policy. Permissive policies are OR'd together, so
--     the unrestricted "members can upload documents" policy alone satisfied
--     the insert — the validation policy was never enforced at all.
--
-- The replacement:
--   1. Reads the REAL file size from the object metadata the storage service
--      populates on every upload: storage.objects.metadata->>'size' (bytes).
--      Key confirmed against the current Supabase Storage API reference,
--      which returns metadata as { eTag, size, mimetype, cacheControl, ... }.
--   2. Enforces a MIME-type allowlist via metadata->>'mimetype'. The storage
--      service records this from the upload's Content-Type (for the app's
--      browser uploads, the File object's type), so renaming a .txt to .pdf
--      still uploads as text/plain and is rejected here.
--   3. Keeps a filename-extension check as an additional layer.
--   4. Is `as restrictive`, so it ANDs with the permissive membership policy
--      instead of being OR'd (bypassed) by it.
drop policy if exists "validate document uploads" on storage.objects;

create policy "validate document uploads"
  on storage.objects
  as restrictive
  for insert
  with check (
    bucket_id = 'documents'
    and (metadata->>'size')::bigint < 52428800  -- 50 MB max, real bytes
    and metadata->>'mimetype' in (
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
    and lower(name) ~ '\.(pdf|jpg|jpeg|png|docx)$'
  );

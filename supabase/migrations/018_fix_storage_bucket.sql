-- Idempotent storage bucket creation (no-op if already exists)
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'documents') then
    insert into storage.buckets (id, name, public) values ('documents', 'documents', false);
  end if;
end;
$$;

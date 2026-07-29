-- Documents
create table documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  document_type text not null check (document_type in (
    'rti_request','appeal_to_pic','first_notice','second_notice','final_notice',
    'opposing_comments','rejoinder','our_reply','order','other'
  )),
  file_path text not null,
  file_name text not null,
  uploaded_by uuid not null references auth.users(id),
  uploaded_at timestamptz not null default now(),
  extracted_date date,
  extraction_source text check (extraction_source in ('ocr','digital','manual')),
  extraction_confidence text check (extraction_confidence in ('high','low')),
  raw_text text
);

create index documents_case_idx on documents(case_id);
create index documents_org_idx on documents(organization_id);

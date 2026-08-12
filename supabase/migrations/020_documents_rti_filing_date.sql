-- Add rti_filing_date column and expand document_type check to include 'receipt'
alter table documents add column if not exists rti_filing_date date;

alter table documents drop constraint if exists documents_document_type_check;
alter table documents add constraint documents_document_type_check check (document_type in (
  'rti_request','receipt','appeal_to_pic','first_notice','second_notice','final_notice',
  'opposing_comments','rejoinder','our_reply','order','other'
));
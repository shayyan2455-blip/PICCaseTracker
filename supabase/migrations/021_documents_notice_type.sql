-- Consolidate notice document types (first_notice/second_notice/final_notice)
-- into a single 'notice' type that supports multiple uploads per case.
update documents set document_type = 'notice'
  where document_type in ('first_notice','second_notice','final_notice');

alter table documents drop constraint if exists documents_document_type_check;
alter table documents add constraint documents_document_type_check check (document_type in (
  'rti_request','receipt','appeal_to_pic','notice',
  'opposing_comments','rejoinder','our_reply','order','other'
));

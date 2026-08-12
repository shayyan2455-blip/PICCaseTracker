-- Add notice_number column so a single 'notice' document type can be
-- numbered (1st, 2nd, ... , Last) and labelled accordingly in the UI.
alter table documents add column if not exists notice_number integer;

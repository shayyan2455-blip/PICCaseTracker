create table if not exists password_resets (
  id uuid not null default gen_random_uuid() primary key,
  email text not null,
  otp text not null,
  expires_at timestamptz not null,
  used bool not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_password_resets_email on password_resets (email);
create index if not exists idx_password_resets_email_otp on password_resets (email, otp);

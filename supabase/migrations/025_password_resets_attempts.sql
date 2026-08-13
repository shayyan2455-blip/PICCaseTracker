-- Add failed-attempt counter to password_resets so verify/reset can lock a
-- row out after 5 wrong guesses, even while the OTP is still unexpired.
alter table password_resets add column if not exists attempts integer not null default 0;

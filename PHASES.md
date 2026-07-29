# PIC Case Tracker — Remaining Phases

## Phase 5 — File Uploads & Real Storage

**Goal:** Actually upload PDF/DOCX files to Supabase Storage, not just save metadata.

- [ ] 5a. Upload the selected file to Supabase Storage bucket (`org_docs`) when user clicks "Upload"
- [ ] 5b. Save the public/authenticated URL into the `documents.file_url` column
- [ ] 5c. Show a download/view link on DocumentCard and DocumentTimeline
- [ ] 5d. Delete document UI (with confirmation) — removes both storage file and DB row

**Files:** `UploadModal.jsx`, `useDocuments.js`, `DocumentCard.jsx`, `DocumentTimeline.jsx`
**DB:** `documents` table already has `file_url` column (migration 005)

---

## Phase 6 — OCR Text Extraction

**Goal:** Extract text from uploaded PDFs so the extraction confirm modal is pre-filled.

- [ ] 6a. Install `tesseract.js` (npm)
- [ ] 6b. Run OCR on the uploaded file (client-side, in UploadModal) to get `rawText`
- [ ] 6c. Pass `rawText` to the existing regex parser (`documentExtractor`) to pre-fill doc_type, appeal_no, applicant_name, extracted_date, is_disposed
- [ ] 6d. Show extracted values in ExtractionConfirmForm (already wired up — just needs real input)
- [ ] 6e. Loading/error UI for OCR processing

**Files:** `UploadModal.jsx`, `package.json`, `documentExtractor.js`
**Dependency:** Phase 5 (need the actual file to OCR)

---

## Phase 7 — Email Reminders

**Goal:** Send daily reminder emails to lawyers about upcoming deadlines.

- [ ] 7a. Fix `api/send-reminder.js` ESM/CJS bug (change `require` to `import` or use dynamic import)
- [ ] 7b. Create a Vercel Cron Job (`vercel.json` cron) that hits the API daily
- [ ] 7c. The API should: query upcoming hearings for all orgs with enabled reminders, pick reminder preferences from `organization_settings` (needs a new DB table or column), send Gmail via nodemailer
- [ ] 7d. Log sent reminders in `reminder_log` table
- [ ] 7e. "Send Test Email" button in Settings should actually work

**Files:** `api/send-reminder.js`, `vercel.json`, `Settings.jsx`
**New DB:** Need a table/migration for per-org reminder preferences (cadence, time_of_day, enabled)

---

## Phase 8 — Members, Invites & Hearing Resolution

**Goal:** Multi-lawyer/collaborator workflow.

- [ ] 8a. Members list UI in Settings — show all members of the org with their roles
- [ ] 8b. Invite modal — create an invite (token-based, uses existing `invites` table), share link
- [ ] 8c. Accept invite flow — when a logged-out user hits an invite URL, they sign up and get auto-added to the org
- [ ] 8d. Hearing resolution buttons on CaseDetail — Mark as "resolved" / "adjourned" with date
- [ ] 8e. Edit case — inline edit or separate page for updating case fields
- [ ] 8f. Delete case — with confirmation modal

**Files:** `Settings.jsx`, new `InviteModal.jsx`, `AcceptInvite.jsx`, `CaseDetail.jsx`, `useCases.js`
**DB:** Tables already exist (`members`, `invites`, `hearings`)

---

## Phase 9 — Polish & Production Readiness

**Goal:** Ship-quality cleanup.

- [ ] 9a. Remove debug logging from `Dashboard.jsx` and `SignupModal.jsx`
- [ ] 9b. Global error boundary (catch React crashes gracefully)
- [ ] 9c. 404 catch-all route
- [ ] 9d. Readme with setup instructions, env vars, architecture overview
- [ ] 9e. Loading skeletons for Dashboard stat cards and case lists
- [ ] 9f. Confirm `VITE_SUPABASE_ANON_KEY` fallback is removed from `supabaseClient.js`
- [ ] 9g. Fix light theme main-color inconsistency (`#4caf50` vs `#ea580c`)

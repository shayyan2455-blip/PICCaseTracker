# PIC Case Tracker

Multi-lawyer web application for tracking RTI (Right to Information) appeals before the Pakistan Information Commission (PIC). Manage cases, upload documents with OCR, track deadlines, send email reminders, and collaborate with your firm.

## Features

- **Case Management** — Create, edit, delete, and search RTI/appeal cases with status tracking (draft → rti_filed → appeal_filed → under_notice → disposed → closed)
- **Submit Appeal Bundle** — Upload RTI Request + Receipt + Appeal to PIC in one step via the "Submit Appeal" modal
- **Document Upload Rules** — Per-case upload limits: single-entry types (RTI, Receipt, Appeal, Notices, Order) can only be uploaded once; multi-entry types (Opposing Comments, Rejoinder, Our Reply) support unlimited uploads distinguished by date
- **OCR Text Extraction** — Client-side Tesseract.js OCR on JPG/PNG images with automatic regex parsing for notice/order fields (appeal number, applicant, respondent, dates, disposed status)
- **Auto-close on Order** — Uploading an Order document automatically sets the case status to `closed` with a timestamp
- **RTI 10-Day Appeal Reminder** — When uploading an RTI with a filing date, the system auto-creates a hearing deadline 10 days later as a reminder to file the appeal
- **Deadline Dashboard** — See due-today, this-week, and overdue hearings at a glance with stat cards and enriched lists
- **Hearing Tracking** — Auto-creates hearings from document extracted dates; mark as resolved/adjourned with notes
- **Reminders Page** — Dedicated page showing upcoming hearing deadlines (Due Today / This Week / Later) plus sent reminder email history
- **Email Reminders** — Daily email summaries of upcoming deadlines via Gmail SMTP (Vercel cron job), configurable per-org (days-before, send-at time)
- **Multi-lawyer Organization** — Create or join a law firm with role-based access (owner/lawyer/clerk)
- **Invite System** — Token-based invite links to add members to your organization
- **Settings** — Manage reminder preferences, test email delivery, view org members, send invites
- **Dark/Light Theme** — Persistent theme toggle with favicon swap (orange accent in dark, green accent in light)
- **Error Boundary & 404** — Global error catcher and catch-all route

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, React Router 7, Tailwind CSS 3 |
| **Forms** | React Hook Form + Zod |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Row-Level Security) |
| **OCR** | Tesseract.js v7 (client-side, browser-based) |
| **Emails** | Nodemailer + Gmail SMTP via Vercel serverless function |
| **Testing** | Vitest + Testing Library |
| **Deployment** | Vercel (SPA + serverless functions) |
| **Font** | Inter (Google Fonts) |

## Document Types & Upload Rules

Per the client workflow requirements, each document type has specific upload limits:

| Document Type | Max Per Case | Notes |
|---|---|---|
| RTI Request | 1 | Shows "RTI Filing Date" field → creates 10-day appeal reminder |
| Receipt | 1 | Proof of filing / payment challan |
| Appeal to PIC | 1 | Part of Submit Appeal bundle |
| First Notice | 1 | From PIC after appeal is filed |
| Second Notice | 1 | Follow-up notice |
| Final Notice | 1 | Final notice before order |
| Opposing Comments | ∞ (by date) | Public body's comments; date picker to distinguish entries |
| Rejoinder | ∞ (by date) | Our reply to opposing comments; date picker |
| Our Reply | ∞ (by date) | Additional replies; date picker |
| Order | 1 | Last document — auto-closes the case |
| Other | ∞ | Catch-all for uncategorized documents |

Single-upload types are filtered out of the dropdown once uploaded. Multi-entry types show a date input to distinguish multiple uploads.

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project (free tier works)
- Gmail account with [App Password](https://support.google.com/accounts/answer/185833) enabled

### Setup

```bash
git clone <repo-url>
cd pic-case-tracker
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description | Required For |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL (Settings → API) | App |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | App |
| `GMAIL_SMTP_USER` | Gmail address for sending reminders | Email reminders |
| `GMAIL_SMTP_PASS` | Gmail App Password (16 characters) | Email reminders |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (Settings → API) | Server-side API (reminders) |

### Database

> **⚠️ Important:** Run all migrations in `supabase/migrations/` in numerical order (001–018) via the Supabase SQL Editor. Migration 018 is idempotent — it won't error if the storage bucket already exists.

Additionally, ensure the `documents` storage bucket exists in Supabase Dashboard → Storage (migration 009 attempts to create it).

### Development

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

### Testing

```bash
npm run test
```

Uses Vitest with jsdom environment. Test files are in `src/test/`.

### Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Add all environment variables in Vercel project settings
4. Deploy

The `vercel.json` config handles SPA rewrites and includes a cron schedule for daily reminder emails (requires Pro plan for crons).

## Architecture

```
src/
├── App.jsx                       — Root component: auth, routing, theme init
├── main.jsx                      — Entry point
├── index.css                     — Tailwind + component classes + theme import
├── styles/
│   └── theme.css                 — CSS custom properties for dark/light themes
├── lib/
│   ├── supabaseClient.js         — Supabase client singleton
│   ├── theme.js                  — Theme management (localStorage + data-theme attribute)
│   ├── org.js                    — Org ID resolution (localStorage → metadata → members → RPC)
│   ├── CasesContext.jsx          — React context for cases data
│   ├── DocumentsContext.jsx      — React context for documents data
│   └── HearingsContext.jsx       — React context for hearings data
├── hooks/
│   ├── useCases.js               — CRUD operations on cases table
│   ├── useDocuments.js           — CRUD + storage operations on documents
│   └── useHearings.js            — CRUD + pending counts for hearings
├── pages/
│   ├── LandingPage.jsx           — Marketing landing page (hero, features, how it works)
│   ├── NotFound.jsx              — 404 page
│   ├── AcceptInvite.jsx          — Token-based invite acceptance
│   └── app/
│       ├── Dashboard.jsx         — Deadline overview with stat cards
│       ├── CaseList.jsx          — Searchable, filterable case table
│       ├── CaseDetail.jsx        — Case detail with edit, delete, documents, hearings
│       ├── NewCase.jsx           — Create case form
│       ├── Reminders.jsx         — Upcoming deadlines + sent reminder history
│       └── Settings.jsx          — Org settings, members, invites, reminder prefs
├── components/
│   ├── ErrorBoundary.jsx         — Global error boundary
│   ├── auth/
│   │   ├── LoginModal.jsx        — Email/password login
│   │   └── SignupModal.jsx       — Signup with auto org creation
│   ├── cases/
│   │   ├── CaseCard.jsx          — Mobile case card
│   │   ├── CaseStatusBadge.jsx   — Colored status pill
│   │   ├── DocumentCard.jsx      — Single document with open/delete
│   │   └── DocumentTimeline.jsx  — Chronological document list
│   ├── dashboard/
│   │   ├── DueTodayList.jsx      — Due-today hearing cards
│   │   ├── OverdueList.jsx       — Overdue hearing cards
│   │   └── UpcomingWeekList.jsx  — This-week hearing cards
│   ├── landing/                  — Landing page section components
│   ├── layout/
│   │   ├── AppShell.jsx          — Sidebar + topbar + mobile nav shell
│   │   ├── TopBar.jsx            — Authenticated app top bar
│   │   └── Navbar.jsx            — Landing page navigation
│   ├── ui/
│   │   ├── Skeleton.jsx          — Loading skeleton components
│   │   └── ThemeToggle.jsx       — Dark/light toggle button
│   └── upload/
│       ├── UploadModal.jsx       — Single document upload with OCR + extraction
│       ├── SubmitAppealModal.jsx — Three-file bundle (RTI + Receipt + Appeal)
│       └── ExtractionConfirmForm.jsx — Pre-filled extraction confirmation
├── extraction/
│   └── parseNoticeOrder.js       — Regex parser for notice/order fields
└── test/
    ├── setup.js                  — Vitest setup (jsdom + testing-library)
    └── parseNoticeOrder.test.js  — Parser unit tests (9 tests)

api/
└── send-reminder.js              — Vercel serverless function (cron + test email)

supabase/
└── migrations/
    ├── 001_organizations.sql      — organizations table
    ├── 002_members.sql            — members table + is_member_of() helper
    ├── 003_invites.sql            — invites table (token-based, 7-day expiry)
    ├── 004_cases.sql              — cases table (status enum, indexes)
    ├── 005_documents.sql          — documents table (types, file_path, extracted_date)
    ├── 006_hearings.sql           — hearings table (due_date, outcome, indexes)
    ├── 007_reminder_log.sql       — reminder_log table (dedup index)
    ├── 008_rls_policies.sql       — Row-Level Security policies for all tables
    ├── 009_storage.sql            — documents storage bucket + RLS
    ├── 010_fix_signup_policy.sql  — Fix signup RLS (self-add as owner)
    ├── 011_self_membership_policy.sql — Allow reading own membership
    ├── 012_create_org_rpc.sql     — create_organization RPC (security definer)
    ├── 013_fix_org_insert_policy.sql — Re-create org insert policies
    ├── 014_fix_ambiguous_user_id.sql — Fix ambiguous column in RPC
    ├── 015_fix_storage_rls_regex.sql — Fix storage path regex patterns
    ├── 016_org_reminder_prefs.sql — org_reminder_prefs table (days_before, send_at_time)
    ├── 017_get_org_members.sql    — get_org_members RPC (with email resolution)
    └── 018_fix_storage_bucket.sql — Idempotent storage bucket creation
```

## Database Schema

### Tables

| Table | Purpose | Key Columns |
|---|---|---|
| `organizations` | Multi-tenant law firms | id, name, created_at |
| `members` | User-org membership with roles | user_id, organization_id, role (owner/lawyer/clerk) |
| `invites` | Token-based member invites | email, organization_id, role, token, expires_at |
| `cases` | RTI/appeal cases | title, case_number, applicant_name, public_body, status, closed_at |
| `documents` | Uploaded document metadata | document_type, file_path, extracted_date, raw_text |
| `hearings` | Deadline events from documents | due_date, outcome (pending/resolved/adjourned), notes |
| `reminder_log` | Deduplicated reminder audit | hearing_id, channel (email/dashboard), sent_date |
| `org_reminder_prefs` | Per-org reminder configuration | days_before, send_at_time, enabled |

### Row-Level Security

All tables have RLS enabled. Key policies:

- **Members**: Can read orgs they belong to; owners can manage members
- **Cases**: Org members can CRUD cases within their org
- **Documents**: Org members can CRUD documents; storage files are scoped to `{orgId}/` prefix
- **Hearings**: Org members can CRUD hearings
- **Invites**: Anyone can read by token; org owners can create
- **RPC functions**: `create_organization` and `get_default_org_id` use `security definer` to bypass RLS during signup

## Reminder System

### How It Works

1. **Hearing Creation**: Hearings are auto-created when:
   - A document is uploaded with an `extracted_date` (any doc type)
   - An RTI is uploaded with an `rti_filing_date` (hearing set to filing date + 10 days)

2. **Dashboard Display**: The Dashboard shows due-today, this-week, and overdue counts from pending hearings.

3. **Reminders Page**: A dedicated `/app/reminders` page shows upcoming hearings grouped by time window plus a history of sent email reminders.

4. **Email Cron**: Vercel cron (daily at 02:00 UTC) hits `/api/send-reminder` which:
   - Queries all pending hearings with due dates >= today
   - Filters by org reminder preferences (days_before, enabled)
   - Groups by org
   - Resolves member emails via `auth.admin.getUserById()` (requires service_role key)
   - Sends a single aggregated HTML email per org listing all upcoming deadlines
   - Logs each sent reminder in `reminder_log` (deduplicated by hearing_id + channel + date)

5. **Configuration**: In Settings, org owners can set `days_before` (0–7), `send_at_time`, and enable/disable reminders.

6. **Test Email**: Settings has a "Send Test Email" button that calls the API with `type: 'test'`.

### Vercel Environment Variables for API

The API function (`api/send-reminder.js`) needs the following env vars in Vercel:

- `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (for `auth.admin.getUserById()` to resolve member emails)
- `GMAIL_SMTP_USER` (Gmail address)
- `GMAIL_SMTP_PASS` (16-char App Password)

> **Note:** The cron job only fires on Vercel Pro plans. On Hobby, the cron schedule in `vercel.json` is ignored and reminders must be triggered manually via API call.

## Theme System

The app uses CSS custom properties with a `data-theme` attribute on `<html>`:

- **Dark mode** (default): `--bg-color: #080808`, `--text-color: white`, `--main-color: #ea580c` (orange)
- **Light mode**: `--bg-color: #ffffff`, `--text-color: #000000`, `--main-color: #4caf50` (green)

Theme preference is persisted in `localStorage` under the key `pic_tracker_theme`. The `<link rel="icon">` is also swapped between orange and green favicon SVGs when the theme changes.

Tailwind CSS utility classes (`bg-bg`, `text-text`, `bg-secondary`, `brand`) map to the CSS variables via `tailwind.config.js`.

## API

### `POST /api/send-reminder`

Vercel serverless function for sending reminder emails.

**Request body:**
```json
{ "type": "daily" }         // sends daily reminders for all orgs
{ "type": "test", "to": "email@example.com" }  // sends a test email
```

**Cron (Vercel):** Runs daily at 02:00 UTC via `vercel.json` cron config.

**Cron trigger:** The API detects the `x-vercel-cron` header and runs `sendDailyReminders()`.

## Development Notes

- All data hooks (`useCases`, `useDocuments`, `useHearings`) query Supabase directly — no seed data or mock data
- File uploads go to Supabase Storage bucket `documents/{orgId}/{uuid}-{fileName}`
- OCR runs client-side via Tesseract.js v7 on JPG/PNG images only (PDFs skip OCR)
- The `org.js` module has a three-tier fallback for org ID resolution: localStorage → user_metadata → members table/RPC
- The `colorScheme: 'dark'` style is applied to date inputs to ensure native calendar icons are visible in dark mode

# PIC Case Tracker

Multi-lawyer web app for tracking RTI (Right to Information) appeals before the Pakistan Information Commission (PIC).

## Features

- **Case Management** — Create, edit, delete, and search RTI/appeal cases with status tracking
- **Document Upload** — Upload notices and orders (PDF/JPG/PNG), auto-extract deadlines via OCR
- **Deadline Dashboard** — See due-today, this-week, and overdue deadlines at a glance
- **Hearing Tracking** — Auto-creates deadlines from document extracts, mark as resolved/adjourned
- **Email Reminders** — Daily email summaries of upcoming deadlines (Gmail SMTP)
- **Organization & Invites** — Multi-lawyer firms with role-based access (owner/lawyer/clerk)
- **Dark/Light Theme** — Persistent theme toggle

## Tech Stack

- **Frontend:** React 18, Vite, React Router 7, Tailwind CSS, React Hook Form + Zod
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Row-Level Security)
- **OCR:** Tesseract.js (client-side)
- **Emails:** Nodemailer + Gmail SMTP via Vercel serverless function
- **Deployment:** Vercel

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

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL (from Settings → API) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `GMAIL_SMTP_USER` | Gmail address for sending reminders |
| `GMAIL_SMTP_PASS` | Gmail App Password (16 chars) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (for server-side APIs) |

### Database

Run the migrations in `supabase/migrations/` in order (001–017) via the Supabase SQL Editor.

### Development

```bash
npm run dev
```

### Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Add all environment variables in Vercel project settings
4. Deploy

## Architecture

```
src/
  pages/          — Route-level components
  components/     — Reusable UI (auth, cases, upload, dashboard, layout)
  hooks/          — Data fetching (useCases, useDocuments, useHearings)
  lib/            — Supabase client, theme, org helpers
  extraction/     — Notice/order text parser with regex patterns
  styles/         — Theme CSS variables
api/              — Vercel serverless function (send-reminder)
supabase/
  migrations/     — Database schema, RLS policies, RPC functions
```

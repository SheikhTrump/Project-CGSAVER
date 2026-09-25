# CGSAVER

A web app for a student software studio in Bangladesh. Students submit project requirements, receive a fixed-price quote, pay by bKash, Nagad or bank transfer, and download the finished code. Admins manage quotes, payments, deliverables and a public showcase of past work.

Live at https://project-cgsaver.vercel.app

## Features

Students can:

- Sign up, log in and reset their password
- Submit a project with requirement files, tech stack, deadline and budget
- Chat with an admin on each project in real time
- Accept or reject a quote
- Submit payment details (transaction ID, sender number, screenshot)
- Download deliverables, request a revision or mark the project complete
- Leave a rating and review

Admins can:

- View and update every project
- Send quotes with price, delivery date and scope notes
- Confirm or reject payments
- Upload deliverables
- Post announcements
- Manage the public showcase
- Manage users and roles (`student`, `admin`, `superadmin`)
- Edit payment account details and platform settings (maintenance mode, accepting new projects)

Both get in-app notifications, and email notifications are sent over Gmail SMTP.

## Tech stack

- Next.js 14 (App Router) and TypeScript
- Supabase for Postgres, auth, file storage and realtime
- Tailwind CSS with shadcn/ui components
- React Hook Form and Zod for forms
- Zustand for client state
- Nodemailer and React Email for email
- Hosted on Vercel

## Running locally

You need Node.js 18.17 or later, a Supabase project, and a Gmail account with an [App Password](https://support.google.com/accounts/answer/185833).

```bash
git clone https://github.com/SheikhTrump/Project-CGSAVER.git
cd Project-CGSAVER
npm install
cp .env.example .env   # then fill in the values
npm run dev
```

The app runs at http://localhost:3000.

### Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `GMAIL_USER` | Gmail address that sends notification emails |
| `GMAIL_APP_PASSWORD` | App Password for that account |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app, used for links in emails |

`.env` is gitignored. Don't commit real credentials.

### Database

Run the SQL files in `supabase/migrations` in order, either in the Supabase SQL editor or with the Supabase CLI:

| File | What it does |
|---|---|
| `001_initial_schema.sql` | Core tables and row level security policies |
| `002_showcase_features.sql` | Featured projects, reviews and announcements |
| `003_auth_trigger.sql` | Creates a profile row when a user signs up |
| `004_fix_rls_and_notifications.sql` | Lets students move projects to completed or revision requested |
| `005_system_config.sql` | Platform settings and payment account details |
| `006_payment_sender_number.sql` | Adds sender number to payments |
| `007_security_fixes.sql` | Stops users from changing their own role, tightens policies |
| `008_fix_showcase_columns.sql` | Adds showcase columns if they are missing |
| `009_showcase_entries.sql` | Table for manually added showcase entries |

Then in the Supabase dashboard:

1. Create a storage bucket named `project_files`.
2. Enable realtime on the `messages` and `notifications` tables.
3. Sign up through the app, then make your account a superadmin:

   ```sql
   UPDATE public.profiles SET role = 'superadmin' WHERE email = 'you@example.com';
   ```

## Project statuses

A project goes through these statuses:

`submitted` → `in_review` → `quoted` → `payment_pending` → `in_progress` → `delivered` → `completed`

From `delivered`, the student can move it to `revision_requested` instead, which sends it back for more work. A project can also be `cancelled`.

## Project structure

```
src/
  app/
    (admin)/admin/        admin panel
    (auth)/               login, signup, password reset
    (student)/dashboard/  student dashboard and project pages
    auth/callback/        Supabase auth callback
    showcase/             public showcase
    page.tsx              landing page
  components/             shared components; ui/ holds the shadcn/ui primitives
  hooks/                  useAuth
  lib/                    Supabase client, email sending, helpers
  utils/                  server-side Supabase client, notifications
  middleware.ts           redirects based on login state and role
supabase/migrations/      database schema
```

## Scripts

- `npm run dev` starts the dev server
- `npm run build` builds for production
- `npm run start` serves the production build
- `npm run lint` runs ESLint

## Deploying

The app is deployed on Vercel. To deploy your own copy:

1. Import the repository into Vercel and add the environment variables above.
2. Set `NEXT_PUBLIC_APP_URL` to your production URL.
3. In Supabase, under Authentication → URL Configuration, add your site URL and `https://<your-domain>/auth/callback` as a redirect URL.

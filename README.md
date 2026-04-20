# Concierge

A university onboarding checklist tool. Students see personalised task lists based on their nationality and intake. Universities manage tasks and monitor progress. Built with Next.js 15 + Supabase.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the Supabase dashboard, run the migration file:
   - Go to **SQL Editor** → paste the contents of `supabase/migrations/001_initial_schema.sql` → Run.
3. In **Authentication → Settings**, disable **Email confirmation** for MVP.

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Find these in the Supabase dashboard under **Project Settings → API**.

### 4. Create the first super-admin

In the Supabase **SQL Editor**, run:

```sql
-- 1. Create the auth user (replace email/password)
SELECT supabase_admin.create_user(
  '{"email": "admin@uni-life.com", "password": "your-secure-password", "email_confirm": true}'
);

-- 2. Get their auth user ID, then insert a profile:
INSERT INTO public.users (id, role, email)
VALUES ('<auth-user-id-from-step-1>', 'super_admin', 'admin@uni-life.com');
```

Or, use the Supabase dashboard: **Authentication → Users → Invite user**, then manually insert a row into the `users` table with `role = 'super_admin'`.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## URL Structure

| URL | Who |
|---|---|
| `/uni/[slug]` | Student landing page |
| `/uni/[slug]/register` | Student registration step 1 |
| `/uni/[slug]/register/password` | Student registration step 2 |
| `/uni/[slug]/login` | Student login |
| `/uni/[slug]/dashboard` | Student checklist |
| `/uni/[slug]/tasks/[id]` | Task detail |
| `/admin/tasks` | University admin: task management |
| `/admin/students` | University admin: student progress |
| `/super` | Super-admin: university list |
| `/super/universities/new` | Super-admin: add university |
| `/super/universities/[id]` | Super-admin: manage university |
| `/login` | Admin/super-admin login |

---

## Deploy

Push to GitHub and connect to [Vercel](https://vercel.com). Set the three environment variables in the Vercel dashboard.

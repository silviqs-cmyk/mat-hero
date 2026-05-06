# MatHero

MatHero is a Next.js + Supabase learning product for 7th grade math exam preparation, built around a 10-day intensive course with a dark neon dashboard UI and a future-ready CMS structure.

## Current State

The project already includes:
- shared MatHero design system and neon UI primitives
- App Router structure
- student-facing MVP flows
- admin-facing prototype screens
- production-ready Supabase foundation:
  - SQL migration
  - seed data
  - typed service layer
  - auth/profile/role model

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase
- Framer Motion

## Project Structure

```text
src/
  app/
  components/
  data/
  hooks/
  lib/
    supabase/
  services/
  types/
supabase/
  migrations/
  seed.sql
docs/
  DATABASE.md
  ADMIN_CMS.md
DESIGN_SYSTEM.md
```

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env.local` or `.env` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Supabase Setup

1. Create a new Supabase project.
2. Enable Email auth.
3. Run the migration from:
   - `supabase/migrations/001_initial_schema.sql`
4. Run the seed from:
   - `supabase/seed.sql`
5. Create at least one admin by updating `profiles.role = 'admin'` for the target user.

Important:
- Do not use the legacy `supabase/schema.sql` as the primary source of truth.
- The canonical schema is now the migration file in `supabase/migrations/`.

## Documentation

- Design system: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- Database: [docs/DATABASE.md](./docs/DATABASE.md)
- Admin CMS direction: [docs/ADMIN_CMS.md](./docs/ADMIN_CMS.md)

## Validation

```bash
npm run lint
npm run build
```

## Encoding

Project files should be saved as UTF-8 to preserve Bulgarian text correctly across the app, SQL seeds, migrations, and CMS content.

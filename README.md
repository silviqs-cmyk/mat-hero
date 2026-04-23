# MatHero

MatHero is a mobile-first educational MVP for 7th grade math exam prep, built with Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, and Supabase.

## Features

- 10-day preparation roadmap
- dashboard with XP, streak, and weak topics
- lesson flow with short theory and animated visual blocks
- quiz flow with instant feedback
- explanation page with step-by-step solutions
- results page and final report
- anonymous MVP-friendly progress tracking

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Connect Supabase

1. Create a new Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Add your project URL and anon key.
4. Run the SQL in [supabase/schema.sql](./supabase/schema.sql) inside the Supabase SQL editor.
5. Optional: insert your own `days`, `lessons`, and `questions` records. The app already includes typed demo data, so it works without Supabase too.

## Required Env Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Notes

- Anonymous session state is stored locally for the MVP.
- Supabase helpers fall back to demo data if environment variables are missing.
- The scaffolded app lives in `c:\New folder\maturohero` because `create-next-app` cannot use `New folder` as an npm package name.

# MatHero Database

## Overview
MatHero uses Supabase Postgres as the source of truth for:
- profiles and roles
- courses and 10-day plans
- lessons and lesson sections
- questions and answer options
- student progress, answers, and results
- achievements

## Migration
- Main schema: `supabase/migrations/001_initial_schema.sql`
- Seed data: `supabase/seed.sql`

## Core Modeling Decisions
- `profiles` mirrors `auth.users` and stores role, grade, and goal score.
- `courses` can support future subjects and grades beyond the current 7th grade math sprint.
- `course_days` stores the 10-day plan with publish state and ordering.
- `lessons` and `lesson_sections` separate long-form content from the daily shell.
- `questions` supports `multiple_choice`, `open_answer`, and `true_false`.
- `user_progress`, `user_answers`, and `day_results` split ongoing state from per-answer and per-day history.

## Security
- Students can only read published learning content.
- Students can only read and write their own progress, answers, results, and earned achievements.
- Admins are determined through `profiles.role = 'admin'`.
- Helper SQL function: `public.is_admin()`

## Operational Notes
- `handle_new_user()` creates a `profiles` row automatically after signup.
- `set_updated_at()` keeps timestamp columns current on update.
- The seed course slug is `nvo-matematika-7-klas`.

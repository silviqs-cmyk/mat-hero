create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'student' check (role in ('student', 'admin')),
  grade integer not null default 7 check (grade between 1 and 12),
  goal_score integer not null default 80 check (goal_score between 0 and 100),
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  subject text not null default 'Математика',
  grade integer not null default 7,
  duration_days integer not null default 10 check (duration_days > 0),
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.course_days (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  day_number integer not null check (day_number > 0),
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  estimated_minutes integer not null default 30 check (estimated_minutes >= 0),
  is_published boolean not null default false,
  sort_order integer not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (course_id, day_number),
  unique (course_id, sort_order)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_day_id uuid not null references public.course_days(id) on delete cascade,
  title text not null,
  type text not null default 'theory',
  content text not null default '',
  video_url text,
  estimated_minutes integer not null default 10 check (estimated_minutes >= 0),
  sort_order integer not null default 1,
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lesson_sections (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  section_type text not null default 'theory',
  content text not null default '',
  sort_order integer not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  course_day_id uuid not null references public.course_days(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  question_type text not null check (question_type in ('multiple_choice', 'open_answer', 'true_false')),
  prompt text not null,
  explanation text not null default '',
  expected_answer text,
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  points integer not null default 10 check (points >= 0),
  topic text not null default '',
  is_bonus boolean not null default false,
  sort_order integer not null default 1,
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  sort_order integer not null default 1,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  current_day_number integer not null default 1,
  completed_days integer[] not null default '{}',
  total_xp integer not null default 0,
  streak_days integer not null default 0,
  last_active_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, course_id)
);

create table if not exists public.user_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected_option_id uuid references public.question_options(id) on delete set null,
  open_answer text,
  is_correct boolean not null default false,
  points_earned integer not null default 0,
  time_spent_seconds integer not null default 0,
  answered_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.day_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_day_id uuid not null references public.course_days(id) on delete cascade,
  score integer not null default 0,
  total_questions integer not null default 0,
  percentage integer not null default 0,
  weak_topics text[] not null default '{}',
  completed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, course_day_id)
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  icon text not null default 'sparkles',
  xp_reward integer not null default 0,
  condition_type text not null default 'progress',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  earned_at timestamptz not null default timezone('utc', now()),
  unique (user_id, achievement_id)
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_courses_subject_grade on public.courses(subject, grade);
create index if not exists idx_course_days_course_id on public.course_days(course_id, sort_order);
create index if not exists idx_lessons_course_day_id on public.lessons(course_day_id, sort_order);
create index if not exists idx_lesson_sections_lesson_id on public.lesson_sections(lesson_id, sort_order);
create index if not exists idx_questions_day_lesson on public.questions(course_day_id, lesson_id, sort_order);
create index if not exists idx_questions_topic on public.questions(topic);
create index if not exists idx_question_options_question on public.question_options(question_id, sort_order);
create index if not exists idx_user_progress_user_course on public.user_progress(user_id, course_id);
create index if not exists idx_user_answers_user_question on public.user_answers(user_id, question_id);
create index if not exists idx_day_results_user_day on public.day_results(user_id, course_day_id);
create index if not exists idx_user_achievements_user on public.user_achievements(user_id);

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = check_user_id
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, grade, goal_score, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'student'),
    coalesce(nullif(new.raw_user_meta_data ->> 'grade', '')::integer, 7),
    coalesce(nullif(new.raw_user_meta_data ->> 'goal_score', '')::integer, 80),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    avatar_url = excluded.avatar_url,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists set_course_days_updated_at on public.course_days;
create trigger set_course_days_updated_at before update on public.course_days
for each row execute function public.set_updated_at();

drop trigger if exists set_lessons_updated_at on public.lessons;
create trigger set_lessons_updated_at before update on public.lessons
for each row execute function public.set_updated_at();

drop trigger if exists set_lesson_sections_updated_at on public.lesson_sections;
create trigger set_lesson_sections_updated_at before update on public.lesson_sections
for each row execute function public.set_updated_at();

drop trigger if exists set_questions_updated_at on public.questions;
create trigger set_questions_updated_at before update on public.questions
for each row execute function public.set_updated_at();

drop trigger if exists set_user_progress_updated_at on public.user_progress;
create trigger set_user_progress_updated_at before update on public.user_progress
for each row execute function public.set_updated_at();

drop trigger if exists set_achievements_updated_at on public.achievements;
create trigger set_achievements_updated_at before update on public.achievements
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_days enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_sections enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.user_progress enable row level security;
alter table public.user_answers enable row level security;
alter table public.day_results enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_admin_insert" on public.profiles;
create policy "profiles_admin_insert" on public.profiles
for insert to authenticated
with check (public.is_admin());

drop policy if exists "courses_published_read" on public.courses;
create policy "courses_published_read" on public.courses
for select to authenticated
using (is_published or public.is_admin());

drop policy if exists "courses_admin_all" on public.courses;
create policy "courses_admin_all" on public.courses
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "course_days_published_read" on public.course_days;
create policy "course_days_published_read" on public.course_days
for select to authenticated
using (
  is_published
  and exists (
    select 1 from public.courses
    where courses.id = course_days.course_id
      and courses.is_published = true
  )
  or public.is_admin()
);

drop policy if exists "course_days_admin_all" on public.course_days;
create policy "course_days_admin_all" on public.course_days
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "lessons_published_read" on public.lessons;
create policy "lessons_published_read" on public.lessons
for select to authenticated
using (
  is_published
  and exists (
    select 1
    from public.course_days
    where course_days.id = lessons.course_day_id
      and course_days.is_published = true
  )
  or public.is_admin()
);

drop policy if exists "lessons_admin_all" on public.lessons;
create policy "lessons_admin_all" on public.lessons
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "lesson_sections_published_read" on public.lesson_sections;
create policy "lesson_sections_published_read" on public.lesson_sections
for select to authenticated
using (
  exists (
    select 1
    from public.lessons
    where lessons.id = lesson_sections.lesson_id
      and lessons.is_published = true
  )
  or public.is_admin()
);

drop policy if exists "lesson_sections_admin_all" on public.lesson_sections;
create policy "lesson_sections_admin_all" on public.lesson_sections
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "questions_published_read" on public.questions;
create policy "questions_published_read" on public.questions
for select to authenticated
using (is_published or public.is_admin());

drop policy if exists "questions_admin_all" on public.questions;
create policy "questions_admin_all" on public.questions
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "question_options_published_read" on public.question_options;
create policy "question_options_published_read" on public.question_options
for select to authenticated
using (
  exists (
    select 1 from public.questions
    where questions.id = question_options.question_id
      and (questions.is_published = true or public.is_admin())
  )
);

drop policy if exists "question_options_admin_all" on public.question_options;
create policy "question_options_admin_all" on public.question_options
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "user_progress_own_read" on public.user_progress;
create policy "user_progress_own_read" on public.user_progress
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_progress_own_insert" on public.user_progress;
create policy "user_progress_own_insert" on public.user_progress
for insert to authenticated
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_progress_own_update" on public.user_progress;
create policy "user_progress_own_update" on public.user_progress
for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_answers_own_read" on public.user_answers;
create policy "user_answers_own_read" on public.user_answers
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_answers_own_insert" on public.user_answers;
create policy "user_answers_own_insert" on public.user_answers
for insert to authenticated
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_answers_own_update" on public.user_answers;
create policy "user_answers_own_update" on public.user_answers
for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "day_results_own_read" on public.day_results;
create policy "day_results_own_read" on public.day_results
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "day_results_own_insert" on public.day_results;
create policy "day_results_own_insert" on public.day_results
for insert to authenticated
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "day_results_own_update" on public.day_results;
create policy "day_results_own_update" on public.day_results
for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "achievements_read" on public.achievements;
create policy "achievements_read" on public.achievements
for select to authenticated
using (true);

drop policy if exists "achievements_admin_all" on public.achievements;
create policy "achievements_admin_all" on public.achievements
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "user_achievements_own_read" on public.user_achievements;
create policy "user_achievements_own_read" on public.user_achievements
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_achievements_own_insert" on public.user_achievements;
create policy "user_achievements_own_insert" on public.user_achievements
for insert to authenticated
with check (user_id = auth.uid() or public.is_admin());

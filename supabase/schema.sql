create table if not exists days (
  id bigint primary key generated always as identity,
  title text not null,
  topic text not null,
  is_active boolean not null default false,
  order_index int not null
);

create table if not exists lessons (
  id bigint primary key generated always as identity,
  day_id bigint not null references days(id) on delete cascade,
  title text not null,
  short_theory text not null,
  example text not null,
  animation_type text not null
);

create table if not exists questions (
  id bigint primary key generated always as identity,
  day_id bigint not null references days(id) on delete cascade,
  topic text not null,
  difficulty text not null,
  question_text text not null,
  options jsonb not null,
  correct_answer text not null,
  explanation_steps jsonb not null
);

create table if not exists user_progress (
  id bigint primary key generated always as identity,
  session_id text not null unique,
  current_day int not null default 1,
  xp int not null default 0,
  streak int not null default 0,
  last_quiz_score int not null default 0,
  completed_days jsonb not null default '[]'::jsonb,
  weak_topics jsonb not null default '[]'::jsonb,
  topic_scores jsonb not null default '{}'::jsonb
);

create table if not exists quiz_attempts (
  id bigint primary key generated always as identity,
  session_id text not null,
  day_id bigint not null references days(id) on delete cascade,
  score int not null,
  total_questions int not null,
  created_at timestamptz not null default now()
);

create table if not exists question_attempts (
  id bigint primary key generated always as identity,
  quiz_attempt_id bigint not null references quiz_attempts(id) on delete cascade,
  question_id bigint not null references questions(id) on delete cascade,
  selected_answer text not null,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

alter table days enable row level security;
alter table lessons enable row level security;
alter table questions enable row level security;
alter table user_progress enable row level security;
alter table quiz_attempts enable row level security;
alter table question_attempts enable row level security;

drop policy if exists "days are readable by authenticated users" on days;
drop policy if exists "lessons are readable by authenticated users" on lessons;
drop policy if exists "questions are readable by authenticated users" on questions;
drop policy if exists "users can read own progress" on user_progress;
drop policy if exists "users can insert own progress" on user_progress;
drop policy if exists "users can update own progress" on user_progress;
drop policy if exists "users can read own quiz attempts" on quiz_attempts;
drop policy if exists "users can insert own quiz attempts" on quiz_attempts;
drop policy if exists "users can read own question attempts" on question_attempts;
drop policy if exists "users can insert own question attempts" on question_attempts;

create policy "days are readable by authenticated users"
on days
for select
to authenticated
using (true);

create policy "lessons are readable by authenticated users"
on lessons
for select
to authenticated
using (true);

create policy "questions are readable by authenticated users"
on questions
for select
to authenticated
using (true);

create policy "users can read own progress"
on user_progress
for select
to authenticated
using (session_id = auth.uid()::text);

create policy "users can insert own progress"
on user_progress
for insert
to authenticated
with check (session_id = auth.uid()::text);

create policy "users can update own progress"
on user_progress
for update
to authenticated
using (session_id = auth.uid()::text)
with check (session_id = auth.uid()::text);

create policy "users can read own quiz attempts"
on quiz_attempts
for select
to authenticated
using (session_id = auth.uid()::text);

create policy "users can insert own quiz attempts"
on quiz_attempts
for insert
to authenticated
with check (session_id = auth.uid()::text);

create policy "users can read own question attempts"
on question_attempts
for select
to authenticated
using (
  exists (
    select 1
    from quiz_attempts
    where quiz_attempts.id = question_attempts.quiz_attempt_id
      and quiz_attempts.session_id = auth.uid()::text
  )
);

create policy "users can insert own question attempts"
on question_attempts
for insert
to authenticated
with check (
  exists (
    select 1
    from quiz_attempts
    where quiz_attempts.id = question_attempts.quiz_attempt_id
      and quiz_attempts.session_id = auth.uid()::text
  )
);

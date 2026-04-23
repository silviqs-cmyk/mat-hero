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

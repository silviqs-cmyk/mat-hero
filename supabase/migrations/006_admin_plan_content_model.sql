alter table public.questions
add column if not exists question_group text;

update public.questions
set question_group = case
  when is_bonus = true then 'bonus'
  when question_group is null then 'practice'
  else question_group
end
where question_group is null;

alter table public.questions
alter column question_group set default 'practice';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'questions_question_group_check'
  ) then
    alter table public.questions
    add constraint questions_question_group_check
    check (question_group in ('practice', 'quiz', 'bonus'));
  end if;
end $$;

alter table public.lessons
add column if not exists video_provider text not null default 'none',
add column if not exists video_title text,
add column if not exists video_thumbnail_url text,
add column if not exists video_duration_seconds integer,
add column if not exists video_status text not null default 'draft',
add column if not exists video_storage_path text;

update public.lessons
set
  video_provider = case
    when video_url is null or btrim(video_url) = '' then 'none'
    when video_url like '%youtube.com%' or video_url like '%youtu.be%' then 'youtube'
    when video_url like '%vimeo.com%' then 'vimeo'
    else 'external'
  end,
  video_status = case
    when video_url is null or btrim(video_url) = '' then 'draft'
    else 'published'
  end
where video_provider = 'none'
  or video_status = 'draft';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'lessons_video_provider_check'
  ) then
    alter table public.lessons
    add constraint lessons_video_provider_check
    check (video_provider in ('youtube', 'vimeo', 'external', 'uploaded', 'none'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'lessons_video_status_check'
  ) then
    alter table public.lessons
    add constraint lessons_video_status_check
    check (video_status in ('draft', 'published'));
  end if;
end $$;

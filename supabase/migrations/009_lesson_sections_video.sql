alter table public.lesson_sections
add column if not exists video_url text;

alter table public.lesson_sections
add column if not exists video_provider text not null default 'none';

alter table public.lesson_sections
add column if not exists video_status text not null default 'draft';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'lesson_sections_video_provider_check'
  ) then
    alter table public.lesson_sections
    add constraint lesson_sections_video_provider_check
    check (video_provider in ('youtube', 'vimeo', 'external', 'uploaded', 'none'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'lesson_sections_video_status_check'
  ) then
    alter table public.lesson_sections
    add constraint lesson_sections_video_status_check
    check (video_status in ('draft', 'published'));
  end if;
end $$;

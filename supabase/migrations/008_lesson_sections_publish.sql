alter table public.lesson_sections
add column if not exists is_published boolean;

update public.lesson_sections
set is_published = true
where is_published is null;

alter table public.lesson_sections
alter column is_published set default false;

alter table public.lesson_sections
alter column is_published set not null;

drop policy if exists "lesson_sections_published_read" on public.lesson_sections;
create policy "lesson_sections_published_read" on public.lesson_sections
for select to authenticated
using (
  (
    is_published = true
    and exists (
      select 1
      from public.lessons
      where lessons.id = lesson_sections.lesson_id
        and lessons.is_published = true
    )
  )
  or public.is_admin()
);

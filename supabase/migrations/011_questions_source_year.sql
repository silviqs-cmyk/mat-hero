alter table public.questions
add column if not exists source_year integer;

alter table public.questions
drop constraint if exists questions_source_year_check;

alter table public.questions
add constraint questions_source_year_check
check (source_year is null or (source_year >= 2000 and source_year <= 2100));

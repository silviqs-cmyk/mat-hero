drop policy if exists "public can read published courses" on public.courses;

create policy "public can read published courses" on public.courses
for select to anon
using (is_published = true);

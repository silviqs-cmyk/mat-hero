insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lesson-videos',
  'lesson-videos',
  true,
  104857600,
  array['video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "lesson_videos_public_read" on storage.objects;
create policy "lesson_videos_public_read" on storage.objects
for select
to public
using (bucket_id = 'lesson-videos');

drop policy if exists "lesson_videos_admin_upload" on storage.objects;
create policy "lesson_videos_admin_upload" on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'lesson-videos'
  and public.is_admin()
);

drop policy if exists "lesson_videos_admin_update" on storage.objects;
create policy "lesson_videos_admin_update" on storage.objects
for update
to authenticated
using (
  bucket_id = 'lesson-videos'
  and public.is_admin()
)
with check (
  bucket_id = 'lesson-videos'
  and public.is_admin()
);

drop policy if exists "lesson_videos_admin_delete" on storage.objects;
create policy "lesson_videos_admin_delete" on storage.objects
for delete
to authenticated
using (
  bucket_id = 'lesson-videos'
  and public.is_admin()
);

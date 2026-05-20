drop policy if exists "user_progress_own_delete" on public.user_progress;
create policy "user_progress_own_delete" on public.user_progress
for delete to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_answers_own_delete" on public.user_answers;
create policy "user_answers_own_delete" on public.user_answers
for delete to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "day_results_own_delete" on public.day_results;
create policy "day_results_own_delete" on public.day_results
for delete to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_achievements_own_delete" on public.user_achievements;
create policy "user_achievements_own_delete" on public.user_achievements
for delete to authenticated
using (user_id = auth.uid() or public.is_admin());

alter table public.questions
add column if not exists question_group text default 'practice';

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'questions'
      and column_name = 'question_set_type'
  ) then
    execute $sql$
      update public.questions
      set question_group = case
        when is_bonus = true then 'bonus'
        when question_set_type in ('practice', 'quiz', 'bonus') then question_set_type
        when question_group in ('practice', 'quiz', 'bonus') then question_group
        else 'practice'
      end
      where question_group is null
         or question_group not in ('practice', 'quiz', 'bonus')
         or is_bonus = true
    $sql$;
  else
    update public.questions
    set question_group = case
      when is_bonus = true then 'bonus'
      when question_group in ('practice', 'quiz', 'bonus') then question_group
      else 'practice'
    end
    where question_group is null
       or question_group not in ('practice', 'quiz', 'bonus')
       or is_bonus = true;
  end if;
end $$;

update public.questions
set is_bonus = (question_group = 'bonus')
where is_bonus is distinct from (question_group = 'bonus');

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

notify pgrst, 'reload schema';

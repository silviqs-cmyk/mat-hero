insert into public.courses (
  id,
  title,
  slug,
  description,
  subject,
  grade,
  duration_days,
  is_published
)
values (
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92aa01',
  'НВО Математика 7 клас',
  'nvo-matematika-7-klas',
  '10-дневна интензивна подготовка за НВО по математика за 7 клас.',
  'Математика',
  7,
  10,
  true
)
on conflict (id) do update
set
  title = excluded.title,
  slug = excluded.slug,
  description = excluded.description,
  subject = excluded.subject,
  grade = excluded.grade,
  duration_days = excluded.duration_days,
  is_published = excluded.is_published;

insert into public.course_days (id, course_id, day_number, title, subtitle, description, estimated_minutes, is_published, sort_order)
values
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa01',1,'Фундамент - числа и действия','','Естествени и рационални числа, делимост, абсолютна стойност и действия.',45,true,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92aa12','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa01',2,'Проценти и въведение в алгебрата','Практичен старт','Процент от число, процентна промяна и първи алгебрични изрази.',45,true,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92aa13','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa01',3,'Алгебрични преобразувания','Изрази и еквивалентност','Подреждане, събиране и опростяване на алгебрични изрази.',45,true,3),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92aa14','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa01',4,'Уравнения','Една неизвестна','Линейни уравнения и проверка на решения.',45,true,4),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92aa15','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa01',5,'Неравенства','Сравнения и интервали','Основни неравенства и числова ос.',45,true,5),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92aa16','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa01',6,'Геометрия','Ъгли, триъгълници, лица','Базова геометрия за НВО.',45,true,6),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92aa17','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa01',7,'Текстови задачи','Моделиране','Превод на условия в изрази и уравнения.',45,true,7),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92aa18','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa01',8,'Вероятности и статистика','Данни и шанс','Средно аритметично, диаграми и вероятности.',45,true,8),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92aa19','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa01',9,'Пробен тест','Симулация','Пълен смесен тест в стил НВО.',60,true,9),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92aa20','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa01',10,'Финален преговор','Последни акценти','Слабите теми, формули и финален sprint.',40,true,10)
on conflict (id) do update
set
  title = excluded.title,
  subtitle = excluded.subtitle,
  description = excluded.description,
  estimated_minutes = excluded.estimated_minutes,
  is_published = excluded.is_published,
  sort_order = excluded.sort_order;

insert into public.lessons (
  id, course_day_id, title, type, content, video_url, video_provider, video_status, estimated_minutes, sort_order, is_published
)
values (
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ab01',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',
  'Ден 1: Фундамент - числа и действия',
  'theory',
  'Започваме с естествени и рационални числа, признаци за делимост, прости и съставни числа, абсолютна стойност и действия с рационални числа.',
  'https://www.youtube.com/watch?v=demo-mathero-day-1',
  'youtube',
  'published',
  12,
  1,
  true
)
on conflict (id) do update
set
  title = excluded.title,
  type = excluded.type,
  content = excluded.content,
  video_url = excluded.video_url,
  video_provider = excluded.video_provider,
  video_status = excluded.video_status,
  estimated_minutes = excluded.estimated_minutes,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;

insert into public.lesson_sections (id, lesson_id, title, section_type, content, sort_order)
values
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ac01','7f9b0f4b-b75d-4a25-a5dc-0a337f92ab01','Най-важното','theory','Естествените числа използваме за броене, рационалните включват дроби и цели числа.',1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ac02','7f9b0f4b-b75d-4a25-a5dc-0a337f92ab01','Формула','formula','Абсолютна стойност |a| е разстоянието от a до 0.',2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ac03','7f9b0f4b-b75d-4a25-a5dc-0a337f92ab01','Пример','example','60 = 2 · 2 · 3 · 5, |-5| = 5, а 3/4 + 1/2 = 5/4.',3)
on conflict (id) do update
set
  title = excluded.title,
  section_type = excluded.section_type,
  content = excluded.content,
  sort_order = excluded.sort_order;

insert into public.questions (
  id, course_day_id, lesson_id, question_type, prompt, explanation, difficulty, points, topic, is_bonus, sort_order, is_published
)
values
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad01','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11','7f9b0f4b-b75d-4a25-a5dc-0a337f92ab01','multiple_choice','Кое число е рационално?','Рационалното число може да се запише като дроб с ненулев знаменател.','easy',10,'рационални числа',false,1,true),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad02','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11','7f9b0f4b-b75d-4a25-a5dc-0a337f92ab01','open_answer','Пресметни |-12|.','Абсолютната стойност е разстоянието до 0.','easy',10,'абсолютна стойност',false,2,true),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad03','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11','7f9b0f4b-b75d-4a25-a5dc-0a337f92ab01','true_false','Числото 1 е просто число.','Простите числа имат точно два делителя, а 1 има само един.','easy',10,'прости числа',false,3,true),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad04','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11','7f9b0f4b-b75d-4a25-a5dc-0a337f92ab01','multiple_choice','Кое е разлагането на 30 на прости множители?','30 = 2 · 3 · 5.','medium',10,'делимост',false,4,true),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad05','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11','7f9b0f4b-b75d-4a25-a5dc-0a337f92ab01','multiple_choice','Колко е 3/4 + 1/2 ?','Привеждаме към общ знаменател 4.','medium',10,'дроби',false,5,true),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad06','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11','7f9b0f4b-b75d-4a25-a5dc-0a337f92ab01','open_answer','Пресметни 2 - 3/5.','2 = 10/5, следователно 10/5 - 3/5 = 7/5.','medium',10,'дроби',false,6,true),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad07','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11','7f9b0f4b-b75d-4a25-a5dc-0a337f92ab01','multiple_choice','Кое число се дели на 3?','Сумата на цифрите трябва да се дели на 3.','medium',10,'делимост',false,7,true),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad08','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11','7f9b0f4b-b75d-4a25-a5dc-0a337f92ab01','true_false','Всяко естествено число е рационално.','Всяко естествено число n може да се запише като n/1.','easy',10,'рационални числа',false,8,true),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad09','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11','7f9b0f4b-b75d-4a25-a5dc-0a337f92ab01','multiple_choice','Кое е съставно число?','Съставното число има повече от два делителя.','easy',10,'прости числа',false,9,true),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad10','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11','7f9b0f4b-b75d-4a25-a5dc-0a337f92ab01','open_answer','Колко е НОД(12, 18)?','Общите делители са 1, 2, 3, 6 и най-големият е 6.','hard',10,'делимост',true,10,true)
on conflict (id) do update
set
  prompt = excluded.prompt,
  explanation = excluded.explanation,
  difficulty = excluded.difficulty,
  points = excluded.points,
  topic = excluded.topic,
  is_bonus = excluded.is_bonus,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;

update public.questions
set question_group = case id
  when '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad08' then 'quiz'
  when '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad09' then 'quiz'
  when '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad10' then 'bonus'
  else 'practice'
end
where id in (
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad01',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad02',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad03',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad04',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad05',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad06',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad07',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad08',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad09',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad10'
);

update public.questions
set is_bonus = (question_group = 'bonus')
where id in (
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad01',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad02',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad03',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad04',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad05',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad06',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad07',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad08',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad09',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad10'
);

update public.questions
set expected_answer = case id
  when '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad02' then '12'
  when '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad03' then 'Невярно'
  when '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad06' then '7/5'
  when '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad08' then 'Вярно'
  when '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad10' then '6'
  else expected_answer
end
where id in (
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad02',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad03',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad06',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad08',
  '7f9b0f4b-b75d-4a25-a5dc-0a337f92ad10'
);

insert into public.question_options (id, question_id, option_text, is_correct, sort_order)
values
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae01','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad01','π',false,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae02','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad01','√2',false,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae03','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad01','3/5',true,3),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae04','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad01','∞',false,4),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae05','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad03','Вярно',false,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae06','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad03','Невярно',true,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae07','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad04','2 · 15',false,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae08','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad04','2 · 3 · 5',true,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae09','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad04','5 · 6',false,3),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae10','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad04','3 · 10',false,4),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae11','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad05','4/4',false,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae12','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad05','5/4',true,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae13','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad05','6/4',false,3),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae14','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad05','7/4',false,4),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae15','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad07','124',false,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae16','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad07','126',true,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae17','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad07','128',false,3),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae18','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad07','130',false,4),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae19','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad08','Вярно',true,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae20','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad08','Невярно',false,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae21','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad09','11',false,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae22','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad09','13',false,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae23','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad09','21',true,3),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae24','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad09','29',false,4)
on conflict (id) do update
set
  option_text = excluded.option_text,
  is_correct = excluded.is_correct,
  sort_order = excluded.sort_order;

insert into public.achievements (id, title, description, icon, xp_reward, condition_type)
values
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92af01','Първи завършен ден','Завърши първия си ден в MatHero.','sparkles',25,'complete_day'),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92af02','Серия 3','Влез и работи 3 поредни дни.','flame',30,'streak_3')
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  icon = excluded.icon,
  xp_reward = excluded.xp_reward,
  condition_type = excluded.condition_type;

with remaining_days as (
  select
    d.id as course_day_id,
    d.day_number,
    d.title as day_title,
    d.description as day_description,
    ('7f9b0f4b-b75d-4a26-a6dc-' || lpad(to_hex(4096 + d.day_number), 12, '0'))::uuid as lesson_id
  from public.course_days d
  where d.course_id = '7f9b0f4b-b75d-4a25-a5dc-0a337f92aa01'
    and d.day_number between 2 and 10
)
insert into public.lessons (
  id, course_day_id, title, type, content, video_url, video_provider, video_status, estimated_minutes, sort_order, is_published
)
select
  lesson_id,
  course_day_id,
  format('Ден %s: %s', day_number, day_title),
  'theory',
  format(
    'В този урок упражняваме %s. Мини стъпка по стъпка, следи реда на действията и проверявай дали всеки резултат пасва на условието.',
    day_title
  ),
  format('https://www.youtube.com/watch?v=demo-mathero-day-%s', day_number),
  'youtube',
  'published',
  12,
  1,
  true
from remaining_days
on conflict (id) do update
set
  title = excluded.title,
  type = excluded.type,
  content = excluded.content,
  video_url = excluded.video_url,
  video_provider = excluded.video_provider,
  video_status = excluded.video_status,
  estimated_minutes = excluded.estimated_minutes,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;

with remaining_days as (
  select
    d.day_number,
    d.title as day_title,
    ('7f9b0f4b-b75d-4a26-a6dc-' || lpad(to_hex(4096 + d.day_number), 12, '0'))::uuid as lesson_id
  from public.course_days d
  where d.course_id = '7f9b0f4b-b75d-4a25-a5dc-0a337f92aa01'
    and d.day_number between 2 and 10
)
insert into public.lesson_sections (id, lesson_id, title, section_type, content, sort_order)
select
  section_id,
  lesson_id,
  title,
  section_type,
  content,
  sort_order
from remaining_days
cross join lateral (
  values
    (
      ('7f9b0f4b-b75d-4a26-a6dd-' || lpad(to_hex(day_number * 100 + 1), 12, '0'))::uuid,
      'Най-важното',
      'theory',
      format(
        'Фокусът на ден %s е %s. Прочети идеята спокойно, реши примерите подред и следи ключовите думи в условието.',
        day_number,
        day_title
      ),
      1
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6dd-' || lpad(to_hex(day_number * 100 + 2), 12, '0'))::uuid,
      'Формула',
      'formula',
      'Правило: работи подред, пази знаците и накрая провери дали отговорът пасва на условието.',
      2
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6dd-' || lpad(to_hex(day_number * 100 + 3), 12, '0'))::uuid,
      'Пример',
      'example',
      format(
        'Пример: %s + 2 = %s, а %s · 2 = %s.',
        day_number,
        day_number + 2,
        day_number,
        day_number * 2
      ),
      3
    )
) as sections(section_id, title, section_type, content, sort_order)
on conflict (id) do update
set
  title = excluded.title,
  section_type = excluded.section_type,
  content = excluded.content,
  sort_order = excluded.sort_order;

with remaining_days as (
  select
    d.id as course_day_id,
    d.day_number,
    d.title as day_title,
    ('7f9b0f4b-b75d-4a26-a6dc-' || lpad(to_hex(4096 + d.day_number), 12, '0'))::uuid as lesson_id
  from public.course_days d
  where d.course_id = '7f9b0f4b-b75d-4a25-a5dc-0a337f92aa01'
    and d.day_number between 2 and 10
)
insert into public.questions (
  id,
  course_day_id,
  lesson_id,
  question_type,
  prompt,
  explanation,
  difficulty,
  points,
  topic,
  is_bonus,
  question_group,
  expected_answer,
  sort_order,
  is_published
)
select
  question_id,
  course_day_id,
  lesson_id,
  question_type,
  prompt,
  explanation,
  difficulty,
  points,
  day_title,
  false,
  question_group,
  expected_answer,
  sort_order,
  true
from remaining_days
cross join lateral (
  values
    (
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 1), 12, '0'))::uuid,
      'multiple_choice',
      format('Колко е %s + 2?', day_number),
      'Събираме числата директно.',
      'easy',
      10,
      'practice',
      null,
      1
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 2), 12, '0'))::uuid,
      'open_answer',
      format('Колко е %s + 3?', day_number),
      'Добавяме 3 към числото.',
      'easy',
      10,
      'practice',
      (day_number + 3)::text,
      2
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 3), 12, '0'))::uuid,
      'true_false',
      format('Вярно ли е, че %s е по-голямо от 0?', day_number),
      'Всички дни в плана са номерирани с положителни числа.',
      'easy',
      10,
      'practice',
      'Вярно',
      3
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 4), 12, '0'))::uuid,
      'multiple_choice',
      format('Колко е %s · 2?', day_number),
      'Умножаваме числото по 2.',
      'medium',
      10,
      'practice',
      null,
      4
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 5), 12, '0'))::uuid,
      'open_answer',
      format('Колко е %s · %s?', day_number, day_number),
      'Умножаваме числото само по себе си.',
      'medium',
      10,
      'practice',
      (day_number * day_number)::text,
      5
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 6), 12, '0'))::uuid,
      'multiple_choice',
      format('Кое число се дели на %s?', day_number),
      'Търсим число, което е кратно на числото от условието.',
      'medium',
      10,
      'practice',
      null,
      6
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 7), 12, '0'))::uuid,
      'true_false',
      format('Вярно ли е, че %s - 1 е по-малко от %s?', day_number, day_number),
      'Ако извадим 1 от положително число, получаваме по-малко число.',
      'easy',
      10,
      'quiz',
      'Вярно',
      7
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 8), 12, '0'))::uuid,
      'multiple_choice',
      format('Колко е %s + %s?', day_number, day_number),
      'Събираме числото със себе си.',
      'medium',
      10,
      'quiz',
      null,
      8
    )
) as questions(question_id, question_type, prompt, explanation, difficulty, points, question_group, expected_answer, sort_order)
on conflict (id) do update
set
  prompt = excluded.prompt,
  explanation = excluded.explanation,
  difficulty = excluded.difficulty,
  points = excluded.points,
  topic = excluded.topic,
  is_bonus = excluded.is_bonus,
  question_group = excluded.question_group,
  expected_answer = excluded.expected_answer,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;

with remaining_days as (
  select d.day_number
  from public.course_days d
  where d.course_id = '7f9b0f4b-b75d-4a25-a5dc-0a337f92aa01'
    and d.day_number between 2 and 10
)
insert into public.question_options (id, question_id, option_text, is_correct, sort_order)
select
  option_id,
  question_id,
  option_text,
  is_correct,
  sort_order
from remaining_days
cross join lateral (
  values
    (
      ('7f9b0f4b-b75d-4a26-a6df-' || lpad(to_hex(day_number * 4096 + 101), 12, '0'))::uuid,
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 1), 12, '0'))::uuid,
      (day_number + 1)::text,
      false,
      1
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6df-' || lpad(to_hex(day_number * 4096 + 102), 12, '0'))::uuid,
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 1), 12, '0'))::uuid,
      (day_number + 2)::text,
      true,
      2
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6df-' || lpad(to_hex(day_number * 4096 + 103), 12, '0'))::uuid,
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 1), 12, '0'))::uuid,
      (day_number + 3)::text,
      false,
      3
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6df-' || lpad(to_hex(day_number * 4096 + 104), 12, '0'))::uuid,
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 1), 12, '0'))::uuid,
      (day_number + 4)::text,
      false,
      4
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6df-' || lpad(to_hex(day_number * 4096 + 401), 12, '0'))::uuid,
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 4), 12, '0'))::uuid,
      (day_number * 2 - 1)::text,
      false,
      1
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6df-' || lpad(to_hex(day_number * 4096 + 402), 12, '0'))::uuid,
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 4), 12, '0'))::uuid,
      (day_number * 2)::text,
      true,
      2
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6df-' || lpad(to_hex(day_number * 4096 + 403), 12, '0'))::uuid,
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 4), 12, '0'))::uuid,
      (day_number * 2 + 1)::text,
      false,
      3
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6df-' || lpad(to_hex(day_number * 4096 + 404), 12, '0'))::uuid,
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 4), 12, '0'))::uuid,
      (day_number * 2 + 2)::text,
      false,
      4
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6df-' || lpad(to_hex(day_number * 4096 + 601), 12, '0'))::uuid,
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 6), 12, '0'))::uuid,
      (day_number + 1)::text,
      false,
      1
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6df-' || lpad(to_hex(day_number * 4096 + 602), 12, '0'))::uuid,
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 6), 12, '0'))::uuid,
      (day_number * 2)::text,
      true,
      2
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6df-' || lpad(to_hex(day_number * 4096 + 603), 12, '0'))::uuid,
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 6), 12, '0'))::uuid,
      (day_number * 2 + 1)::text,
      false,
      3
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6df-' || lpad(to_hex(day_number * 4096 + 604), 12, '0'))::uuid,
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 6), 12, '0'))::uuid,
      (day_number * 2 + 2)::text,
      false,
      4
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6df-' || lpad(to_hex(day_number * 4096 + 801), 12, '0'))::uuid,
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 8), 12, '0'))::uuid,
      (day_number * 2 - 1)::text,
      false,
      1
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6df-' || lpad(to_hex(day_number * 4096 + 802), 12, '0'))::uuid,
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 8), 12, '0'))::uuid,
      (day_number * 2)::text,
      true,
      2
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6df-' || lpad(to_hex(day_number * 4096 + 803), 12, '0'))::uuid,
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 8), 12, '0'))::uuid,
      (day_number * 2 + 1)::text,
      false,
      3
    ),
    (
      ('7f9b0f4b-b75d-4a26-a6df-' || lpad(to_hex(day_number * 4096 + 804), 12, '0'))::uuid,
      ('7f9b0f4b-b75d-4a26-a6de-' || lpad(to_hex(day_number * 256 + 8), 12, '0'))::uuid,
      (day_number * 2 + 2)::text,
      false,
      4
    )
) as options(option_id, question_id, option_text, is_correct, sort_order)
on conflict (id) do update
set
  option_text = excluded.option_text,
  is_correct = excluded.is_correct,
  sort_order = excluded.sort_order;

-- DAY 1 LIVE SYNC START
update public.course_days set
  title = 'Фундамент - числа и действия',
  subtitle = '',
  description = 'КРАТКА ФОРМУЛА ЗА УЧЕНЕ:


Първо научи видовете числа, после знаците при действия, след това делимост, НОД и НОК, и накрая абсолютна стойност.
Това е основата, върху която стъпват много задачи от НВО.',
  estimated_minutes = 45,
  is_published = true,
  sort_order = 1
where id = '7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11';

delete from public.question_options where question_id in (select id from public.questions where course_day_id = '7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11');
delete from public.questions where course_day_id = '7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11';
delete from public.lesson_sections where lesson_id in (select id from public.lessons where course_day_id = '7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11');
delete from public.lessons where course_day_id = '7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11';

insert into public.lessons (
  id, course_day_id, title, type, content, video_url, estimated_minutes, sort_order, is_published, video_provider, video_title, video_thumbnail_url, video_duration_seconds, video_status, video_storage_path
) values
  ('050a21a9-4e56-4696-a325-09528680f2ed','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11','Ден 1: Фундамент — числа и действия','theory','Днес преговаряме естествени и рационални числа, делимост, абсолютна стойност и действия с рационални числа.','https://www.youtube.com/watch?v=tptNqwpJ0dY&list=PLbbGPvgLwYY-1patrekcTaJ_Ymrjb9KJc',12,1,true,'youtube',null,'https://www.youtube.com/watch?v=tptNqwpJ0dY&list=PLbbGPvgLwYY-1patrekcTaJ_Ymrjb9KJc',0,'published','');

insert into public.lesson_sections (id, lesson_id, title, section_type, content, sort_order) values
  ('6730d8e0-c0ff-47f9-bc4a-28136f0b98ae','050a21a9-4e56-4696-a325-09528680f2ed','Естествени и рационални числа','theory','Естествените числа са числата, с които броим: 1, 2, 3, 4, 5 и така нататък. Понякога към тях се включва и 0.

Рационалните числа са всички числа, които могат да се запишат като дроб a/b, където b не е 0.

Примери за рационални числа са:
5, -3, 1/2, -3/4, 0,75 и 1,25.

Важно правило: на 0 не се дели.',1),
  ('990907d5-f61e-4a57-844c-2c12796b138f','050a21a9-4e56-4696-a325-09528680f2ed','Прости и съставни числа','theory','Естествените числа могат да бъдат прости или съставни според това на колко числа се делят без остатък.

Просто число е естествено число, което има точно два делителя: 1 и самото число.

Примери:
2, 3, 5, 7, 11 и 13 са прости числа.

Числото 2 е единственото четно просто число. Всички други четни числа, по-големи от 2, са съставни, защото се делят на 2.

Съставно число е естествено число, което има повече от два делителя.

Примери:
4, 6, 8, 9, 10 и 12 са съставни числа.

Например числото 6 е съставно, защото се дели на 1, 2, 3 и 6.

Важно:
Числото 1 не е нито просто, нито съставно число. То има само един делител — самото себе си.

Правило:
Ако едно естествено число има точно два делителя, то е просто.
Ако има повече от два делителя, то е съставно.
Числото 1 не е нито просто, нито съставно.

Пример:
Определи дали числото 15 е просто или съставно.

Решение:
Делителите на 15 са 1, 3, 5 и 15.
Числото 15 има повече от два делителя, затова е съставно число.

Капан:
Не бъркай числото 1 с просто число. Просто число трябва да има точно два делителя, а 1 има само един.

Мини задача:
Определи кои от числата са прости и кои са съставни:

2, 4, 7, 9, 11, 15

Отговор:
Прости числа: 2, 7, 11
Съставни числа: 4, 9, 15',2),
  ('150bf32c-02e5-42b4-ae9a-5db244d7904e','050a21a9-4e56-4696-a325-09528680f2ed','Делимост','theory','Казваме, че едно число се дели на друго, когато при делението няма остатък.

Пример:
18 се дели на 3, защото 18 : 3 = 6.

За НВО е важно да знаеш признаците за делимост:

На 2 се делят числата, които завършват на 0, 2, 4, 6 или 8.
На 3 се делят числата, при които сборът на цифрите се дели на 3.
На 5 се делят числата, които завършват на 0 или 5.
На 9 се делят числата, при които сборът на цифрите се дели на 9.
На 10 се делят числата, които завършват на 0.',3),
  ('c9c663b4-49b2-4ca6-a01a-120a1a4f1ce6','050a21a9-4e56-4696-a325-09528680f2ed','Абсолютна стойност','theory','Абсолютната стойност показва разстоянието на числото от нулата.

Затова абсолютната стойност винаги е положителна или 0.

Примери:
|5| = 5
|-5| = 5
|0| = 0

Важно:
|-12| = 12, защото разстоянието от -12 до 0 е 12.',4),
  ('0eb03b4d-f31e-41b5-be27-67a381cabc75','050a21a9-4e56-4696-a325-09528680f2ed','Действия с рационални числа','theory','При събиране на числа с еднакви знаци събираме числата и запазваме знака.

Пример:
-4 + (-3) = -7

При числа с различни знаци изваждаме по-малкото от по-голямото и вземаме знака на числото с по-голяма абсолютна стойност.

Пример:
-8 + 3 = -5

При изваждане можем да го превърнем в събиране с противоположното число.

Пример:
5 - (-2) = 5 + 2 = 7',5),
  ('df982e06-3f02-4be6-9a30-938cd72f549c','050a21a9-4e56-4696-a325-09528680f2ed','Как да разпознаваш задачите','theory','Ако задачата пита кое число е рационално, търси число, което може да се запише като дроб.

Ако задачата пита за делимост, провери признаците за делимост.

Ако има израз с | |, това е абсолютна стойност.

Ако има отрицателни числа, внимавай със знаците.

Най-чести грешки:
- забравяне, че |-5| = 5
- грешка при изваждане на отрицателно число
- объркване на признаците за делимост',6);

insert into public.questions (
  id, course_day_id, lesson_id, question_type, prompt, explanation, expected_answer, difficulty, points, topic, is_bonus, sort_order, is_published, question_group, source, exam_type, subtopic, image_url, source_year
) values
  ('ee47b70d-a0dd-40ba-a616-62ff7adee9a0','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'multiple_choice','Стойността на израза 25 − 95² е:','95²=9025, следователно 25−9025=−9000.','А','easy',2,'Числа и действия',true,1,true,'bonus','НВО 2011, задача 1','НВО',null,null,2011),
  ('754c87b0-b2ff-4f40-9ffc-cf77d60b71fb','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'multiple_choice','Колко е -3 + 7?','-3 + 7 = 4, защото от 7 изваждаме 3.',null,'easy',1,'Рационални числа',true,1,true,'practice',null,null,null,null,null),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad01','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'multiple_choice','Кое число е рационално?','Рационалното число може да се запише като дроб с ненулев знаменател.',null,'easy',10,'рационални числа',true,1,true,'practice',null,null,null,null,null),
  ('d065c963-605c-f0cf-efa6-6130519329b2','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11','050a21a9-4e56-4696-a325-09528680f2ed','multiple_choice','Стойността на израза 15 − (8 + b) при b = −9 е:','Заместваме b = −9. Получаваме 15 − (8 + (−9)) = 15 − (−1) = 16.',null,'easy',2,'Действия с рационални числа',true,2,true,'bonus','НВО 2012, задача 1','НВО','Отрицателни числа и скоби',null,2012),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad02','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'open_answer','Пресметни |-12|.','Абсолютната стойност е разстоянието до 0.','12','easy',10,'абсолютна стойност',true,2,true,'practice',null,null,null,null,null),
  ('5fbda345-d4b8-4bf2-b78f-1e18e93ea296','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'multiple_choice','Кое е разлагането на 60 на прости множители?','60 = 6 · 10 = 2 · 3 · 2 · 5 = 2 · 2 · 3 · 5.',null,'easy',1,'Делимост',true,2,true,'practice',null,null,null,null,null),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad03','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'true_false','Числото 1 е просто число.','Простите числа имат точно два делителя, а 1 има само един.','Невярно','easy',10,'прости числа',true,3,true,'practice',null,null,null,null,null),
  ('f80110d4-f091-4652-bdc2-0fe075f22d0e','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'true_false','Вярно ли е, че |-5| = -5?','Абсолютната стойност показва разстояние от нулата, затова |-5| = 5.',null,'easy',1,'Абсолютна стойност',true,3,true,'practice',null,null,null,null,null),
  ('07052cd0-04f9-3f76-6cba-bc7c79c3a5ac','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11','050a21a9-4e56-4696-a325-09528680f2ed','multiple_choice','Стойността на израза 15² − 5² е:','Пресмятаме степените: 15² = 225 и 5² = 25. Следователно 225 − 25 = 200.',null,'easy',2,'Числа и действия',true,3,true,'bonus','НВО 2013, задача 1','НВО','Степени и числови изрази',null,2013),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad04','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'multiple_choice','Кое е разлагането на 30 на прости множители?','30 = 2 · 3 · 5.',null,'medium',10,'делимост',true,4,true,'practice',null,null,null,null,null),
  ('344be7b4-8d6c-8f9d-b581-2224d9ceb7e4','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11','050a21a9-4e56-4696-a325-09528680f2ed','multiple_choice','Частното 50,05 : 10 е равно на:','При деление на 10 десетичната запетая се премества с една позиция наляво: 50,05 : 10 = 5,005.',null,'easy',2,'Десетични дроби',true,4,true,'bonus','НВО 2015, задача 1','НВО','Деление на десетично число с 10',null,2015),
  ('e3b52ee4-9d71-4671-a8b9-efff3e7563d5','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'multiple_choice','Колко е 3/4 + 1/2?','1/2 = 2/4, затова 3/4 + 2/4 = 5/4.',null,'medium',2,'Дроби',true,4,true,'practice',null,null,null,null,null),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad05','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'multiple_choice','Колко е 3/4 + 1/2 ?','Привеждаме към общ знаменател 4.',null,'medium',10,'дроби',true,5,true,'practice',null,null,null,null,null),
  ('9ab53845-2e0f-4067-4ef0-28d8bfebf2ca','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11','050a21a9-4e56-4696-a325-09528680f2ed','multiple_choice','Стойността на израза 530 · 5 − 5 · 30 е:','Първо извършваме умноженията: 530 · 5 = 2650 и 5 · 30 = 150. След това 2650 − 150 = 2500.',null,'easy',2,'Числа и действия',true,5,true,'bonus','НВО 2015, задача 2','НВО','Ред на действията',null,2015),
  ('1a453caa-5f8e-43c1-9517-0e65da240f00','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'multiple_choice','Колко е 2 - 3/5?','2 = 10/5, затова 10/5 - 3/5 = 7/5.',null,'medium',2,'Дроби',true,5,true,'practice',null,null,null,null,null),
  ('024f95c7-7379-6b9c-60ea-9792e8b16a01','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11','050a21a9-4e56-4696-a325-09528680f2ed','multiple_choice','Числото 5,08 е равно на числото:','5,08 = 5 + 0,08. А 0,08 = 8/100 = 2/25. Следователно 5,08 = 5 2/25.',null,'easy',2,'Рационални числа',true,6,true,'bonus','НВО 2020, задача 2','НВО','Десетична дроб като обикновена дроб',null,2020),
  ('08b0c328-ab41-45a8-9cf8-7878e1e65054','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'multiple_choice','Стойността на израза 2021 - 2020 · (-0,1) е:','Когато изваждаме отрицателно число, това става събиране.',null,'easy',2,'Действия с рационални числа',true,7,true,'bonus','НВО 2021, задача 1','Реална задача от НВО','Действия с отрицателни десетични числа',null,2021),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad08','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'true_false','Всяко естествено число е рационално.','Всяко естествено число n може да се запише като n/1.','Вярно','easy',10,'рационални числа',true,8,true,'quiz',null,null,null,null,null),
  ('ec1ae078-7aa3-4015-9e12-31c4092a4778','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'multiple_choice','Стойността на израза −20,5 + 0,5 · (−1/5) е:','Първо пресмятаме произведението: 0,5 · (−1/5) = −0,1. След това −20,5 + (−0,1) = −20,6.',null,'easy',2,'Действия с рационални числа',true,8,true,'bonus','НВО 2022, задача 1','НВО','Десетични дроби, отрицателни числа и ред на действията',null,2022),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad11','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'multiple_choice','Кое от числата е естествено число?','Естествените числа са числата, с които броим: 1, 2, 3, 4… Числото 12 е естествено число.',null,'easy',10,'natural_numbers',true,8,true,'quiz',null,null,null,null,null),
  ('ea35aa02-6a18-0f57-0890-b66e4150e4dd','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11','050a21a9-4e56-4696-a325-09528680f2ed','multiple_choice','Колко от числата 1, 3, 9, 11, 15, 18, 21, 23, 27, 29, 31 са прости?','Простите числа са 3, 11, 23, 29 и 31. Числото 1 не е просто, а 9, 15, 18, 21 и 27 са съставни. Общо простите числа са 5.',null,'medium',2,'Числа',true,9,true,'bonus','НВО 2023, задача 2','НВО','Прости и съставни числа',null,2023),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad12','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'multiple_choice','Кое твърдение е вярно?','Всяко цяло число може да се запише като дроб със знаменател 1. Например 7 = 7/1.',null,'easy',10,'rational_numbers',true,9,true,'quiz',null,null,null,null,null),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad09','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'multiple_choice','Кое е съставно число?','Съставното число има повече от два делителя.',null,'easy',10,'прости числа',true,9,true,'quiz',null,null,null,null,null),
  ('cd098eed-c037-b6c0-7fce-b30e5db59bc1','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11','050a21a9-4e56-4696-a325-09528680f2ed','multiple_choice','Стойността на израза 5 − 5x при x = −1/5 е:','Заместваме x = −1/5. Получаваме 5 − 5 · (−1/5) = 5 − (−1) = 6.',null,'easy',2,'Действия с рационални числа',true,10,true,'bonus','НВО 2024, задача 2','НВО','Заместване на дроб в израз',null,2024),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad13','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'multiple_choice','Кое от числата се дели на 3?','Числото 135 се дели на 3, защото 1 + 3 + 5 = 9, а 9 се дели на 3.',null,'easy',10,'divisibility',true,10,true,'quiz',null,null,null,null,null),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad14','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'multiple_choice','Колко е |-12|?','Абсолютната стойност показва разстояние от 0. Затова |-12| = 12.',null,'easy',10,'absolute_value',true,11,true,'quiz',null,null,null,null,null),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad15','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'multiple_choice','Пресметни: 5 - (-2)','Изваждането на отрицателно число се превръща в събиране: 5 - (-2) = 5 + 2 = 7.',null,'easy',10,'integer_operations',true,12,true,'quiz',null,null,null,null,null),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad16','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'multiple_choice','Пресметни: -8 + 5','При събиране на числа с различни знаци изваждаме 5 от 8 и запазваме знака на числото с по-голяма абсолютна стойност: -8 + 5 = -3.',null,'easy',10,'integer_operations',true,13,true,'quiz',null,null,null,null,null),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad17','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'multiple_choice','Кое е вярно?','Минус по плюс дава минус. Затова (-4) · 5 = -20.',null,'easy',10,'integer_operations',true,14,true,'quiz',null,null,null,null,null),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ad20','7f9b0f4b-b75d-4a25-a5dc-0a337f92aa11',null,'multiple_choice','Кое число е просто?','Просто число има точно два делителя: 1 и самото число. Числото 11 има делители 1 и 11.',null,'easy',10,'prime_composite',true,17,true,'quiz',null,null,null,null,null);

insert into public.question_options (id, question_id, option_text, is_correct, sort_order) values
  ('710c21f2-fda9-f0e7-e338-b6964acfb12a','cd098eed-c037-b6c0-7fce-b30e5db59bc1','0',false,1),
  ('745eb939-9ad5-4512-a93f-e1ae11e7849a','754c87b0-b2ff-4f40-9ffc-cf77d60b71fb','2',false,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae45','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad16','-13',false,1),
  ('0a5fc7f6-136a-8f68-be1f-d1bf0466c72a','07052cd0-04f9-3f76-6cba-bc7c79c3a5ac','10',false,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae49','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad17','(-4) · 5 = 20',false,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae05','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad03','Вярно',false,1),
  ('1dc6b809-d57d-4109-b6bc-789a37c34ae7','08b0c328-ab41-45a8-9cf8-7878e1e65054','-0,1',false,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae41','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad15','3',false,1),
  ('04f3fb30-783a-257d-fe03-fccc74524217','d065c963-605c-f0cf-efa6-6130519329b2','−15',false,1),
  ('1080ebde-95aa-4aad-b8c2-d9e8f6fff590','ee47b70d-a0dd-40ba-a616-62ff7adee9a0','А) −9 000',true,1),
  ('1c6fec7d-8709-4f93-8c2c-5f2cfb1db4f1','5fbda345-d4b8-4bf2-b78f-1e18e93ea296','2 · 3 · 10',false,1),
  ('7c289cc7-46f5-4436-b386-8032ed3714a5','f80110d4-f091-4652-bdc2-0fe075f22d0e','Вярно',false,1),
  ('47ed5df5-4f95-477b-a531-763624f28fd4','e3b52ee4-9d71-4671-a8b9-efff3e7563d5','4/6',false,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae07','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad04','2 · 15',false,1),
  ('301575cc-ab9e-9de9-37d0-211460d8d502','ea35aa02-6a18-0f57-0890-b66e4150e4dd','4',false,1),
  ('2d243f15-ee47-42d3-ab8b-63256fc1a7e1','1a453caa-5f8e-43c1-9517-0e65da240f00','7/5',true,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae01','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad01','π',false,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae19','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad08','Вярно',true,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae21','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad09','11',false,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae25','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad11','-3',false,1),
  ('be0756f6-2c49-4332-b0d5-b7f13b40f740','ec1ae078-7aa3-4015-9e12-31c4092a4778','−20,6',true,1),
  ('1c2c7bed-df37-e917-8b77-5324b2f46f57','024f95c7-7379-6b9c-60ea-9792e8b16a01','5 4/5',false,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae29','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad12','Всяко рационално число е естествено число.',false,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae61','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad20','1',false,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae11','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad05','4/4',false,1),
  ('de1ecea1-17bc-d10f-d2b0-50e65c1023a2','9ab53845-2e0f-4067-4ef0-28d8bfebf2ca','0',false,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae33','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad13','124',false,1),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae37','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad14','-12',false,1),
  ('5c89a336-732a-f93d-d231-05ccfab32765','344be7b4-8d6c-8f9d-b581-2224d9ceb7e4','50,5',false,1),
  ('c60b7a66-4600-4246-8f91-53e5084e3f73','1a453caa-5f8e-43c1-9517-0e65da240f00','-1/5',false,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae42','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad15','-3',false,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae08','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad04','2 · 3 · 5',true,2),
  ('bab8c2ae-2294-f8b1-e1aa-f88cf081ad39','07052cd0-04f9-3f76-6cba-bc7c79c3a5ac','20',false,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae62','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad20','9',false,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae46','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad16','-3',true,2),
  ('6a92020c-65eb-4434-b1b3-ce5ad2668036','754c87b0-b2ff-4f40-9ffc-cf77d60b71fb','4',true,2),
  ('93594bb8-b7ac-422e-9c7e-5de0f515e35f','ec1ae078-7aa3-4015-9e12-31c4092a4778','−20,4',false,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae20','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad08','Невярно',false,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae50','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad17','(-4) · 5 = -20',true,2),
  ('e4d33ea5-87e8-fe42-6d08-d712b1dc9a02','9ab53845-2e0f-4067-4ef0-28d8bfebf2ca','500',false,2),
  ('49ea08b7-3c6c-9733-24af-81984fa6c185','d065c963-605c-f0cf-efa6-6130519329b2','−2',false,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae22','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad09','13',false,2),
  ('b8838e0a-f04c-4fad-ac48-f286785c8192','08b0c328-ab41-45a8-9cf8-7878e1e65054','1',false,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae02','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad01','√2',false,2),
  ('f826aa46-d003-d5e7-3615-c67a34348c60','024f95c7-7379-6b9c-60ea-9792e8b16a01','5 2/25',true,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae30','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad12','Всяко цяло число е рационално число.',true,2),
  ('cc7ff4b1-53bd-41a6-bab8-69b9e7f823f9','ee47b70d-a0dd-40ba-a616-62ff7adee9a0','Б) −8 400',false,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae26','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad11','0.5',false,2),
  ('ebbe049e-b4aa-4020-b169-33377fe73d0c','5fbda345-d4b8-4bf2-b78f-1e18e93ea296','2 · 2 · 3 · 5',true,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae06','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad03','Невярно',true,2),
  ('bd1e1d48-a0de-9846-ce4e-d4db16665acc','ea35aa02-6a18-0f57-0890-b66e4150e4dd','5',true,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae12','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad05','5/4',true,2),
  ('66c6af15-bf65-4398-bf0b-d132708b3ce8','f80110d4-f091-4652-bdc2-0fe075f22d0e','Грешно',true,2),
  ('9e450334-7511-1355-f98c-d19cfb4af9ca','344be7b4-8d6c-8f9d-b581-2224d9ceb7e4','5,05',false,2),
  ('8817f670-64a2-4af2-954c-10aa6833b6d7','e3b52ee4-9d71-4671-a8b9-efff3e7563d5','5/4',true,2),
  ('f9755532-c9b3-88dc-250f-21a6b7d04d4b','cd098eed-c037-b6c0-7fce-b30e5db59bc1','4',false,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae38','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad14','0',false,2),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae34','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad13','135',true,2),
  ('35e0062b-a018-6c48-c6a6-fe249ec8d730','024f95c7-7379-6b9c-60ea-9792e8b16a01','5 1/125',false,3),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae03','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad01','3/5',true,3),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae09','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad04','5 · 6',false,3),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae13','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad05','6/4',false,3),
  ('940479fa-65a8-4f5c-9bcf-882fa664c364','754c87b0-b2ff-4f40-9ffc-cf77d60b71fb','-4',false,3),
  ('f5059443-3198-4dde-92a7-23f1bbf4a9d2','5fbda345-d4b8-4bf2-b78f-1e18e93ea296','4 · 15',false,3),
  ('ca50e407-48fa-46ca-a4af-e2c1c36bb55d','e3b52ee4-9d71-4671-a8b9-efff3e7563d5','1',false,3),
  ('3efb9ddd-b396-4645-bfb5-caf3fafd2da3','1a453caa-5f8e-43c1-9517-0e65da240f00','5/7',false,3),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae23','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad09','21',true,3),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae27','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad11','12',true,3),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae63','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad20','11',true,3),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae31','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad12','0 не е цяло число.',false,3),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae35','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad13','152',false,3),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae39','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad14','12',true,3),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae43','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad15','7',true,3),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae47','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad16','3',false,3),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae51','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad17','(-4) · (-5) = -20',false,3),
  ('3d565b57-dafd-4eff-a060-a03ebbb9a42b','08b0c328-ab41-45a8-9cf8-7878e1e65054','2223',true,3),
  ('913400c6-add0-41b4-80ad-e369d03116ad','ee47b70d-a0dd-40ba-a616-62ff7adee9a0','В) −6 650',false,3),
  ('9b74f613-a3d7-0bd3-a43c-60f7dffd43f1','d065c963-605c-f0cf-efa6-6130519329b2','14',false,3),
  ('136be499-96b4-bddf-9731-e248eca005cd','07052cd0-04f9-3f76-6cba-bc7c79c3a5ac','100',false,3),
  ('dc4c0806-5391-7654-a69e-93f270d2a600','344be7b4-8d6c-8f9d-b581-2224d9ceb7e4','500,5',false,3),
  ('4ceaa0c1-e9d1-f3cb-b622-395881dd3d2a','9ab53845-2e0f-4067-4ef0-28d8bfebf2ca','2500',true,3),
  ('b55e9e9e-a428-7ebe-8804-57ba1e6c8001','ea35aa02-6a18-0f57-0890-b66e4150e4dd','6',false,3),
  ('33fc2fba-eeba-82db-a27a-a9ceb4a4d71e','cd098eed-c037-b6c0-7fce-b30e5db59bc1','6',true,3),
  ('9d0baf38-6103-4f1c-990c-7b98f6d4bc0c','ec1ae078-7aa3-4015-9e12-31c4092a4778','−4',false,3),
  ('0cbf7b87-cb1e-4cd6-86b9-b5b7e11594bc','ec1ae078-7aa3-4015-9e12-31c4092a4778','4',false,4),
  ('3159c8bf-7e24-03dc-ed46-ae6137d57624','07052cd0-04f9-3f76-6cba-bc7c79c3a5ac','200',true,4),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae40','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad14','24',false,4),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae36','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad13','221',false,4),
  ('414b49d7-1bbf-14c4-5a58-83dfa1e6723e','cd098eed-c037-b6c0-7fce-b30e5db59bc1','10',false,4),
  ('7db0c2c5-e954-d012-1b64-5d13beff620e','344be7b4-8d6c-8f9d-b581-2224d9ceb7e4','5,005',true,4),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae32','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad12','На 0 може да се дели.',false,4),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae64','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad20','15',false,4),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae10','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad04','3 · 10',false,4),
  ('901c5539-0e5e-2737-1e80-d19b82397ced','9ab53845-2e0f-4067-4ef0-28d8bfebf2ca','2650',false,4),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae28','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad11','-7/2',false,4),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae24','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad09','29',false,4),
  ('415f5c72-dde3-48d8-bde0-712124e50128','1a453caa-5f8e-43c1-9517-0e65da240f00','13/5',false,4),
  ('4cc146de-14c7-da5b-0ae7-da0d3971ec6f','024f95c7-7379-6b9c-60ea-9792e8b16a01','508/1000',false,4),
  ('e9d3f20c-c86c-4412-8dc9-8fbc8e0790cd','e3b52ee4-9d71-4671-a8b9-efff3e7563d5','3/8',false,4),
  ('e751b9d0-e4a1-492d-b1f6-f595fa0d181d','5fbda345-d4b8-4bf2-b78f-1e18e93ea296','6 · 10',false,4),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae04','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad01','∞',false,4),
  ('62eae7d0-4a73-dffe-3baa-85247af7a670','ea35aa02-6a18-0f57-0890-b66e4150e4dd','7',false,4),
  ('f433c262-ea51-4d77-ad36-a0501415cda8','754c87b0-b2ff-4f40-9ffc-cf77d60b71fb','10',false,4),
  ('a092fd55-3db0-47b2-bda9-3228107ae2b9','ee47b70d-a0dd-40ba-a616-62ff7adee9a0','Г) −4 900',false,4),
  ('645e1d53-3cf2-4c16-8c3b-f1beb4a0e80c','08b0c328-ab41-45a8-9cf8-7878e1e65054','2219',false,4),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae52','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad17','4 · 5 = -20',false,4),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae14','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad05','7/4',false,4),
  ('b8e197ce-7df9-10fa-6225-3474c03f6b82','d065c963-605c-f0cf-efa6-6130519329b2','16',true,4),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae48','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad16','13',false,4),
  ('7f9b0f4b-b75d-4a25-a5dc-0a337f92ae44','7f9b0f4b-b75d-4a25-a5dc-0a337f92ad15','-7',false,4);

-- DAY 1 LIVE SYNC END

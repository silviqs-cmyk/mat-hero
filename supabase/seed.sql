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

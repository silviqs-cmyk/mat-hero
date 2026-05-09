# Day 1 Logic Map

Този документ описва текущата логика за Ден 1 в приложението, без промени по кода. Анализът е по реалния student flow в `src/app/course/[courseSlug]/day/[dayNumber]` и dashboard entrypoint-а в `src/app/dashboard`.

## 1. Routes / страници за Ден 1

Ако базата е seed-ната с текущия `supabase/seed.sql`, Day 1 е:

- course slug: `nvo-matematika-7-klas`
- day number: `1`

Основни URL-и:

- Dashboard entrypoint: `/dashboard`
- Директен URL за Ден 1: `/course/nvo-matematika-7-klas/day/1`
- Теория: `/course/nvo-matematika-7-klas/day/1/lesson`
- Видео: `/course/nvo-matematika-7-klas/day/1/video`
- Основни задачи: `/course/nvo-matematika-7-klas/day/1/practice`
- Тест: `/course/nvo-matematika-7-klas/day/1/quiz`
- Резултат: `/course/nvo-matematika-7-klas/day/1/results`

Важно:

- Няма отделен student route за бонус задачи като `/course/.../day/1/bonus`.
- В `StudentDayLayout` достъпът до day routes минава през `requireStudent()`.

## 2. Компоненти

### Layout / auth

- `src/app/course/[courseSlug]/day/[dayNumber]/layout.tsx`
- `requireStudent()` от `src/lib/auth/server.ts`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- `NeonButton`
- `NeonCard`
- `SectionHeader`
- `Badge`

### Day screen / overview

- `StudentDayScreen`
- `StudentDayOverview`
- `DayPlanCard`
- `DayTimeline`
- `InfoCard`
- `LearningOutcomes`

### Lesson / theory

- `CourseLessonPage`
- `MascotCharacter`
- `InfoCard`

### Video

- `CourseVideoPage`

### Practice

- `CoursePracticePage`
- `StudentQuestionFlow`
- `AnswerOption`
- `FormInput`

### Quiz

- `CourseQuizPage`
- `StudentQuestionFlow`

### Bonus

- Няма отделна student bonus страница.
- Има latent support в `StudentQuestionFlow` за `mode="bonus"`, но не се използва от route.

### Result

- `CourseDayResultsPage`
- `ProgressBar`
- `ScoreCard`

### Feedback popup / modal

- `AnswerFeedbackModal`
- `FeedbackMascot`

### MatHero / mascot

- `MascotCharacter`
- `AnimatedHeroMascot`
- `FeedbackMascot`

## 3. Данни от Supabase

### `courses`

Използвани полета:

- `id`
- `slug`
- `title`
- `duration_days`
- `is_published`

Кога се чете:

- dashboard
- day overview
- lesson/video/practice/quiz/results

Кога се записва:

- не се записва в student flow

Филтри:

- `is_published = true` в `getCourseDay()`
- без филтър по `day_number`
- без филтър по `question_group`

### `course_days`

Използвани полета:

- `id`
- `course_id`
- `day_number`
- `title`
- `subtitle`
- `description`
- `estimated_minutes`
- `sort_order`
- `is_published`

Кога се чете:

- dashboard/day overview
- всички day pages

Кога се записва:

- не се записва в student flow

Филтри:

- `day_number = 1` косвено през route `/day/1`
- `is_published = true`

### `lessons`

Използвани полета:

- `id`
- `course_day_id`
- `title`
- `type`
- `content`
- `video_url`
- `estimated_minutes`
- `sort_order`
- `video_status` се зарежда, но почти не се ползва

Кога се чете:

- overview
- lesson
- video

Кога се записва:

- не се записва в student flow

Филтри:

- `course_day_id = day.id`
- `is_published = true`

### `lesson_sections`

Използвани полета:

- `id`
- `lesson_id`
- `title`
- `section_type`
- `content`
- `sort_order`

Кога се чете:

- lesson page
- overview derived content

Кога се записва:

- не се записва

Филтри:

- `lesson_id = lesson.id`
- няма `is_published` филтър

### `questions`

Използвани полета:

- `id`
- `course_day_id`
- `lesson_id`
- `question_type`
- `prompt`
- `explanation`
- `expected_answer`
- `difficulty`
- `points`
- `topic`
- `is_bonus`
- `question_group`
- `sort_order`
- `is_published`

Кога се чете:

- overview
- practice
- quiz
- results

Кога се записва:

- не се записва директно от student flow

Филтри:

- `course_day_id = day.id`
- `is_published = true`
- `question_group` се филтрира в JavaScript чрез `resolveQuestionGroup()`

### `question_options`

Използвани полета:

- `id`
- `question_id`
- `option_text`
- `is_correct`
- `sort_order`

Кога се чете:

- practice
- quiz

Кога се записва:

- не се записва

Филтри:

- `question_id = question.id`

### `user_progress`

Използвани полета:

- `user_id`
- `course_id`
- `current_day_number`
- `completed_days`
- `total_xp`
- `streak_days`
- `last_active_at`

Кога се чете:

- dashboard
- day routes
- practice
- quiz

Кога се записва:

- само в края на quiz flow

Филтри:

- `user_id`
- `course_id`

### `user_answers`

Използвани полета:

- `user_id`
- `question_id`
- `selected_option_id`
- `open_answer`
- `is_correct`
- `points_earned`
- `time_spent_seconds`
- `answered_at`

Кога се чете:

- results page

Кога се записва:

- при всеки submit на отговор

Филтри:

- при запис: няма day filter
- при четене: първо се намират `questions.id` за деня, после `user_answers` по тези IDs

### `day_results`

Използвани полета:

- `user_id`
- `course_day_id`
- `score`
- `total_questions`
- `percentage`
- `weak_topics`
- `completed_at`

Кога се чете:

- results page

Кога се записва:

- в края на quiz flow

Филтри:

- `user_id`
- `course_day_id`

### Допълнителна таблица: `profiles`

Използва се за auth/current user, макар да не е част от основния списък.

## 4. Flow на ученика

### Dashboard

Какво вижда:

- текущия ден и плана за деня

Компонент:

- `DashboardClient`
- `StudentDayOverview`

Данни:

- `courses`
- `course_days`
- `lessons`
- `lesson_sections`
- `questions`
- `user_progress`

Следващи бутони:

- `Теория и пример`
- `Задачи`
- `Тест за деня`
- `За още прогрес`
- `Виж видео`
- `Започни урока`

### Ден 1 overview

Какво вижда:

- summary на Ден 1
- теория/пример cards
- timeline

Компонент:

- `StudentDayScreen`
- `StudentDayOverview`

Данни:

- `courses`
- `course_days`
- `lessons`
- `lesson_sections`
- `questions`
- `user_progress`

Следващи бутони:

- `Виж видео`
- `Започни урока`
- CTA в `DayPlanCard`

### Теория

Какво вижда:

- lesson title
- day description
- lesson sections
- теория и пример

Компонент:

- `CourseLessonPage`

Данни:

- `course_days`
- `lessons`
- `lesson_sections`
- fallback към `questions` за примерен текст

Следващи бутони:

- `Гледай видеото` или `Към задачите`
- `Продължи към задачите`

### Видео

Какво вижда:

- embed/file/external video представяне

Компонент:

- `CourseVideoPage`

Данни:

- `lessons.video_url`
- `course_days`

Следващи бутони:

- `Към урока`
- `Към задачите`
- `Оригинал`

### Основни задачи

Какво вижда:

- въпроси от practice групата
- popup feedback след всеки отговор

Компонент:

- `CoursePracticePage`
- `StudentQuestionFlow mode="practice"`

Данни:

- `questions`
- `question_options`
- `user_progress`
- `profiles`

Следващ бутон:

- при последен въпрос: `Към теста`

### Тест

Какво вижда:

- quiz въпросите
- popup feedback след всеки отговор

Компонент:

- `CourseQuizPage`
- `StudentQuestionFlow mode="quiz"`

Данни:

- `questions`
- `question_options`
- `user_progress`
- `profiles`

Следващ бутон:

- при последен въпрос: `Виж резултата`

### Бонус задачи

Какво вижда:

- няма реален student page

Компонент:

- няма route

Данни:

- bonus въпросите съществуват в `questions`

Следващ бутон:

- няма отделен бонус flow

### Резултат

Какво вижда:

- процент
- score
- wrong questions
- weak topics
- бутони за повторение или следващ ден

Компонент:

- `CourseDayResultsPage`

Данни:

- `day_results`
- `user_answers`
- `questions`
- `course_days`
- `courses`

Следващи бутони:

- `Повтори грешките`
- `Върни се към урока`
- `Към следващия ден`

## 5. Логика при задачите

### Зареждане

Practice и quiz страниците използват:

- `useDayQuestions(bundle.day.id, false, "practice")`
- `useDayQuestions(bundle.day.id, false, "quiz")`

Това стига до:

- `getQuestionsWithOptionsForDay()`
- `getQuestionsForDay()`

### Различаване practice / quiz / bonus

Използва се:

- `resolveQuestionGroup()` от `src/lib/questionGroups.ts`

SQL взима всички публикувани въпроси за деня, а филтърът по група е в JavaScript.

### Проверка на верен/грешен отговор

Използва се:

- `evaluateQuestionAnswer()`

### Откъде идва правилният отговор

- от `questions.expected_answer`
- или fallback към `question_options.is_correct = true`

### Откъде идва explanation

- от `questions.explanation`

### Запис на user answer

При всеки submit:

- `saveUserAnswer()` прави `insert` в `user_answers`

### Как се смята score

В края на quiz flow:

- `earnedPoints = sum(answer.pointsEarned)`
- `totalPossiblePoints = sum(question.points)`
- `percentage = round((earnedPoints / totalPossiblePoints) * 100)`

### Как се показва feedback popup

Използва се:

- `AnswerFeedbackModal`
- `FeedbackMascot`

Popup-ът се отваря при `showFeedback = true`.

### Какво става при последен въпрос

- при `practice`: route към quiz
- при `quiz`: записва `day_results` и `user_progress`, после route към `/results`

## 6. Логика при видеото

### Откъде идва `video_url`

- от `lessons.video_url`

### Как се проверява `video_status`

- текущият student flow почти не го проверява
- полето се зарежда, но не управлява показа

### Кога се показва видеото

- ако `resolveLessonVideo(video_url)` върне валиден резултат

### Desktop

- embed/file player вътре в card layout

### Mobile

- същата логика, stacked responsive layout

### Ако няма видео

- `/video` показва `EmptyState`
- lesson page пренасочва CTA към practice, ако `video_url` липсва
- overview page все още има `Виж видео` CTA

## 7. Progress логика

### Кога се обновява `user_progress`

- само в края на quiz flow

### Кога денят се счита за завършен

- когато quiz flow стигне последния въпрос и извика:
  - `saveDayResult()`
  - `upsertUserCourseProgress()`

### Кога се отключва следващ ден

- `current_day_number = max(previous, day_number + 1)`
- ограничено до `course.duration_days`

### XP логика

- към `total_xp` се добавя `earnedPoints + 25`

### `day_results`

Записват се:

- `score`
- `total_questions`
- `percentage`
- `weak_topics`
- `completed_at`

## 8. Mobile vs Desktop

### Еднаква ли е логиката

- теория: да
- видео: да
- задачи: да
- тест: да
- бонус: еднакво липсва като student route
- резултат: да

### Разлики

- основно presentation-only
- desktop: по-често двуколонен layout
- mobile: stacked layout
- quiz/practice feedback popup: desktop centered, mobile bottom-sheet

### Проблеми

- не се вижда отделна mobile-only липсваща секция
- проблемите са общи и за mobile, и за desktop

## 9. Потенциални проблеми

### Какво работи

- dashboard Day 1 overview
- lesson page
- video page
- practice page
- quiz page
- results page
- auth gate
- запис на `user_answers`
- запис на `day_results`
- update на `user_progress`

### Какво е рисково

- няма отделен student bonus route
- bonus CTA логически съществува, но не води към отделен bonus screen
- results page зарежда всички въпроси за деня с `includeBonus = true`
- `day_results` score се смята от quiz flow, а results page гледа и bonus въпроси
- `question_options` се четат N+1
- student video flow не използва реално `video_status`

### Hardcoded data

- dashboard взима `courses[0]` от `listPublishedCourses()`
- fallback-и като `current_day_number ?? 1`
- `+25 XP` е фиксирано в quiz completion логиката

### Mock data / legacy

Извън основния current flow остават legacy/mock route-ове:

- `src/app/lesson/[id]/page.tsx`
- `src/app/quiz/[dayId]/page.tsx`
- `src/app/results/page.tsx`
- `src/lib/courseDayService.ts`
- `src/hooks/useCourseDay.ts`

Те използват demo/mock логика и не са част от основния Day 1 flow.

### Null / undefined риск

- `bundle.lessons[0]` може да липсва
- `questions.length === 0` води до `EmptyState`
- `result` може да липсва в results
- `video_url` може да липсва

### Различна логика между mobile и desktop

- не се вижда различна business logic
- разликите са visual only

### Къде има нужда от подобрение

- отделен bonus student route
- по-ясно разделяне на practice / quiz / bonus в results
- video gating по `video_status`
- по-строг избор на активен курс в dashboard
- изчистване на legacy/mock route-овете

## Seed контекст за Ден 1

Ако се използва текущият `supabase/seed.sql`, Ден 1 е seed-нат така:

- lesson: 1 публикуван theory lesson
- video: YouTube URL `https://www.youtube.com/watch?v=demo-mathero-day-1`
- lesson sections: theory, formula, example
- questions:
  - 7 practice
  - 2 quiz
  - 1 bonus

Това е полезно за локално тестване на Day 1 логиката.

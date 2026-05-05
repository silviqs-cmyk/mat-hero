import { courseDays } from "@/data/courseDays";
import type { CourseDayScreenData } from "@/types";

export const dayOneData: CourseDayScreenData = {
  id: "day_1",
  dayNumber: 1,
  totalDays: 10,
  title: "Фундамент — числа и действия",
  subtitle: "Раздел 1 и Раздел 2",
  progress: 10,
  streak: 2,
  xp: 125,
  notificationCount: 3,
  studentName: "Иван",
  studentGrade: "7 клас",
  planBadge: "Ясен ред",
  planTitle: "Как да минеш урока без хаос",
  topics: [
    {
      id: "topic_numbers",
      title: "Естествени и рационални числа",
      summary: "Кои числа влизат в отделните множества и как ги разпознаваме.",
    },
    {
      id: "topic_divisibility",
      title: "Делимост и прости числа",
      summary: "Признаци за делимост и разлагане на прости множители.",
    },
    {
      id: "topic_absolute",
      title: "Абсолютна стойност и действия",
      summary: "Модул и действия с рационални числа.",
    },
  ],
  timeline: courseDays,
  lesson: {
    id: "lesson_day_1",
    title: "Ден 1: Фундамент — числа и действия",
    badge: "Теория",
    videoDuration: "5:12 мин",
    primaryCtaHref: "/lesson/1",
    secondaryCtaHref: "/lesson/1",
    blocks: [
      {
        title: "НАЙ-ВАЖНОТО",
        tone: "cyan",
        content:
          "Започваме с Раздел 1 и Раздел 2: естествени и рационални числа, прости и съставни числа, делимост, абсолютна стойност и действия с рационални числа.",
      },
      {
        title: "ПРИМЕР",
        tone: "purple",
        content: "60 = 2 · 2 · 3 · 5\n|-5| = 5, а |3| = 3\n3/4 + 1/2 = 5/4\n2 - 3/5 = 7/5",
      },
    ],
  },
  planSteps: [
    {
      id: "plan_lesson",
      type: "lesson",
      eyebrow: "1. ПРОЧЕТИ",
      title: "Урокът",
      ctaLabel: "Теория и пример",
      tone: "purple",
      count: null,
    },
    {
      id: "plan_practice",
      type: "practice",
      eyebrow: "2. УПРАЖНИ",
      title: "10 основни задачи",
      ctaLabel: "Задачи",
      tone: "cyan",
      count: 10,
    },
    {
      id: "plan_quiz",
      type: "quiz",
      eyebrow: "3. ПРОВЕРИ",
      title: "10 въпроса",
      ctaLabel: "Тест за деня",
      tone: "green",
      count: 10,
    },
    {
      id: "plan_bonus",
      type: "bonus",
      eyebrow: "БОНУС",
      title: "10 допълнителни",
      ctaLabel: "За още прогрес",
      tone: "gold",
      count: 10,
    },
  ],
  heroBuddy: {
    title: "Супер ход!",
    message:
      "Мини първо през кратката теория, после отвори основните задачи една по една и чак накрая тръгни към теста.",
    rewardLabel: "+25 XP след тест",
  },
  outcomes: [
    "Какво са естествени и рационални числа",
    "Действия с цели и рационални числа",
    "Абсолютна стойност",
    "Приложения в задачи от НВО",
  ],
  goal: {
    title: "МОЯТА ЦЕЛ",
    target: "80+ точки на НВО",
    progress: 35,
  },
};

import type {
  AdminCourse,
  AdminStudioGraph,
  AdminTaskType,
  LessonSectionKind,
  TaskPlacement,
} from "@/types";

function createKey(prefix: string, suffix: string) {
  return `${prefix}-${suffix}`;
}

function createAnswer(key: string, text: string, isCorrect: boolean, orderIndex: number) {
  return {
    id: createKey("answer", key),
    editor_key: createKey("answer", key),
    text,
    is_correct: isCorrect,
    order_index: orderIndex,
  };
}

function createTask(input: {
  key: string;
  title: string;
  prompt: string;
  taskType: AdminTaskType;
  placement: TaskPlacement;
  explanation: string;
  expectedAnswer: string;
  orderIndex: number;
  topicId?: string | null;
  answers?: Array<{ text: string; isCorrect: boolean }>;
}) {
  return {
    id: createKey("task", input.key),
    editor_key: createKey("task", input.key),
    topic_id: input.topicId ?? null,
    title: input.title,
    prompt: input.prompt,
    task_type: input.taskType,
    placement: input.placement,
    explanation: input.explanation,
    expected_answer: input.expectedAnswer,
    order_index: input.orderIndex,
    answers: (input.answers ?? []).map((answer, index) =>
      createAnswer(`${input.key}-${index + 1}`, answer.text, answer.isCorrect, index + 1),
    ),
  };
}

function createSection(
  key: string,
  title: string,
  content: string,
  kind: LessonSectionKind,
  orderIndex: number,
) {
  return {
    id: createKey("section", key),
    editor_key: createKey("section", key),
    title,
    content,
    kind,
    order_index: orderIndex,
  };
}

const topicNumbers = createKey("topic", "numbers");
const topicDivisibility = createKey("topic", "divisibility");
const topicAbsolute = createKey("topic", "absolute");
const topicPercent = createKey("topic", "percent");

const demoCourse: AdminCourse = {
  id: createKey("course", "mathero-7"),
  editor_key: createKey("course", "mathero-7"),
  title: "MatHero Core",
  subtitle: "10 дни до увереност по математика",
  description: "Курсът е подреден по теми, а всеки ден води ученика през теория, видео и тест.",
  grade_label: "7 клас",
  accent_color: "#58dfff",
  is_published: false,
  order_index: 1,
  topics: [
    {
      id: topicNumbers,
      editor_key: topicNumbers,
      title: "Естествени и рационални числа",
      summary: "Разпознаване и подреждане на основните множества от числа.",
      theory_outline: "Видове числа, дроби, цели и рационални числа.",
      order_index: 1,
    },
    {
      id: topicDivisibility,
      editor_key: topicDivisibility,
      title: "Делимост и прости числа",
      summary: "Признаци за делимост, прости и съставни числа.",
      theory_outline: "Делители, кратни и разлагане на прости множители.",
      order_index: 2,
    },
    {
      id: topicAbsolute,
      editor_key: topicAbsolute,
      title: "Абсолютна стойност и действия",
      summary: "Модул и действия с рационални числа.",
      theory_outline: "Абсолютна стойност, ред на действията и дроби.",
      order_index: 3,
    },
    {
      id: topicPercent,
      editor_key: topicPercent,
      title: "Проценти",
      summary: "Процент от число и процентна промяна.",
      theory_outline: "Процент, част, цяло и обратни задачи.",
      order_index: 4,
    },
  ],
  days: [
    {
      id: createKey("day", "1"),
      editor_key: createKey("day", "1"),
      title: "Ден 1",
      topic: "Фундамент — числа и действия",
      summary: "Дневен маршрут през три основни теми от числата и действията.",
      is_active: true,
      order_index: 1,
      flow: ["theory", "video", "test"],
      topics: [
        {
          id: createKey("day-topic", "1-1"),
          editor_key: createKey("day-topic", "1-1"),
          topic_id: topicNumbers,
          topic_editor_key: topicNumbers,
          order_index: 1,
        },
        {
          id: createKey("day-topic", "1-2"),
          editor_key: createKey("day-topic", "1-2"),
          topic_id: topicDivisibility,
          topic_editor_key: topicDivisibility,
          order_index: 2,
        },
        {
          id: createKey("day-topic", "1-3"),
          editor_key: createKey("day-topic", "1-3"),
          topic_id: topicAbsolute,
          topic_editor_key: topicAbsolute,
          order_index: 3,
        },
      ],
      lessons: [
        {
          id: createKey("lesson", "1"),
          editor_key: createKey("lesson", "1"),
          topic_id: topicNumbers,
          title: "Ден 1: Фундамент — числа и действия",
          short_theory: "Числа, делимост, абсолютна стойност и действия с рационални числа.",
          example: "60 = 2 · 2 · 3 · 5, |-5| = 5, 3/4 + 1/2 = 5/4",
          animation_type: "percentage-bars",
          order_index: 1,
          sections: [
            createSection(
              "1-1",
              "Най-важното",
              "Започни с видовете числа, после мини през делимостта и едва след това през действията.",
              "theory",
              1,
            ),
            createSection(
              "1-2",
              "Пример",
              "Разложи 60 на прости множители и сравни |-5| и |3|, преди да смяташ с дроби.",
              "example",
              2,
            ),
          ],
          videos: [],
        },
      ],
      tasks: [
        createTask({
          key: "1-main-1",
          topicId: topicNumbers,
          title: "Разпознаване на рационално число",
          prompt: "Кое от следните е рационално число?",
          taskType: "multiple_choice",
          placement: "main",
          explanation: "Рационалните числа могат да се запишат като дроб.",
          expectedAnswer: "3/5",
          orderIndex: 1,
          answers: [
            { text: "√2", isCorrect: false },
            { text: "π", isCorrect: false },
            { text: "3/5", isCorrect: true },
            { text: "∞", isCorrect: false },
          ],
        }),
        createTask({
          key: "1-main-2",
          topicId: topicAbsolute,
          title: "Абсолютна стойност",
          prompt: "Пресметни |-12|.",
          taskType: "open_answer",
          placement: "main",
          explanation: "Абсолютната стойност е разстоянието до 0.",
          expectedAnswer: "12",
          orderIndex: 2,
        }),
      ],
      short_videos: [
        {
          id: createKey("video", "1"),
          editor_key: createKey("video", "1"),
          course_day_id: createKey("day", "1"),
          lesson_id: createKey("lesson", "1"),
          title: "Кратко видео: числа и делимост",
          description: "Бърз преговор преди теста.",
          video_url: "https://example.com/videos/day-1",
          thumbnail_url: "",
          provider: "youtube",
          duration_seconds: 312,
          order_index: 1,
          is_published: true,
        },
      ],
    },
    {
      id: createKey("day", "2"),
      editor_key: createKey("day", "2"),
      title: "Ден 2",
      topic: "Проценти и въвеждане в алгебрата",
      summary: "Денят събира процентите в отделна тема с теория, видео и тест.",
      is_active: true,
      order_index: 2,
      flow: ["theory", "video", "test"],
      topics: [
        {
          id: createKey("day-topic", "2-1"),
          editor_key: createKey("day-topic", "2-1"),
          topic_id: topicPercent,
          topic_editor_key: topicPercent,
          order_index: 1,
        },
      ],
      lessons: [
        {
          id: createKey("lesson", "2"),
          editor_key: createKey("lesson", "2"),
          topic_id: topicPercent,
          title: "Ден 2: Проценти и въвеждане в алгебрата",
          short_theory: "Процент от число, процентна промяна и първи алгебрични записи.",
          example: "20% от 150 = 30, а 3x + 2x = 5x.",
          animation_type: "fraction-stack",
          order_index: 1,
          sections: [
            createSection(
              "2-1",
              "Теория",
              "Подреди какво е цяло, какво е част и кога търсиш процента.",
              "theory",
              1,
            ),
          ],
          videos: [],
        },
      ],
      tasks: [
        createTask({
          key: "2-main-1",
          topicId: topicPercent,
          title: "Процент от число",
          prompt: "Колко е 15% от 200?",
          taskType: "multiple_choice",
          placement: "main",
          explanation: "15% = 0.15, а 0.15 × 200 = 30.",
          expectedAnswer: "30",
          orderIndex: 1,
          answers: [
            { text: "15", isCorrect: false },
            { text: "20", isCorrect: false },
            { text: "30", isCorrect: true },
            { text: "35", isCorrect: false },
          ],
        }),
      ],
      short_videos: [],
    },
  ],
};

export const adminDemoGraph: AdminStudioGraph = {
  courses: [demoCourse],
};

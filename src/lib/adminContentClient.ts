import { adminDemoGraph } from "@/lib/adminDemoData";
import { supabase } from "@/lib/supabaseClient";
import type {
  AdminCourse,
  AdminCourseDay,
  AdminLesson,
  AdminTopic,
  AdminStudioGraph,
  AdminTask,
  AdminTaskAnswer,
  ApiResponse,
  AdminDayTopic,
  LessonSection,
} from "@/types";

function withError<T>(data: T, error: string | null = null): ApiResponse<T> {
  return { data, error };
}

type CourseRow = Omit<AdminCourse, "days" | "id"> & { id?: number };
type TopicRow = Omit<AdminTopic, "id"> & { id?: number; course_id: number };
type DayRow = Omit<AdminCourseDay, "lessons" | "tasks" | "id"> & { id?: number; course_id: number };
type DayTopicRow = Omit<AdminDayTopic, "id" | "topic_editor_key"> & { id?: number; day_id: number; topic_id: number };
type LessonRow = Omit<AdminLesson, "sections" | "id"> & { id?: number; day_id: number };
type SectionRow = Omit<LessonSection, "id"> & { id?: number; lesson_id: number };
type TaskRow = Omit<AdminTask, "answers" | "id"> & { id?: number; day_id: number; lesson_section_id?: number | null; topic_id?: number | null };
type AnswerRow = Omit<AdminTaskAnswer, "id"> & { id?: number; task_id: number };

export async function getAdminStudioGraph(): Promise<ApiResponse<AdminStudioGraph>> {
  if (!supabase) {
    return withError(adminDemoGraph);
  }

  const { data: courses, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .order("order_index", { ascending: true });

  if (courseError || !courses || courses.length === 0) {
    return withError(adminDemoGraph, courseError?.message ?? null);
  }

  const courseIds = courses.map((course) => course.id);
  const { data: topics } = await supabase
    .from("course_topics")
    .select("*")
    .in("course_id", courseIds)
    .order("order_index", { ascending: true });

  const { data: days } = await supabase
    .from("course_days")
    .select("*")
    .in("course_id", courseIds)
    .order("order_index", { ascending: true });

  const dayIds = (days ?? []).map((day) => day.id);
  const { data: dayTopics } = dayIds.length
    ? await supabase.from("day_topics").select("*").in("day_id", dayIds).order("order_index", { ascending: true })
    : { data: [] as Array<Record<string, unknown>> };
  const { data: lessons } = dayIds.length
    ? await supabase
        .from("course_lessons")
        .select("*")
        .in("day_id", dayIds)
        .order("order_index", { ascending: true })
    : { data: [] as Array<Record<string, unknown>> };

  const lessonIds = (lessons ?? []).map((lesson) => lesson.id);
  const { data: sections } = lessonIds.length
    ? await supabase
        .from("lesson_sections")
        .select("*")
        .in("lesson_id", lessonIds)
        .order("order_index", { ascending: true })
    : { data: [] as Array<Record<string, unknown>> };

  const { data: tasks } = dayIds.length
    ? await supabase
        .from("content_tasks")
        .select("*")
        .in("day_id", dayIds)
        .order("order_index", { ascending: true })
    : { data: [] as Array<Record<string, unknown>> };

  const taskIds = (tasks ?? []).map((task) => task.id);
  const { data: answers } = taskIds.length
    ? await supabase
        .from("task_answers")
        .select("*")
        .in("task_id", taskIds)
        .order("order_index", { ascending: true })
    : { data: [] as Array<Record<string, unknown>> };

  const answerMap = new Map<number, AdminTaskAnswer[]>();
  (answers ?? []).forEach((answer) => {
    const current = answerMap.get(answer.task_id) ?? [];
    current.push(answer as unknown as AdminTaskAnswer);
    answerMap.set(answer.task_id, current);
  });

  const sectionMap = new Map<number, LessonSection[]>();
  const sectionKeyById = new Map<number, string>();
  (sections ?? []).forEach((section) => {
    const current = sectionMap.get(section.lesson_id) ?? [];
    current.push(section as unknown as LessonSection);
    sectionMap.set(section.lesson_id, current);
    sectionKeyById.set(section.id, section.editor_key as string);
  });

  const taskMap = new Map<number, AdminTask[]>();
  (tasks ?? []).forEach((task) => {
    const current = taskMap.get(task.day_id) ?? [];
    current.push({
      ...(task as unknown as AdminTask),
      lesson_section_id: task.lesson_section_id
        ? sectionKeyById.get(task.lesson_section_id as number) ?? null
        : null,
      topic_id: task.topic_id ?? null,
      answers: answerMap.get(task.id) ?? [],
    });
    taskMap.set(task.day_id, current);
  });

  const lessonMap = new Map<number, AdminLesson[]>();
  (lessons ?? []).forEach((lesson) => {
    const current = lessonMap.get(lesson.day_id) ?? [];
    current.push({
      ...(lesson as unknown as AdminLesson),
      topic_id: lesson.topic_id ?? null,
      sections: sectionMap.get(lesson.id) ?? [],
    });
    lessonMap.set(lesson.day_id, current);
  });

  const topicMap = new Map<number, AdminTopic[]>();
  const topicKeyById = new Map<number, string>();
  (topics ?? []).forEach((topic) => {
    const current = topicMap.get(topic.course_id) ?? [];
    current.push(topic as unknown as AdminTopic);
    topicMap.set(topic.course_id, current);
    topicKeyById.set(topic.id, topic.editor_key as string);
  });

  const dayTopicMap = new Map<number, AdminDayTopic[]>();
  (dayTopics ?? []).forEach((dayTopic) => {
    const current = dayTopicMap.get(dayTopic.day_id) ?? [];
    current.push({
      ...(dayTopic as unknown as AdminDayTopic),
      topic_editor_key: topicKeyById.get(dayTopic.topic_id as number),
    });
    dayTopicMap.set(dayTopic.day_id, current);
  });

  const dayMap = new Map<number, AdminCourseDay[]>();
  (days ?? []).forEach((day) => {
    const current = dayMap.get(day.course_id) ?? [];
    current.push({
      ...(day as unknown as AdminCourseDay),
      flow: (day.flow as AdminCourseDay["flow"]) ?? ["theory", "video", "test"],
      topics: dayTopicMap.get(day.id) ?? [],
      lessons: lessonMap.get(day.id) ?? [],
      tasks: taskMap.get(day.id) ?? [],
    });
    dayMap.set(day.course_id, current);
  });

  return withError({
    courses: courses.map((course) => ({
      ...(course as unknown as AdminCourse),
      topics: topicMap.get(course.id) ?? [],
      days: dayMap.get(course.id) ?? [],
    })),
  });
}

async function replaceCourseContent(course: AdminCourse): Promise<AdminCourse> {
  if (!supabase) {
    return course;
  }

  const { data: savedCourse, error: courseError } = await supabase
    .from("courses")
    .upsert(
      {
        editor_key: course.editor_key,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        grade_label: course.grade_label,
        accent_color: course.accent_color,
        is_published: course.is_published,
        order_index: course.order_index,
      } satisfies CourseRow,
      { onConflict: "editor_key" },
    )
    .select("*")
    .single();

  if (courseError || !savedCourse) {
    throw new Error(courseError?.message ?? "Could not save course.");
  }

  await supabase.from("course_days").delete().eq("course_id", savedCourse.id);
  await supabase.from("course_topics").delete().eq("course_id", savedCourse.id);

  const insertedTopics = (course.topics ?? []).length
    ? (
        await supabase
          .from("course_topics")
          .insert(
            (course.topics ?? []).map(
              (topic) =>
                ({
                  course_id: savedCourse.id,
                  editor_key: topic.editor_key,
                  title: topic.title,
                  summary: topic.summary,
                  theory_outline: topic.theory_outline,
                  order_index: topic.order_index,
                }) satisfies TopicRow,
            ),
          )
          .select("*")
      ).data ?? []
    : [];

  const topicIdByKey = new Map(insertedTopics.map((topic) => [topic.editor_key as string, topic.id as number]));

  const insertedDays = course.days.length
    ? (
        await supabase
          .from("course_days")
          .insert(
            course.days.map(
              (day) =>
                ({
                  course_id: savedCourse.id,
                  editor_key: day.editor_key,
                  title: day.title,
                  topic: day.topic,
                  summary: day.summary,
                  is_active: day.is_active,
                  flow: day.flow ?? ["theory", "video", "test"],
                  order_index: day.order_index,
                }) satisfies DayRow,
            ),
          )
          .select("*")
      ).data ?? []
    : [];

  const dayIdByKey = new Map(insertedDays.map((day) => [day.editor_key as string, day.id as number]));
  const allDayTopics = course.days.flatMap((day) =>
    (day.topics ?? []).map((topic) => ({
      ...topic,
      day_editor_key: day.editor_key,
    })),
  );

  if (allDayTopics.length) {
    await supabase.from("day_topics").insert(
      allDayTopics.map(
        (topic) =>
          ({
            day_id: dayIdByKey.get(topic.day_editor_key) ?? 0,
            editor_key: topic.editor_key,
            topic_id: topicIdByKey.get(String(topic.topic_editor_key ?? topic.topic_id)) ?? 0,
            order_index: topic.order_index,
          }) satisfies DayTopicRow,
      ),
    );
  }

  const allLessons = course.days.flatMap((day) =>
    day.lessons.map((lesson) => ({
      ...lesson,
      day_editor_key: day.editor_key,
    })),
  );

  const insertedLessons = allLessons.length
    ? (
        await supabase
          .from("course_lessons")
          .insert(
            allLessons.map(
              (lesson) =>
                ({
                  day_id: dayIdByKey.get(lesson.day_editor_key) ?? 0,
                  editor_key: lesson.editor_key,
                  topic_id: lesson.topic_id ? topicIdByKey.get(String(lesson.topic_id)) ?? null : null,
                  title: lesson.title,
                  short_theory: lesson.short_theory,
                  example: lesson.example,
                  animation_type: lesson.animation_type,
                  order_index: lesson.order_index,
                }) satisfies LessonRow,
            ),
          )
          .select("*")
      ).data ?? []
    : [];

  const lessonIdByKey = new Map(
    insertedLessons.map((lesson) => [lesson.editor_key as string, lesson.id as number]),
  );

  const allSections = allLessons.flatMap((lesson) =>
    lesson.sections.map((section) => ({
      ...section,
      lesson_editor_key: lesson.editor_key,
    })),
  );

  if (allSections.length) {
    await supabase.from("lesson_sections").insert(
      allSections.map(
        (section) =>
          ({
            lesson_id: lessonIdByKey.get(section.lesson_editor_key) ?? 0,
            editor_key: section.editor_key,
            title: section.title,
            content: section.content,
            kind: section.kind,
            order_index: section.order_index,
          }) satisfies SectionRow,
      ),
    );
  }

  const { data: insertedSections } = insertedLessons.length
    ? await supabase
        .from("lesson_sections")
        .select("*")
        .in("lesson_id", insertedLessons.map((lesson) => lesson.id))
    : { data: [] as Array<Record<string, unknown>> };

  const sectionIdByKey = new Map(
    (insertedSections ?? []).map((section) => [section.editor_key as string, section.id as number]),
  );

  const allTasks = course.days.flatMap((day) =>
    day.tasks.map((task) => ({
      ...task,
      day_editor_key: day.editor_key,
    })),
  );

  const insertedTasks = allTasks.length
    ? (
        await supabase
          .from("content_tasks")
          .insert(
            allTasks.map(
              (task) =>
                ({
                  day_id: dayIdByKey.get(task.day_editor_key) ?? 0,
                  lesson_section_id: task.lesson_section_id
                    ? sectionIdByKey.get(String(task.lesson_section_id)) ?? null
                    : null,
                  topic_id: task.topic_id ? topicIdByKey.get(String(task.topic_id)) ?? null : null,
                  editor_key: task.editor_key,
                  title: task.title,
                  prompt: task.prompt,
                  task_type: task.task_type,
                  placement: task.placement,
                  explanation: task.explanation,
                  expected_answer: task.expected_answer,
                  order_index: task.order_index,
                }) satisfies TaskRow,
            ),
          )
          .select("*")
      ).data ?? []
    : [];

  const taskIdByKey = new Map(insertedTasks.map((task) => [task.editor_key as string, task.id as number]));
  const allAnswers = allTasks.flatMap((task) =>
    task.answers.map((answer) => ({
      ...answer,
      task_editor_key: task.editor_key,
    })),
  );

  if (allAnswers.length) {
    await supabase.from("task_answers").insert(
      allAnswers.map(
        (answer) =>
          ({
            task_id: taskIdByKey.get(answer.task_editor_key) ?? 0,
            editor_key: answer.editor_key,
            text: answer.text,
            is_correct: answer.is_correct,
            order_index: answer.order_index,
          }) satisfies AnswerRow,
      ),
    );
  }

  return {
    ...course,
    id: savedCourse.id,
    topics: (course.topics ?? []).map((topic) => ({
      ...topic,
      id: topicIdByKey.get(topic.editor_key) ?? topic.id,
      course_id: savedCourse.id,
    })),
    days: course.days.map((day) => ({
      ...day,
      id: dayIdByKey.get(day.editor_key) ?? day.id,
      course_id: savedCourse.id,
      lessons: day.lessons.map((lesson) => ({
        ...lesson,
        id: lessonIdByKey.get(lesson.editor_key) ?? lesson.id,
      })),
      tasks: day.tasks.map((task) => ({
        ...task,
        id: taskIdByKey.get(task.editor_key) ?? task.id,
      })),
    })),
  };
}

export async function saveAdminStudioGraph(
  graph: AdminStudioGraph,
): Promise<ApiResponse<AdminStudioGraph>> {
  if (!supabase) {
    return withError(graph);
  }

  try {
    const savedCourses: AdminCourse[] = [];
    for (const course of graph.courses) {
      const savedCourse = await replaceCourseContent(course);
      savedCourses.push(savedCourse);
    }

    return withError({ courses: savedCourses });
  } catch (error) {
    return withError(
      graph,
      error instanceof Error ? error.message : "Could not save admin studio data.",
    );
  }
}

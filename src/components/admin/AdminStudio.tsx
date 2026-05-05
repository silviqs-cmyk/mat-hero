"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Eye,
  FileQuestion,
  Layers,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  createCourse,
  createDay,
  createLesson,
  createLessonSection,
  createQuestion,
  deleteCourse,
  deleteDay,
  deleteLesson,
  deleteLessonSection,
  deleteQuestion,
  getAdminDashboardStats,
  getQuestionOptions,
  listAdminCourses,
  listAdminDays,
  listAdminLessons,
  listAdminQuestions,
  listLessonSections,
  updateCourse,
  updateDay,
  updateLesson,
  updateLessonSection,
  updateQuestion,
} from "@/services/admin";
import type {
  AdminDashboardStats,
  CourseDayInput,
  CourseInput,
  LessonInput,
  LessonSectionInput,
  QuestionInput,
  QuestionOptionInput,
} from "@/types/admin";
import type { Course, CourseDay, Lesson, LessonSection, Question } from "@/types/course";
import { AdminTable } from "@/components/ui/AdminTable";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormSwitch } from "@/components/ui/FormSwitch";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Tabs } from "@/components/ui/Tabs";

type TabId = "courses" | "days" | "lessons" | "sections" | "questions";
type ModalState =
  | { entity: "course"; mode: "create" | "edit"; id?: string }
  | { entity: "day"; mode: "create" | "edit"; id?: string }
  | { entity: "lesson"; mode: "create" | "edit"; id?: string }
  | { entity: "section"; mode: "create" | "edit"; id?: string }
  | { entity: "question"; mode: "create" | "edit"; id?: string }
  | null;

const defaultStats: AdminDashboardStats = {
  totalCourses: 0,
  publishedDays: 0,
  totalStudents: 0,
  averageResultPercentage: 0,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getEmptyCourseForm(): CourseInput {
  return {
    title: "",
    slug: "",
    description: "",
    subject: "Математика",
    grade: 7,
    duration_days: 10,
    is_published: false,
  };
}

function getEmptyDayForm(courseId = ""): CourseDayInput {
  return {
    course_id: courseId,
    day_number: 1,
    title: "",
    subtitle: "",
    description: "",
    estimated_minutes: 30,
    is_published: false,
    sort_order: 1,
  };
}

function getEmptyLessonForm(dayId = ""): LessonInput {
  return {
    course_day_id: dayId,
    title: "",
    type: "theory",
    content: "",
    video_url: null,
    estimated_minutes: 10,
    sort_order: 1,
    is_published: false,
  };
}

function getEmptySectionForm(lessonId = ""): LessonSectionInput {
  return {
    lesson_id: lessonId,
    title: "",
    section_type: "theory",
    content: "",
    sort_order: 1,
  };
}

function getDefaultQuestionOptions(questionType: QuestionInput["question_type"]): QuestionOptionInput[] {
  if (questionType === "true_false") {
    return [
      { option_text: "Вярно", is_correct: true, sort_order: 1 },
      { option_text: "Невярно", is_correct: false, sort_order: 2 },
    ];
  }

  if (questionType === "multiple_choice") {
    return [
      { option_text: "", is_correct: true, sort_order: 1 },
      { option_text: "", is_correct: false, sort_order: 2 },
      { option_text: "", is_correct: false, sort_order: 3 },
      { option_text: "", is_correct: false, sort_order: 4 },
    ];
  }

  return [];
}

function getEmptyQuestionForm(dayId = "", lessonId: string | null = null): QuestionInput {
  return {
    course_day_id: dayId,
    lesson_id: lessonId,
    question_type: "multiple_choice",
    prompt: "",
    explanation: "",
    expected_answer: null,
    difficulty: "medium",
    points: 10,
    topic: "",
    is_bonus: false,
    sort_order: 1,
    is_published: false,
    options: getDefaultQuestionOptions("multiple_choice"),
  };
}

export function AdminStudio() {
  const { profile, isAdmin, isAuthenticated, isLoading: userLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<TabId>("courses");
  const [stats, setStats] = useState<AdminDashboardStats>(defaultStats);
  const [courses, setCourses] = useState<Course[]>([]);
  const [days, setDays] = useState<CourseDay[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [sections, setSections] = useState<LessonSection[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedDayId, setSelectedDayId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [questionOptions, setQuestionOptions] = useState<QuestionOptionInput[]>([]);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const [courseForm, setCourseForm] = useState<CourseInput>(getEmptyCourseForm());
  const [dayForm, setDayForm] = useState<CourseDayInput>(getEmptyDayForm());
  const [lessonForm, setLessonForm] = useState<LessonInput>(getEmptyLessonForm());
  const [sectionForm, setSectionForm] = useState<LessonSectionInput>(getEmptySectionForm());
  const [questionForm, setQuestionForm] = useState<QuestionInput>(getEmptyQuestionForm());

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId],
  );
  const selectedDay = useMemo(
    () => days.find((day) => day.id === selectedDayId) ?? null,
    [days, selectedDayId],
  );
  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId) ?? null,
    [lessons, selectedLessonId],
  );
  const selectedQuestion = useMemo(
    () => questions.find((question) => question.id === selectedQuestionId) ?? null,
    [questions, selectedQuestionId],
  );
  const hasCourses = courses.length > 0;
  const hasSelectedCourse = selectedCourse !== null;
  const hasSelectedDay = selectedDay !== null;
  const hasSelectedLesson = selectedLesson !== null;
  const courseSelectValue = selectedCourse?.id ?? "";
  const daySelectValue = selectedDay?.id ?? "";
  const lessonSelectValue = selectedLesson?.id ?? "";
  const questionSelectValue = selectedQuestion?.id ?? "";
  const dayFormCourseValue = courses.some((course) => course.id === dayForm.course_id) ? dayForm.course_id : "";
  const lessonFormDayValue = days.some((day) => day.id === lessonForm.course_day_id) ? lessonForm.course_day_id : "";
  const sectionFormLessonValue = lessons.some((lesson) => lesson.id === sectionForm.lesson_id) ? sectionForm.lesson_id : "";
  const questionFormDayValue = days.some((day) => day.id === questionForm.course_day_id) ? questionForm.course_day_id : "";
  const questionFormLessonValue =
    questionForm.lesson_id && lessons.some((lesson) => lesson.id === questionForm.lesson_id) ? questionForm.lesson_id : "";
  const dayReadinessById = new Map(
    days.map((day) => {
      const dayLessons = lessons.filter((lesson) => lesson.course_day_id === day.id);
      const dayQuestions = questions.filter((question) => question.course_day_id === day.id);
      const hasPublishedLesson = dayLessons.some((lesson) => lesson.is_published);
      const status: "green" | "gold" | "neutral" =
        day.is_published && hasPublishedLesson && dayQuestions.length > 0
          ? "green"
          : dayLessons.length > 0 || dayQuestions.length > 0
            ? "gold"
            : "neutral";
      const label =
        status === "green" ? "готов" : status === "gold" ? "частично готов" : "празен";

      return [day.id, { status, label, lessonCount: dayLessons.length, questionCount: dayQuestions.length }] as const;
    }),
  );
  const selectedDayQuestions = selectedDay ? questions.filter((question) => question.course_day_id === selectedDay.id) : [];
  const selectedLessonSections = selectedLesson ? sections.filter((section) => section.lesson_id === selectedLesson.id) : [];
  const dayChecklist = [
    {
      label: "Избран курс",
      ready: hasSelectedCourse,
      detail: selectedCourse ? selectedCourse.title : "Избери курс",
    },
    {
      label: "Избран ден",
      ready: hasSelectedDay,
      detail: selectedDay ? `Ден ${selectedDay.day_number}: ${selectedDay.title}` : "Избери ден",
    },
    {
      label: "Публикуван ден",
      ready: Boolean(selectedDay?.is_published),
      detail: selectedDay?.is_published ? "Готов за ученици" : "Още е чернова",
    },
    {
      label: "Поне един урок",
      ready: lessons.length > 0,
      detail: lessons.length > 0 ? `${lessons.length} урок(а)` : "Добави урок",
    },
    {
      label: "Секции в избрания урок",
      ready: selectedLessonSections.length > 0,
      detail: hasSelectedLesson
        ? selectedLessonSections.length > 0
          ? `${selectedLessonSections.length} секции`
          : "Добави секции"
        : "Избери урок",
    },
    {
      label: "Задачи за деня",
      ready: selectedDayQuestions.length > 0,
      detail: selectedDayQuestions.length > 0 ? `${selectedDayQuestions.length} задачи` : "Добави задачи",
    },
    {
      label: "Preview route",
      ready: Boolean(selectedCourse && selectedDay),
      detail: selectedCourse && selectedDay ? `/course/${selectedCourse.slug}/day/${selectedDay.day_number}` : "Няма route още",
    },
  ];
  const checklistReadyCount = dayChecklist.filter((item) => item.ready).length;

  function handleCourseChange(nextCourseId: string) {
    setSelectedCourseId(nextCourseId);

    if (nextCourseId) {
      return;
    }

    setSelectedDayId("");
    setSelectedLessonId("");
    setSelectedQuestionId("");
    setDays([]);
    setLessons([]);
    setSections([]);
    setQuestions([]);
    setQuestionOptions([]);
  }

  function handleDayChange(nextDayId: string) {
    setSelectedDayId(nextDayId);

    if (nextDayId) {
      return;
    }

    setSelectedLessonId("");
    setSelectedQuestionId("");
    setLessons([]);
    setSections([]);
    setQuestions([]);
    setQuestionOptions([]);
  }

  function handleLessonChange(nextLessonId: string) {
    setSelectedLessonId(nextLessonId);

    if (nextLessonId) {
      return;
    }

    setSections([]);
  }

  const loadStats = useCallback(async () => {
    const nextStats = await getAdminDashboardStats();
    setStats(nextStats);
  }, []);

  const loadCourses = useCallback(async (preferredCourseId?: string) => {
    const nextCourses = await listAdminCourses();
    setCourses(nextCourses);

    const nextCourseId =
      preferredCourseId && nextCourses.some((course) => course.id === preferredCourseId)
        ? preferredCourseId
        : nextCourses[0]?.id ?? "";
    setSelectedCourseId(nextCourseId);
    return nextCourseId;
  }, []);

  const loadDays = useCallback(async (courseId?: string, preferredDayId?: string) => {
    if (!courseId) {
      setDays([]);
      setSelectedDayId("");
      return "";
    }

    const nextDays = await listAdminDays(courseId);
    setDays(nextDays);
    const nextDayId =
      preferredDayId && nextDays.some((day) => day.id === preferredDayId)
        ? preferredDayId
        : nextDays[0]?.id ?? "";
    setSelectedDayId(nextDayId);
    return nextDayId;
  }, []);

  const loadLessons = useCallback(async (dayId?: string, preferredLessonId?: string) => {
    if (!dayId) {
      setLessons([]);
      setSelectedLessonId("");
      return "";
    }

    const nextLessons = await listAdminLessons(dayId);
    setLessons(nextLessons);
    const nextLessonId =
      preferredLessonId && nextLessons.some((lesson) => lesson.id === preferredLessonId)
        ? preferredLessonId
        : nextLessons[0]?.id ?? "";
    setSelectedLessonId(nextLessonId);
    return nextLessonId;
  }, []);

  const loadSections = useCallback(async (lessonId?: string) => {
    if (!lessonId) {
      setSections([]);
      return;
    }

    const nextSections = await listLessonSections(lessonId);
    setSections(nextSections);
  }, []);

  const loadQuestions = useCallback(async (dayId?: string, preferredQuestionId?: string) => {
    if (!dayId) {
      setQuestions([]);
      setSelectedQuestionId("");
      setQuestionOptions([]);
      return "";
    }

    const nextQuestions = await listAdminQuestions(dayId);
    setQuestions(nextQuestions);
    const nextQuestionId =
      preferredQuestionId && nextQuestions.some((question) => question.id === preferredQuestionId)
        ? preferredQuestionId
        : nextQuestions[0]?.id ?? "";
    setSelectedQuestionId(nextQuestionId);

    if (nextQuestionId) {
      const options = await getQuestionOptions(nextQuestionId);
      setQuestionOptions(
        options.map((option) => ({
          id: option.id,
          option_text: option.option_text,
          is_correct: option.is_correct,
          sort_order: option.sort_order,
        })),
      );
    } else {
      setQuestionOptions([]);
    }

    return nextQuestionId;
  }, []);

  const bootstrap = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await loadStats();
      const courseId = await loadCourses();
      const dayId = await loadDays(courseId);
      const lessonId = await loadLessons(dayId);
      await Promise.all([loadSections(lessonId), loadQuestions(dayId)]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Неуспешно зареждане на admin CMS.");
    } finally {
      setIsLoading(false);
    }
  }, [loadCourses, loadDays, loadLessons, loadQuestions, loadSections, loadStats]);

  useEffect(() => {
    let active = true;

    async function syncAdminState() {
      if (!userLoading && isAuthenticated && isAdmin) {
        await bootstrap();
        return;
      }

      if (!userLoading && active) {
        setIsLoading(false);
      }
    }

    void syncAdminState();

    return () => {
      active = false;
    };
  }, [bootstrap, userLoading, isAuthenticated, isAdmin]);

  useEffect(() => {
    if (!selectedCourseId) {
      return;
    }

    let active = true;

    async function syncCourseScope() {
      const dayId = await loadDays(selectedCourseId, selectedDayId);
      const lessonId = await loadLessons(dayId, selectedLessonId);
      if (!active) {
        return;
      }
      await Promise.all([loadSections(lessonId), loadQuestions(dayId, selectedQuestionId)]);
    }

    void syncCourseScope();

    return () => {
      active = false;
    };
  }, [loadDays, loadLessons, loadQuestions, loadSections, selectedCourseId, selectedDayId, selectedLessonId, selectedQuestionId]);

  useEffect(() => {
    if (!selectedDayId) {
      return;
    }

    let active = true;

    async function syncDayScope() {
      const lessonId = await loadLessons(selectedDayId, selectedLessonId);
      if (!active) {
        return;
      }
      await Promise.all([loadSections(lessonId), loadQuestions(selectedDayId, selectedQuestionId)]);
    }

    void syncDayScope();

    return () => {
      active = false;
    };
  }, [loadLessons, loadQuestions, loadSections, selectedDayId, selectedLessonId, selectedQuestionId]);

  useEffect(() => {
    let active = true;

    async function syncLessonSections() {
      if (!selectedLessonId) {
        if (active) {
          setSections([]);
        }
        return;
      }

      await loadSections(selectedLessonId);
    }

    void syncLessonSections();

    return () => {
      active = false;
    };
  }, [loadSections, selectedLessonId]);

  useEffect(() => {
    let active = true;

    async function syncQuestionOptions() {
      if (!selectedQuestionId) {
        if (active) {
          setQuestionOptions([]);
        }
        return;
      }

      const options = await getQuestionOptions(selectedQuestionId);
      if (!active) {
        return;
      }
      setQuestionOptions(
        options.map((option) => ({
          id: option.id,
          option_text: option.option_text,
          is_correct: option.is_correct,
          sort_order: option.sort_order,
        })),
      );
    }

    void syncQuestionOptions();

    return () => {
      active = false;
    };
  }, [selectedQuestionId]);

  function openCourseModal(mode: "create" | "edit", course?: Course) {
    setCourseForm(
      course
        ? {
            title: course.title,
            slug: course.slug,
            description: course.description,
            subject: course.subject,
            grade: course.grade,
            duration_days: course.duration_days,
            is_published: course.is_published,
          }
        : getEmptyCourseForm(),
    );
    setModalState({ entity: "course", mode, id: course?.id });
  }

  function openDayModal(mode: "create" | "edit", day?: CourseDay) {
    setDayForm(
      day
        ? {
            course_id: day.course_id,
            day_number: day.day_number,
            title: day.title,
            subtitle: day.subtitle,
            description: day.description,
            estimated_minutes: day.estimated_minutes,
            is_published: day.is_published,
            sort_order: day.sort_order,
          }
        : getEmptyDayForm(selectedCourseId),
    );
    setModalState({ entity: "day", mode, id: day?.id });
  }

  function openLessonModal(mode: "create" | "edit", lesson?: Lesson) {
    setLessonForm(
      lesson
        ? {
            course_day_id: lesson.course_day_id,
            title: lesson.title,
            type: lesson.type,
            content: lesson.content,
            video_url: lesson.video_url,
            estimated_minutes: lesson.estimated_minutes,
            sort_order: lesson.sort_order,
            is_published: lesson.is_published,
          }
        : getEmptyLessonForm(selectedDayId),
    );
    setModalState({ entity: "lesson", mode, id: lesson?.id });
  }

  function openSectionModal(mode: "create" | "edit", section?: LessonSection) {
    setSectionForm(
      section
        ? {
            lesson_id: section.lesson_id,
            title: section.title,
            section_type: section.section_type,
            content: section.content,
            sort_order: section.sort_order,
          }
        : getEmptySectionForm(selectedLessonId),
    );
    setModalState({ entity: "section", mode, id: section?.id });
  }

  async function openQuestionModal(mode: "create" | "edit", question?: Question) {
    if (question) {
      const options = await getQuestionOptions(question.id);
      setQuestionForm({
        course_day_id: question.course_day_id,
        lesson_id: question.lesson_id,
        question_type: question.question_type,
        prompt: question.prompt,
        explanation: question.explanation,
        expected_answer: question.expected_answer,
        difficulty: question.difficulty,
        points: question.points,
        topic: question.topic,
        is_bonus: question.is_bonus,
        sort_order: question.sort_order,
        is_published: question.is_published,
        options: options.map((option) => ({
          id: option.id,
          option_text: option.option_text,
          is_correct: option.is_correct,
          sort_order: option.sort_order,
        })),
      });
    } else {
      setQuestionForm(getEmptyQuestionForm(selectedDayId, selectedLessonId || null));
    }

    setModalState({ entity: "question", mode, id: question?.id });
  }

  function closeModal() {
    setModalState(null);
    setStatus(null);
  }

  function goToTab(tab: TabId) {
    setActiveTab(tab);
  }

  function validateQuestionForm() {
    if (!questionForm.prompt.trim()) {
      return "Условието е задължително.";
    }

    if (!questionForm.topic.trim()) {
      return "Темата е задължителна.";
    }

    if (questionForm.question_type === "multiple_choice") {
      const validOptions = (questionForm.options ?? []).filter((option) => option.option_text.trim().length > 0);
      const correctCount = validOptions.filter((option) => option.is_correct).length;
      if (validOptions.length < 2) {
        return "Multiple choice задачата трябва да има поне 2 опции.";
      }
      if (correctCount !== 1) {
        return "Multiple choice задачата трябва да има точно 1 верен отговор.";
      }
    }

    if (questionForm.question_type === "true_false") {
      const correctCount = (questionForm.options ?? []).filter((option) => option.is_correct).length;
      if (correctCount !== 1) {
        return "True/false задачата трябва да има точно 1 верен отговор.";
      }
    }

    if (questionForm.question_type === "open_answer" && !questionForm.expected_answer?.trim()) {
      return "Open answer задачата трябва да има очакван отговор.";
    }

    return null;
  }

  async function handleSave() {
    if (!modalState) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setStatus(null);

    try {
      if (modalState.entity === "course") {
        if (!courseForm.title.trim() || !courseForm.slug.trim()) {
          throw new Error("Курсът изисква title и slug.");
        }

        if (modalState.mode === "create") {
          const savedCourse = await createCourse(courseForm);
          await loadCourses(savedCourse.id);
        } else if (modalState.id) {
          await updateCourse(modalState.id, courseForm);
          await loadCourses(modalState.id);
        }
      }

      if (modalState.entity === "day") {
        if (!dayForm.course_id || !dayForm.title.trim()) {
          throw new Error("Денят изисква course и title.");
        }

        if (modalState.mode === "create") {
          const savedDay = await createDay(dayForm);
          await loadDays(dayForm.course_id, savedDay.id);
        } else if (modalState.id) {
          await updateDay(modalState.id, dayForm);
          await loadDays(dayForm.course_id, modalState.id);
        }
      }

      if (modalState.entity === "lesson") {
        if (!lessonForm.course_day_id || !lessonForm.title.trim()) {
          throw new Error("Урокът изисква day и title.");
        }

        if (modalState.mode === "create") {
          const savedLesson = await createLesson(lessonForm);
          await loadLessons(lessonForm.course_day_id, savedLesson.id);
        } else if (modalState.id) {
          await updateLesson(modalState.id, lessonForm);
          await loadLessons(lessonForm.course_day_id, modalState.id);
        }
      }

      if (modalState.entity === "section") {
        if (!sectionForm.lesson_id || !sectionForm.title.trim()) {
          throw new Error("Секцията изисква lesson и title.");
        }

        if (modalState.mode === "create") {
          await createLessonSection(sectionForm);
          await loadSections(sectionForm.lesson_id);
        } else if (modalState.id) {
          await updateLessonSection(modalState.id, sectionForm);
          await loadSections(sectionForm.lesson_id);
        }
      }

      if (modalState.entity === "question") {
        const validationError = validateQuestionForm();
        if (validationError) {
          throw new Error(validationError);
        }

        if (modalState.mode === "create") {
          const savedQuestion = await createQuestion(questionForm);
          await loadQuestions(questionForm.course_day_id, savedQuestion.id);
        } else if (modalState.id) {
          await updateQuestion(modalState.id, questionForm);
          await loadQuestions(questionForm.course_day_id, modalState.id);
        }
      }

      await loadStats();
      setStatus("Промените са записани.");
      closeModal();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Неуспешно запазване.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(entity: "course" | "day" | "lesson" | "section" | "question", id: string) {
    const confirmed = window.confirm("Сигурен ли си, че искаш да изтриеш този елемент?");
    if (!confirmed) {
      return;
    }

    setError(null);
    setStatus(null);

    try {
      if (entity === "course") {
        await deleteCourse(id);
        const nextCourseId = await loadCourses();
        const nextDayId = await loadDays(nextCourseId);
        const nextLessonId = await loadLessons(nextDayId);
        await Promise.all([loadSections(nextLessonId), loadQuestions(nextDayId)]);
      }

      if (entity === "day") {
        await deleteDay(id);
        const nextDayId = await loadDays(selectedCourseId);
        const nextLessonId = await loadLessons(nextDayId);
        await Promise.all([loadSections(nextLessonId), loadQuestions(nextDayId)]);
      }

      if (entity === "lesson") {
        await deleteLesson(id);
        const nextLessonId = await loadLessons(selectedDayId);
        await Promise.all([loadSections(nextLessonId), loadQuestions(selectedDayId)]);
      }

      if (entity === "section") {
        await deleteLessonSection(id);
        await loadSections(selectedLessonId);
      }

      if (entity === "question") {
        await deleteQuestion(id);
        await loadQuestions(selectedDayId);
      }

      await loadStats();
      setStatus("Елементът е изтрит.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Неуспешно изтриване.");
    }
  }

  async function handleCoursePublish(course: Course, isPublished: boolean) {
    setError(null);
    setStatus(null);

    try {
      await updateCourse(course.id, {
        title: course.title,
        slug: course.slug,
        description: course.description,
        subject: course.subject,
        grade: course.grade,
        duration_days: course.duration_days,
        is_published: isPublished,
      });
      await loadCourses(course.id);
      setStatus(isPublished ? "Курсът е публикуван." : "Курсът е върнат в чернова.");
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "Неуспешна промяна на курса.");
    }
  }

  async function handleDayPublish(day: CourseDay, isPublished: boolean) {
    setError(null);
    setStatus(null);

    try {
      await updateDay(day.id, {
        course_id: day.course_id,
        day_number: day.day_number,
        title: day.title,
        subtitle: day.subtitle,
        description: day.description,
        estimated_minutes: day.estimated_minutes,
        is_published: isPublished,
        sort_order: day.sort_order,
      });
      await loadDays(day.course_id, day.id);
      setStatus(isPublished ? "Денят е публикуван." : "Денят е върнат в чернова.");
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "Неуспешна промяна на деня.");
    }
  }

  async function handleLessonPublish(lesson: Lesson, isPublished: boolean) {
    setError(null);
    setStatus(null);

    try {
      await updateLesson(lesson.id, {
        course_day_id: lesson.course_day_id,
        title: lesson.title,
        type: lesson.type,
        content: lesson.content,
        video_url: lesson.video_url,
        estimated_minutes: lesson.estimated_minutes,
        sort_order: lesson.sort_order,
        is_published: isPublished,
      });
      await loadLessons(lesson.course_day_id, lesson.id);
      setStatus(isPublished ? "Урокът е публикуван." : "Урокът е върнат в чернова.");
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "Неуспешна промяна на урока.");
    }
  }

  async function handleQuestionPublish(question: Question, isPublished: boolean) {
    setError(null);
    setStatus(null);

    try {
      const options = await getQuestionOptions(question.id);
      await updateQuestion(question.id, {
        course_day_id: question.course_day_id,
        lesson_id: question.lesson_id,
        question_type: question.question_type,
        prompt: question.prompt,
        explanation: question.explanation,
        expected_answer: question.expected_answer,
        difficulty: question.difficulty,
        points: question.points,
        topic: question.topic,
        is_bonus: question.is_bonus,
        sort_order: question.sort_order,
        is_published: isPublished,
        options: options.map((option) => ({
          id: option.id,
          option_text: option.option_text,
          is_correct: option.is_correct,
          sort_order: option.sort_order,
        })),
      });
      await loadQuestions(question.course_day_id, question.id);
      setStatus(isPublished ? "Задачата е публикувана." : "Задачата е върната в чернова.");
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "Неуспешна промяна на задачата.");
    }
  }

  async function handleMoveSection(section: LessonSection, direction: "up" | "down") {
    if (!selectedLesson) {
      return;
    }

    const currentIndex = sections.findIndex((item) => item.id === section.id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const targetSection = sections[targetIndex];

    if (currentIndex === -1 || !targetSection) {
      return;
    }

    setError(null);
    setStatus(null);

    try {
      await Promise.all([
        updateLessonSection(section.id, {
          lesson_id: section.lesson_id,
          title: section.title,
          section_type: section.section_type,
          content: section.content,
          sort_order: targetSection.sort_order,
        }),
        updateLessonSection(targetSection.id, {
          lesson_id: targetSection.lesson_id,
          title: targetSection.title,
          section_type: targetSection.section_type,
          content: targetSection.content,
          sort_order: section.sort_order,
        }),
      ]);
      await loadSections(selectedLesson.id);
      setStatus("Редът на секциите е обновен.");
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : "Неуспешно пренареждане на секциите.");
    }
  }

  function updateQuestionOption(index: number, patch: Partial<QuestionOptionInput>) {
    setQuestionForm((current) => ({
      ...current,
      options: (current.options ?? []).map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...patch } : option,
      ),
    }));
  }

  function setQuestionType(nextType: QuestionInput["question_type"]) {
    setQuestionForm((current) => ({
      ...current,
      question_type: nextType,
      expected_answer: nextType === "open_answer" ? current.expected_answer : null,
      options: nextType === "open_answer" ? [] : getDefaultQuestionOptions(nextType),
    }));
  }

  function setSingleCorrectOption(index: number) {
    setQuestionForm((current) => ({
      ...current,
      options: (current.options ?? []).map((option, optionIndex) => ({
        ...option,
        is_correct: optionIndex === index,
      })),
    }));
  }

  const tabItems = [
    { id: "courses", label: "Курсове" },
    { id: "days", label: "Дни" },
    { id: "lessons", label: "Уроци" },
    { id: "sections", label: "Секции" },
    { id: "questions", label: "Задачи" },
  ];

  function renderSelectionState(title: string, description: string, action?: React.ReactNode) {
    return (
      <NeonCard padding="md">
        <EmptyState title={title} description={description} action={action} />
      </NeonCard>
    );
  }

  function renderScopedEmptyState(
    title: string,
    description: string,
    buttonLabel: string,
    onClick: () => void,
  ) {
    return renderSelectionState(
      title,
      description,
      <NeonButton type="button" onClick={onClick}>{buttonLabel}</NeonButton>,
    );
  }

  if (userLoading || isLoading) {
    return <LoadingState title="Зареждам admin CMS" lines={6} />;
  }

  if (!isAuthenticated || !profile) {
    return (
      <EmptyState
        title="Нужен е вход"
        description="Влез с admin профил, за да управляваш съдържанието."
        action={<NeonButton href="/admin/login">Към админ входа</NeonButton>}
      />
    );
  }

  if (!isAdmin) {
    return (
      <ErrorState
        title="Нямаш достъп до admin panel"
        description="Този екран е достъпен само за потребители с role = admin."
        action={<NeonButton href="/dashboard">Към таблото</NeonButton>}
      />
    );
  }

  if (error && courses.length === 0) {
    return (
      <ErrorState
        title="Не успях да заредя CMS панела"
        description={error}
        action={<NeonButton type="button" onClick={() => void bootstrap()}>Опитай отново</NeonButton>}
      />
    );
  }

  if (!hasCourses) {
    return (
      <EmptyState
        title="Няма курсове"
        description="Все още няма създадени курсове. Създай първи курс, за да започнеш."
        action={
          <NeonButton type="button" onClick={() => openCourseModal("create")}>
            Създай първи курс
          </NeonButton>
        }
      />
    );
  }

  if (!selectedCourse) {
    return (
      <EmptyState
        title="Няма избран курс"
        description="Избери курс или създай нов курс."
        action={
          <NeonButton type="button" onClick={() => openCourseModal("create")}>
            Създай нов курс
          </NeonButton>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <NeonCard padding="lg">
          <SectionHeader
            label="АДМИН CMS"
            title={<h1 className="mh-heading-xl">MatHero Content Studio</h1>}
            action={<Badge tone="cyan">Supabase live редакция</Badge>}
          />
          <p className="mh-copy-muted mt-4 max-w-3xl">
            Управлявай курсове, дни, уроци, секции и въпроси от единен neon CMS панел, вързан към production schema-та.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <NeonButton type="button" onClick={() => openCourseModal("create")}>
              <Plus className="h-4 w-4" />
              Нов курс
            </NeonButton>
            {selectedCourse && selectedDay ? (
              <NeonButton href={`/course/${selectedCourse.slug}/day/${selectedDay.day_number}`} variant="secondary">
                <Eye className="h-4 w-4" />
                Преглед на деня
              </NeonButton>
            ) : null}
          </div>
        </NeonCard>

        <NeonCard padding="lg">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.18)]">
              <ShieldCheck className="h-8 w-8" />
            </span>
            <div>
              <p className="mh-label">АДМИН</p>
              <p className="mt-2 text-2xl font-semibold text-white">{profile.full_name ?? profile.email ?? "Admin"}</p>
              <p className="mt-1 text-slate-400">роля: {profile.role}</p>
            </div>
          </div>
          {status ? <p className="mt-5 rounded-[20px] border border-cyan-400/20 bg-cyan-400/8 px-4 py-3 text-sm text-cyan-100">{status}</p> : null}
          {error ? <p className="mt-3 rounded-[20px] border border-rose-400/20 bg-rose-400/8 px-4 py-3 text-sm text-rose-100">{error}</p> : null}
        </NeonCard>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <NeonCard padding="sm"><StatCard icon={Sparkles} value={stats.totalCourses} label="Курсове" tone="cyan" /></NeonCard>
        <NeonCard padding="sm"><StatCard icon={CalendarDays} value={stats.publishedDays} label="Публикувани дни" tone="gold" /></NeonCard>
        <NeonCard padding="sm"><StatCard icon={ShieldCheck} value={stats.totalStudents} label="Ученици" tone="amber" /></NeonCard>
        <NeonCard padding="sm"><StatCard icon={FileQuestion} value={`${stats.averageResultPercentage}%`} label="Среден резултат" tone="cyan" /></NeonCard>
      </section>

      <NeonCard padding="lg">
        <Tabs items={tabItems} activeTab={activeTab} onChange={(tabId) => setActiveTab(tabId as TabId)} />

        <div className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <NeonCard padding="md" className="h-fit">
            <p className="mh-label">ФИЛТРИ</p>
            <div className="mt-4 grid gap-4">
              <FormSelect label="Курс" value={courseSelectValue} onChange={(event) => handleCourseChange(event.currentTarget.value)}>
                <option value="">Избери курс</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </FormSelect>

              <FormSelect
                label="Ден"
                value={daySelectValue}
                onChange={(event) => handleDayChange(event.currentTarget.value)}
                disabled={!courseSelectValue}
              >
                <option value="">Избери ден</option>
                {days.map((day) => (
                  <option key={day.id} value={day.id}>
                    Ден {day.day_number}: {day.title}
                  </option>
                ))}
              </FormSelect>

              <FormSelect
                label="Урок"
                value={lessonSelectValue}
                onChange={(event) => handleLessonChange(event.currentTarget.value)}
                disabled={!daySelectValue}
              >
                <option value="">Избери урок</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </FormSelect>

              <FormSelect
                label="Задача"
                value={questionSelectValue}
                onChange={(event) => setSelectedQuestionId(event.currentTarget.value)}
                disabled={!daySelectValue}
              >
                <option value="">Избери задача</option>
                {questions.map((question) => (
                  <option key={question.id} value={question.id}>
                    {(question.topic ?? "Без тема")} • {(question.prompt ?? "").slice(0, 40) || "Без текст"}
                  </option>
                ))}
              </FormSelect>

              {selectedCourse && selectedDay ? (
                <Link
                  href={`/course/${selectedCourse.slug}/day/${selectedDay.day_number}`}
                  className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-300/20 hover:bg-white/[0.05]"
                >
                  Отвори ученическия преглед
                </Link>
              ) : null}
            </div>
          </NeonCard>

          <div className="space-y-6">
            {activeTab === "courses" ? (
              <NeonCard padding="md">
                <div className="flex items-center justify-between gap-4">
                  <SectionHeader label="КУРСОВЕ" title="Курсове" />
                  <NeonButton type="button" onClick={() => openCourseModal("create")}>
                    <Plus className="h-4 w-4" />
                    Нов курс
                  </NeonButton>
                </div>
                <div className="mt-5 overflow-x-auto">
                  <AdminTable
                    headers={["Курс", "Клас", "План", "Статус", "Workflow", "Действия"]}
                    rows={courses.map((course) => [
                      <div key={`${course.id}-course`}>
                        <p className="font-semibold text-white">{course.title}</p>
                        <p className="mt-1 text-xs text-slate-400">{course.slug}</p>
                      </div>,
                      `${course.grade} клас`,
                      String(course.duration_days),
                      <div key={`${course.id}-status`} className="flex flex-wrap gap-2">
                        <Badge tone={course.is_published ? "green" : "neutral"}>
                          {course.is_published ? "публикуван" : "чернова"}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => void handleCoursePublish(course, !course.is_published)}
                          className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-200"
                        >
                          {course.is_published ? "Върни в чернова" : "Публикувай"}
                        </button>
                      </div>,
                      <div key={`${course.id}-workflow`} className="flex flex-wrap gap-2">
                        <NeonButton
                          type="button"
                          variant="secondary"
                          className="min-h-0 px-3 py-2 text-xs"
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            goToTab("days");
                          }}
                        >
                          Управлявай дни
                        </NeonButton>
                      </div>,
                      <div key={`${course.id}-actions`} className="flex gap-2">
                        <NeonButton type="button" variant="secondary" className="min-h-0 px-3 py-2 text-xs" onClick={() => openCourseModal("edit", course)}>Редакция</NeonButton>
                        <NeonButton type="button" variant="danger" className="min-h-0 px-3 py-2 text-xs" onClick={() => void handleDelete("course", course.id)}>
                          <Trash2 className="h-4 w-4" />
                        </NeonButton>
                      </div>,
                    ])}
                  />
                </div>
              </NeonCard>
            ) : null}

            {activeTab === "days" ? (
              !hasSelectedCourse ? renderSelectionState(
                "Няма избран курс",
                "Избери курс или създай нов курс.",
                <NeonButton type="button" onClick={() => openCourseModal("create")}>Създай нов курс</NeonButton>,
              ) : days.length === 0 ? renderScopedEmptyState(
                "Няма дни в курса",
                "Добави първия учебен ден, за да започнеш структурата на курса.",
                "Добави ден",
                () => openDayModal("create"),
              ) : (
              <NeonCard padding="md">
                <div className="flex items-center justify-between gap-4">
                  <SectionHeader label="ДНИ" title={selectedCourse ? `Дни в ${selectedCourse.title}` : "Дни"} />
                  <NeonButton type="button" onClick={() => openDayModal("create")} disabled={!courseSelectValue}>
                    <Plus className="h-4 w-4" />
                    Нов ден
                  </NeonButton>
                </div>
                <div className="mt-5 overflow-x-auto">
                  <AdminTable
                    headers={["Ден", "Съдържание", "Готовност", "Статус", "Workflow", "Действия"]}
                    rows={days.map((day) => [
                      `Ден ${day.day_number}`,
                      <div key={`${day.id}-content`}>
                        <p className="font-semibold text-white">{day.title}</p>
                        <p className="mt-1 text-xs text-slate-400">{day.subtitle || day.description || "Без кратко описание"}</p>
                        <p className="mt-2 text-xs text-slate-500">{day.estimated_minutes} мин</p>
                      </div>,
                      <div key={`${day.id}-readiness`} className="flex flex-col gap-2">
                        <Badge tone={dayReadinessById.get(day.id)?.status ?? "neutral"}>
                          {dayReadinessById.get(day.id)?.label ?? "няма данни"}
                        </Badge>
                        <p className="text-xs text-slate-400">
                          {dayReadinessById.get(day.id)?.lessonCount ?? 0} урока • {dayReadinessById.get(day.id)?.questionCount ?? 0} задачи
                        </p>
                      </div>,
                      <div key={`${day.id}-status`} className="flex flex-wrap gap-2">
                        <Badge tone={day.is_published ? "green" : "neutral"}>
                          {day.is_published ? "публикуван" : "чернова"}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => void handleDayPublish(day, !day.is_published)}
                          className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-200"
                        >
                          {day.is_published ? "Върни в чернова" : "Публикувай"}
                        </button>
                      </div>,
                      <div key={`${day.id}-workflow`} className="flex flex-wrap gap-2">
                        <NeonButton
                          type="button"
                          variant="secondary"
                          className="min-h-0 px-3 py-2 text-xs"
                          onClick={() => {
                            setSelectedDayId(day.id);
                            goToTab("lessons");
                          }}
                        >
                          Управлявай урок
                        </NeonButton>
                        <NeonButton
                          type="button"
                          variant="secondary"
                          className="min-h-0 px-3 py-2 text-xs"
                          onClick={() => {
                            setSelectedDayId(day.id);
                            goToTab("questions");
                          }}
                        >
                          Управлявай задачи
                        </NeonButton>
                        {selectedCourse ? (
                          <NeonButton href={`/course/${selectedCourse.slug}/day/${day.day_number}`} variant="secondary" className="min-h-0 px-3 py-2 text-xs">
                            Preview as student
                          </NeonButton>
                        ) : null}
                      </div>,
                      <div key={`${day.id}-actions`} className="flex gap-2">
                        <NeonButton type="button" variant="secondary" className="min-h-0 px-3 py-2 text-xs" onClick={() => openDayModal("edit", day)}>Редакция</NeonButton>
                        <NeonButton type="button" variant="danger" className="min-h-0 px-3 py-2 text-xs" onClick={() => void handleDelete("day", day.id)}>
                          <Trash2 className="h-4 w-4" />
                        </NeonButton>
                      </div>,
                    ])}
                  />
                </div>
              </NeonCard>
              )
            ) : null}

            {activeTab === "lessons" ? (
              !hasSelectedCourse ? renderSelectionState(
                "Няма избран курс",
                "Избери курс или създай нов курс.",
                <NeonButton type="button" onClick={() => openCourseModal("create")}>Създай нов курс</NeonButton>,
              ) : !hasSelectedDay ? renderSelectionState(
                "Няма избран ден",
                "Избери ден от курса.",
              ) : lessons.length === 0 ? renderScopedEmptyState(
                "Няма уроци за този ден",
                "Добави урок, за да подготвиш теорията и видеото.",
                "Добави урок",
                () => openLessonModal("create"),
              ) : (
              <NeonCard padding="md">
                <div className="flex items-center justify-between gap-4">
                  <SectionHeader label="УРОЦИ" title={selectedDay ? `Уроци за Ден ${selectedDay.day_number}` : "Уроци"} />
                  <NeonButton type="button" onClick={() => openLessonModal("create")} disabled={!daySelectValue}>
                    <Plus className="h-4 w-4" />
                    Нов урок
                  </NeonButton>
                </div>
                <div className="mt-5 overflow-x-auto">
                  <AdminTable
                    headers={["Урок", "Тип", "Статус", "Workflow", "Действия"]}
                    rows={lessons.map((lesson) => [
                      <div key={`${lesson.id}-lesson`}>
                        <p className="font-semibold text-white">{lesson.title}</p>
                        <p className="mt-1 text-xs text-slate-400">{lesson.video_url ? "Има видео" : "Без видео"} • {lesson.estimated_minutes} мин</p>
                      </div>,
                      lesson.type,
                      <div key={`${lesson.id}-status`} className="flex flex-wrap gap-2">
                        <Badge tone={lesson.is_published ? "green" : "neutral"}>
                          {lesson.is_published ? "публикуван" : "чернова"}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => void handleLessonPublish(lesson, !lesson.is_published)}
                          className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-200"
                        >
                          {lesson.is_published ? "Върни в чернова" : "Публикувай"}
                        </button>
                      </div>,
                      <div key={`${lesson.id}-workflow`} className="flex flex-wrap gap-2">
                        <NeonButton
                          type="button"
                          variant="secondary"
                          className="min-h-0 px-3 py-2 text-xs"
                          onClick={() => {
                            setSelectedLessonId(lesson.id);
                            goToTab("sections");
                          }}
                        >
                          Управлявай секции
                        </NeonButton>
                      </div>,
                      <div key={`${lesson.id}-actions`} className="flex gap-2">
                        <NeonButton type="button" variant="secondary" className="min-h-0 px-3 py-2 text-xs" onClick={() => openLessonModal("edit", lesson)}>Редакция</NeonButton>
                        <NeonButton type="button" variant="danger" className="min-h-0 px-3 py-2 text-xs" onClick={() => void handleDelete("lesson", lesson.id)}>
                          <Trash2 className="h-4 w-4" />
                        </NeonButton>
                      </div>,
                    ])}
                  />
                </div>
              </NeonCard>
              )
            ) : null}

            {activeTab === "sections" ? (
              !hasSelectedCourse ? renderSelectionState(
                "Няма избран курс",
                "Избери курс или създай нов курс.",
                <NeonButton type="button" onClick={() => openCourseModal("create")}>Създай нов курс</NeonButton>,
              ) : !hasSelectedDay ? renderSelectionState(
                "Няма избран ден",
                "Избери ден от курса.",
              ) : !hasSelectedLesson ? renderSelectionState(
                "Няма избран урок",
                "Избери урок.",
              ) : sections.length === 0 ? renderScopedEmptyState(
                "Няма секции в урока",
                "Добави теория, пример или формула към урока.",
                "Добави секция",
                () => openSectionModal("create"),
              ) : (
              <NeonCard padding="md">
                <div className="flex items-center justify-between gap-4">
                  <SectionHeader label="СЕКЦИИ" title={selectedLesson ? selectedLesson.title : "Секции на урока"} />
                  <NeonButton type="button" onClick={() => openSectionModal("create")} disabled={!lessonSelectValue}>
                    <Plus className="h-4 w-4" />
                    Нова секция
                  </NeonButton>
                </div>
                <div className="mt-5 overflow-x-auto">
                  <AdminTable
                    headers={["Секция", "Тип", "Ред", "Действия"]}
                    rows={sections.map((section, index) => [
                      <div key={`${section.id}-section`}>
                        <p className="font-semibold text-white">{section.title}</p>
                        <p className="mt-1 text-xs text-slate-400 line-clamp-2">{section.content}</p>
                      </div>,
                      section.section_type,
                      <div key={`${section.id}-order`} className="flex items-center gap-2">
                        <span>{section.sort_order}</span>
                        <button
                          type="button"
                          onClick={() => void handleMoveSection(section, "up")}
                          disabled={index === 0}
                          className="rounded-lg border border-white/10 p-2 text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleMoveSection(section, "down")}
                          disabled={index === sections.length - 1}
                          className="rounded-lg border border-white/10 p-2 text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>,
                      <div key={`${section.id}-actions`} className="flex gap-2">
                        <NeonButton type="button" variant="secondary" className="min-h-0 px-3 py-2 text-xs" onClick={() => openSectionModal("edit", section)}>Редакция</NeonButton>
                        <NeonButton type="button" variant="danger" className="min-h-0 px-3 py-2 text-xs" onClick={() => void handleDelete("section", section.id)}>
                          <Trash2 className="h-4 w-4" />
                        </NeonButton>
                      </div>,
                    ])}
                  />
                </div>
              </NeonCard>
              )
            ) : null}

            {activeTab === "questions" ? (
              !hasSelectedCourse ? renderSelectionState(
                "Няма избран курс",
                "Избери курс или създай нов курс.",
                <NeonButton type="button" onClick={() => openCourseModal("create")}>Създай нов курс</NeonButton>,
              ) : !hasSelectedDay ? renderSelectionState(
                "Няма избран ден",
                "Избери ден от курса.",
              ) : questions.length === 0 ? renderScopedEmptyState(
                "Няма задачи за този ден",
                "Добави първата задача, за да има ученикът практика.",
                "Добави задача",
                () => void openQuestionModal("create"),
              ) : (
              <NeonCard padding="md">
                <div className="flex items-center justify-between gap-4">
                  <SectionHeader label="ЗАДАЧИ" title={selectedDay ? `Задачи за Ден ${selectedDay.day_number}` : "Задачи"} />
                  <NeonButton type="button" onClick={() => void openQuestionModal("create")} disabled={!daySelectValue}>
                    <Plus className="h-4 w-4" />
                    Нова задача
                  </NeonButton>
                </div>
                <div className="mt-5 overflow-x-auto">
                  <AdminTable
                    headers={["Задача", "Тип", "Трудност", "Статус", "Действия"]}
                    rows={questions.map((question) => [
                      <div key={`${question.id}-question`}>
                        <p className="font-semibold text-white">{question.topic || "Без тема"}</p>
                        <p className="mt-1 text-xs text-slate-400 line-clamp-2">{question.prompt}</p>
                      </div>,
                      question.question_type,
                      question.difficulty,
                      <div key={`${question.id}-status`} className="flex flex-wrap gap-2">
                        <Badge tone={question.is_bonus ? "gold" : "neutral"}>
                          {question.is_bonus ? "бонус" : "основна"}
                        </Badge>
                        <Badge tone={question.is_published ? "green" : "neutral"}>
                          {question.is_published ? "публикувана" : "чернова"}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => void handleQuestionPublish(question, !question.is_published)}
                          className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-200"
                        >
                          {question.is_published ? "Върни в чернова" : "Публикувай"}
                        </button>
                      </div>,
                      <div key={`${question.id}-actions`} className="flex gap-2">
                        <NeonButton type="button" variant="secondary" className="min-h-0 px-3 py-2 text-xs" onClick={() => void openQuestionModal("edit", question)}>Редакция</NeonButton>
                        <NeonButton type="button" variant="danger" className="min-h-0 px-3 py-2 text-xs" onClick={() => void handleDelete("question", question.id)}>
                          <Trash2 className="h-4 w-4" />
                        </NeonButton>
                      </div>,
                    ])}
                  />
                </div>
              </NeonCard>
              )
            ) : null}

            <section className="grid gap-6 xl:grid-cols-2">
              <NeonCard padding="md">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="mh-label">ИЗБОР</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Текущ обхват</h3>
                  </div>
                  <Layers className="h-5 w-5 text-cyan-300" />
                </div>
                <div className="mt-5 space-y-3">
                  <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Курс</p>
                    <p className="mt-2 text-white">{selectedCourse?.title ?? "Няма избран курс"}</p>
                  </div>
                  <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Ден</p>
                    <p className="mt-2 text-white">{selectedDay ? `Ден ${selectedDay.day_number}: ${selectedDay.title}` : "Няма избран ден"}</p>
                  </div>
                  <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Урок</p>
                    <p className="mt-2 text-white">{selectedLesson?.title ?? "Няма избран урок"}</p>
                  </div>
                </div>
              </NeonCard>

              <NeonCard padding="md">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="mh-label">ПРЕГЛЕД НА ЗАДАЧА</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Текуща задача</h3>
                  </div>
                  <FileQuestion className="h-5 w-5 text-cyan-300" />
                </div>
                {selectedQuestion ? (
                  <div className="mt-5 space-y-3">
                    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="text-sm font-semibold text-white">{selectedQuestion.prompt}</p>
                      <p className="mt-2 text-sm text-slate-400">{selectedQuestion.explanation ?? ""}</p>
                    </div>
                    {questionOptions.length > 0 ? (
                      <div className="grid gap-2">
                        {questionOptions.map((option) => (
                          <div key={option.id ?? option.sort_order} className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
                            {option.option_text} {option.is_correct ? "• верен отговор" : ""}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
                        Очакван отговор: {selectedQuestion.expected_answer ?? "няма"}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-5 text-slate-400">Избери задача, за да видиш snapshot.</p>
                )}
              </NeonCard>

              <NeonCard padding="md">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="mh-label">QA CHECKLIST</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Готовност за preview</h3>
                  </div>
                  <Badge tone={checklistReadyCount === dayChecklist.length ? "green" : "neutral"}>
                    {checklistReadyCount}/{dayChecklist.length}
                  </Badge>
                </div>
                <div className="mt-5 space-y-3">
                  {dayChecklist.map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-[20px] border px-4 py-3 ${
                        item.ready
                          ? "border-emerald-400/20 bg-emerald-400/8"
                          : "border-white/8 bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <Badge tone={item.ready ? "green" : "neutral"}>
                          {item.ready ? "OK" : "Липсва"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
                    </div>
                  ))}
                </div>
                {selectedCourse && selectedDay ? (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <NeonButton href={`/course/${selectedCourse.slug}/day/${selectedDay.day_number}`} variant="secondary">
                      <Eye className="h-4 w-4" />
                      Preview as student
                    </NeonButton>
                    {!selectedDay.is_published ? (
                      <NeonButton type="button" onClick={() => void handleDayPublish(selectedDay, true)}>
                        Публикувай деня
                      </NeonButton>
                    ) : null}
                  </div>
                ) : null}
              </NeonCard>
            </section>
          </div>
        </div>
      </NeonCard>

      <Modal
        open={modalState !== null}
        title={
          modalState
            ? `${modalState.mode === "create" ? "Създай" : "Редактирай"} ${modalState.entity}`
            : ""
        }
        actions={
          <button type="button" onClick={closeModal} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300">
            Затвори
          </button>
        }
      >
        {modalState?.entity === "course" ? (
          <div className="grid gap-4">
            <FormInput
              label="Заглавие"
              value={courseForm.title}
              onChange={(event) => {
                const title = event.currentTarget.value;
                setCourseForm((current) => ({
                  ...current,
                  title,
                  slug: current.slug || slugify(title),
                }));
              }}
            />
            <FormInput label="Slug" value={courseForm.slug} onChange={(event) => {
              const value = event.currentTarget.value;
              setCourseForm((current) => ({ ...current, slug: slugify(value) }));
            }} />
            <FormTextarea label="Описание" value={courseForm.description} onChange={(event) => {
              const value = event.currentTarget.value;
              setCourseForm((current) => ({ ...current, description: value }));
            }} rows={4} />
            <div className="grid gap-4 md:grid-cols-3">
              <FormInput label="Предмет" value={courseForm.subject} onChange={(event) => {
                const value = event.currentTarget.value;
                setCourseForm((current) => ({ ...current, subject: value }));
              }} />
              <FormInput type="number" label="Клас" value={courseForm.grade} onChange={(event) => {
                const value = Number(event.currentTarget.value);
                setCourseForm((current) => ({ ...current, grade: value }));
              }} />
              <FormInput type="number" label="Брой дни" value={courseForm.duration_days} onChange={(event) => {
                const value = Number(event.currentTarget.value);
                setCourseForm((current) => ({ ...current, duration_days: value }));
              }} />
            </div>
            <FormSwitch checked={courseForm.is_published} onChange={(checked) => setCourseForm((current) => ({ ...current, is_published: checked }))} label="Публикуван" />
          </div>
        ) : null}

        {modalState?.entity === "day" ? (
          <div className="grid gap-4">
            <FormSelect label="Курс" value={dayFormCourseValue} onChange={(event) => {
              const value = event.currentTarget.value;
              setDayForm((current) => ({ ...current, course_id: value }));
            }}>
              <option value="">Избери курс</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </FormSelect>
            <div className="grid gap-4 md:grid-cols-3">
              <FormInput type="number" label="Номер на ден" value={dayForm.day_number} onChange={(event) => {
                const value = Number(event.currentTarget.value);
                setDayForm((current) => ({ ...current, day_number: value }));
              }} />
              <FormInput type="number" label="Минути" value={dayForm.estimated_minutes} onChange={(event) => {
                const value = Number(event.currentTarget.value);
                setDayForm((current) => ({ ...current, estimated_minutes: value }));
              }} />
              <FormInput type="number" label="Ред" value={dayForm.sort_order} onChange={(event) => {
                const value = Number(event.currentTarget.value);
                setDayForm((current) => ({ ...current, sort_order: value }));
              }} />
            </div>
            <FormInput label="Заглавие" value={dayForm.title} onChange={(event) => {
              const value = event.currentTarget.value;
              setDayForm((current) => ({ ...current, title: value }));
            }} />
            <FormInput label="Подзаглавие" value={dayForm.subtitle} onChange={(event) => {
              const value = event.currentTarget.value;
              setDayForm((current) => ({ ...current, subtitle: value }));
            }} />
            <FormTextarea label="Описание" value={dayForm.description} onChange={(event) => {
              const value = event.currentTarget.value;
              setDayForm((current) => ({ ...current, description: value }));
            }} rows={4} />
            <FormSwitch checked={dayForm.is_published} onChange={(checked) => setDayForm((current) => ({ ...current, is_published: checked }))} label="Публикуван" />
          </div>
        ) : null}

        {modalState?.entity === "lesson" ? (
          <div className="grid gap-4">
            <FormSelect label="Ден" value={lessonFormDayValue} onChange={(event) => {
              const value = event.currentTarget.value;
              setLessonForm((current) => ({ ...current, course_day_id: value }));
            }}>
              <option value="">Избери ден</option>
              {days.map((day) => (
                <option key={day.id} value={day.id}>Ден {day.day_number}: {day.title}</option>
              ))}
            </FormSelect>
            <FormInput label="Заглавие" value={lessonForm.title} onChange={(event) => {
              const value = event.currentTarget.value;
              setLessonForm((current) => ({ ...current, title: value }));
            }} />
            <div className="grid gap-4 md:grid-cols-3">
              <FormInput label="Тип" value={lessonForm.type} onChange={(event) => {
                const value = event.currentTarget.value;
                setLessonForm((current) => ({ ...current, type: value }));
              }} />
              <FormInput type="number" label="Минути" value={lessonForm.estimated_minutes} onChange={(event) => {
                const value = Number(event.currentTarget.value);
                setLessonForm((current) => ({ ...current, estimated_minutes: value }));
              }} />
              <FormInput type="number" label="Ред" value={lessonForm.sort_order} onChange={(event) => {
                const value = Number(event.currentTarget.value);
                setLessonForm((current) => ({ ...current, sort_order: value }));
              }} />
            </div>
            <FormInput label="Видео URL" value={lessonForm.video_url ?? ""} onChange={(event) => {
              const value = event.currentTarget.value;
              setLessonForm((current) => ({ ...current, video_url: value || null }));
            }} />
            <FormTextarea label="Съдържание" value={lessonForm.content} onChange={(event) => {
              const value = event.currentTarget.value;
              setLessonForm((current) => ({ ...current, content: value }));
            }} rows={6} />
            <FormSwitch checked={lessonForm.is_published} onChange={(checked) => setLessonForm((current) => ({ ...current, is_published: checked }))} label="Публикуван" />
          </div>
        ) : null}

        {modalState?.entity === "section" ? (
          <div className="grid gap-4">
            <FormSelect label="Урок" value={sectionFormLessonValue} onChange={(event) => {
              const value = event.currentTarget.value;
              setSectionForm((current) => ({ ...current, lesson_id: value }));
            }}>
              <option value="">Избери урок</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
              ))}
            </FormSelect>
            <FormInput label="Заглавие" value={sectionForm.title} onChange={(event) => {
              const value = event.currentTarget.value;
              setSectionForm((current) => ({ ...current, title: value }));
            }} />
            <div className="grid gap-4 md:grid-cols-2">
              <FormSelect label="Тип секция" value={sectionForm.section_type} onChange={(event) => {
                const value = event.currentTarget.value;
                setSectionForm((current) => ({ ...current, section_type: value }));
              }}>
                <option value="theory">theory</option>
                <option value="example">example</option>
                <option value="warning">warning</option>
                <option value="tip">tip</option>
                <option value="formula">formula</option>
              </FormSelect>
              <FormInput type="number" label="Ред" value={sectionForm.sort_order} onChange={(event) => {
                const value = Number(event.currentTarget.value);
                setSectionForm((current) => ({ ...current, sort_order: value }));
              }} />
            </div>
            <FormTextarea label="Съдържание" value={sectionForm.content} onChange={(event) => {
              const value = event.currentTarget.value;
              setSectionForm((current) => ({ ...current, content: value }));
            }} rows={6} />
          </div>
        ) : null}

        {modalState?.entity === "question" ? (
          <div className="grid gap-4">
            <FormSelect label="Ден" value={questionFormDayValue} onChange={(event) => {
              const value = event.currentTarget.value;
              setQuestionForm((current) => ({ ...current, course_day_id: value }));
            }}>
              <option value="">Избери ден</option>
              {days.map((day) => (
                <option key={day.id} value={day.id}>Ден {day.day_number}: {day.title}</option>
              ))}
            </FormSelect>
            <FormSelect label="Урок" value={questionFormLessonValue} onChange={(event) => {
              const value = event.currentTarget.value;
              setQuestionForm((current) => ({ ...current, lesson_id: value || null }));
            }}>
              <option value="">Без lesson връзка</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
              ))}
            </FormSelect>
            <FormTextarea label="Условие" value={questionForm.prompt} onChange={(event) => {
              const value = event.currentTarget.value;
              setQuestionForm((current) => ({ ...current, prompt: value }));
            }} rows={4} />
            <div className="grid gap-4 md:grid-cols-3">
              <FormSelect label="Тип задача" value={questionForm.question_type} onChange={(event) => setQuestionType(event.currentTarget.value as QuestionInput["question_type"])}>
                <option value="multiple_choice">multiple_choice</option>
                <option value="open_answer">open_answer</option>
                <option value="true_false">true_false</option>
              </FormSelect>
              <FormSelect label="Трудност" value={questionForm.difficulty} onChange={(event) => {
                const value = event.currentTarget.value as QuestionInput["difficulty"];
                setQuestionForm((current) => ({ ...current, difficulty: value }));
              }}>
                <option value="easy">easy</option>
                <option value="medium">medium</option>
                <option value="hard">hard</option>
              </FormSelect>
              <FormInput type="number" label="Точки" value={questionForm.points} onChange={(event) => {
                const value = Number(event.currentTarget.value);
                setQuestionForm((current) => ({ ...current, points: value }));
              }} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <FormInput label="Тема" value={questionForm.topic} onChange={(event) => {
                const value = event.currentTarget.value;
                setQuestionForm((current) => ({ ...current, topic: value }));
              }} />
              <FormInput type="number" label="Ред" value={questionForm.sort_order} onChange={(event) => {
                const value = Number(event.currentTarget.value);
                setQuestionForm((current) => ({ ...current, sort_order: value }));
              }} />
              <FormInput label="Очакван отговор" value={questionForm.expected_answer ?? ""} onChange={(event) => {
                const value = event.currentTarget.value;
                setQuestionForm((current) => ({ ...current, expected_answer: value || null }));
              }} />
            </div>
            <FormTextarea label="Обяснение" value={questionForm.explanation} onChange={(event) => {
              const value = event.currentTarget.value;
              setQuestionForm((current) => ({ ...current, explanation: value }));
            }} rows={4} />
            <div className="grid gap-3 md:grid-cols-2">
              <FormSwitch checked={questionForm.is_bonus} onChange={(checked) => setQuestionForm((current) => ({ ...current, is_bonus: checked }))} label="Бонус задача" />
              <FormSwitch checked={questionForm.is_published} onChange={(checked) => setQuestionForm((current) => ({ ...current, is_published: checked }))} label="Публикувана" />
            </div>

            {questionForm.question_type !== "open_answer" ? (
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-white">Опции</p>
                  {questionForm.question_type === "multiple_choice" ? (
                    <button
                      type="button"
                      onClick={() =>
                        setQuestionForm((current) => ({
                          ...current,
                          options: [
                            ...(current.options ?? []),
                            {
                              option_text: "",
                              is_correct: false,
                              sort_order: (current.options?.length ?? 0) + 1,
                            },
                          ],
                        }))
                      }
                      className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300"
                    >
                      Добави опция
                    </button>
                  ) : null}
                </div>
                <div className="mt-4 space-y-3">
                  {(questionForm.options ?? []).map((option, index) => (
                    <div key={option.id ?? `${option.sort_order}-${index}`} className="rounded-[18px] border border-white/8 bg-[#0f1424] p-4">
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_auto]">
                        <FormInput
                          label={`Опция ${index + 1}`}
                          value={option.option_text}
                          onChange={(event) => updateQuestionOption(index, { option_text: event.currentTarget.value })}
                        />
                        <FormSwitch
                          checked={option.is_correct}
                          onChange={() => setSingleCorrectOption(index)}
                          label="Верен отговор"
                        />
                        {questionForm.question_type === "multiple_choice" ? (
                          <button
                            type="button"
                            onClick={() =>
                              setQuestionForm((current) => ({
                                ...current,
                                options: (current.options ?? [])
                                  .filter((_, optionIndex) => optionIndex !== index)
                                  .map((nextOption, optionIndex) => ({
                                    ...nextOption,
                                    sort_order: optionIndex + 1,
                                  })),
                              }))
                            }
                            className="mt-7 rounded-xl border border-rose-400/20 px-3 py-2 text-sm text-rose-200"
                          >
                            Махни
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={closeModal} className="rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300">
            Отказ
          </button>
          <NeonButton type="button" onClick={() => void handleSave()} className="px-5" disabled={isSaving}>
            {isSaving ? "Запазване..." : "Запази"}
          </NeonButton>
        </div>
      </Modal>
    </div>
  );
}


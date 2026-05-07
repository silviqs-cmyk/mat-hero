"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode, Component } from "react";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  CirclePlay,
  FileQuestion,
  Layers,
  Plus,
  Rocket,
  Save,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormSwitch } from "@/components/ui/FormSwitch";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { LoadingState } from "@/components/ui/LoadingState";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import {
  deleteLessonVideoByUrl,
  getLessonVideoMaxBytes,
  isAllowedLessonVideoFile,
  LESSON_VIDEO_ALLOWED_TYPES,
  LESSON_VIDEO_MAX_MB,
  uploadLessonVideo,
} from "@/services/adminLessonVideos";
import {
  ADMIN_PLAN_TOTAL_DAYS,
  DEFAULT_ADMIN_COURSE_SLUG,
  ensurePlanDay,
  getAdminPlanSnapshot,
  getResolvedQuestionGroup,
  removePlanQuestion,
  removePlanSection,
  reorderPlanSections,
  savePlanDay,
  savePlanLesson,
  savePlanQuestion,
  savePlanSection,
  type AdminPlanSnapshot,
  type AdminQuestionGroup,
} from "@/services/adminPlan";
import { isValidVideoUrl, resolveLessonVideo } from "@/lib/video";
import type { Lesson, LessonSection, Question } from "@/types/course";
import type { CourseDayInput, LessonInput, LessonSectionInput, QuestionInput, QuestionOptionInput } from "@/types/admin";

type AdminWorkspaceMode = "dashboard" | "plan" | "day" | "lesson" | "video" | "practice" | "quiz" | "bonus" | "preview";

interface AdminPlanWorkspaceProps {
  mode: AdminWorkspaceMode;
  dayNumber?: number;
}

type ToastState =
  | {
      id: number;
      tone: "success" | "error";
      message: string;
    }
  | null;

interface LessonVideoUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  success: string | null;
}

const SECTION_TYPES = ["theory", "example", "formula", "tip", "warning", "common_mistake"] as const;

function getEmptyDayForm(courseId = "", dayNumber = 1): CourseDayInput {
  return {
    course_id: courseId,
    day_number: dayNumber,
    title: "",
    subtitle: "",
    description: "",
    estimated_minutes: 45,
    is_published: false,
    sort_order: dayNumber,
  };
}

function getEmptyLessonForm(dayId = ""): LessonInput {
  return {
    course_day_id: dayId,
    title: "",
    type: "theory",
    content: "",
    video_url: "",
    video_provider: "none",
    video_title: "",
    video_thumbnail_url: "",
    video_duration_seconds: 0,
    video_status: "draft",
    video_storage_path: "",
    estimated_minutes: 20,
    sort_order: 1,
    is_published: false,
  };
}

function getEmptySectionForm(lessonId = "", sortOrder = 1): LessonSectionInput {
  return {
    lesson_id: lessonId,
    title: "",
    section_type: "theory",
    content: "",
    sort_order: sortOrder,
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
    ];
  }

  return [];
}

function getEmptyQuestionForm(dayId = "", lessonId: string | null = null, group: AdminQuestionGroup = "practice"): QuestionInput {
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
    is_bonus: group === "bonus",
    question_group: group,
    sort_order: 1,
    is_published: false,
    options: getDefaultQuestionOptions("multiple_choice"),
  };
}

function getEmptyVideoUploadState(): LessonVideoUploadState {
  return {
    isUploading: false,
    progress: 0,
    error: null,
    success: null,
  };
}

function getStatusBadge(status: "draft" | "published" | "missing") {
  if (status === "published") {
    return <Badge tone="green">Публикуван</Badge>;
  }

  if (status === "draft") {
    return <Badge tone="gold">Чернова</Badge>;
  }

  return <Badge tone="neutral">Няма ден</Badge>;
}

function getVideoBadge(lesson: Lesson | null) {
  if (!lesson?.video_url) {
    return <Badge tone="neutral">Без видео</Badge>;
  }

  return lesson.video_status === "published" ? (
    <Badge tone="cyan">Видео активно</Badge>
  ) : (
    <Badge tone="gold">Видео чернова</Badge>
  );
}

function getQuestionGroupLabel(group: AdminQuestionGroup) {
  if (group === "quiz") {
    return "Тест";
  }
  if (group === "bonus") {
    return "Бонус";
  }
  return "Задачи";
}

function getQuestionEditorTitle(group: AdminQuestionGroup) {
  if (group === "quiz") {
    return "Тестови въпроси";
  }
  if (group === "bonus") {
    return "Бонус задачи";
  }
  return "Основни задачи";
}

function buildAdminDayHref(dayNumber: number, suffix = "") {
  return suffix ? `/admin/day/${dayNumber}/${suffix}` : `/admin/day/${dayNumber}`;
}

function AdminPlanWorkspaceContent({ mode, dayNumber = 1 }: AdminPlanWorkspaceProps) {
  const [snapshot, setSnapshot] = useState<AdminPlanSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [dayForm, setDayForm] = useState<CourseDayInput>(getEmptyDayForm("", dayNumber));
  const [lessonForm, setLessonForm] = useState<LessonInput>(getEmptyLessonForm(""));
  const [sectionForm, setSectionForm] = useState<LessonSectionInput>(getEmptySectionForm(""));
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionInput>(getEmptyQuestionForm("", null));
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [videoUpload, setVideoUpload] = useState<LessonVideoUploadState>(getEmptyVideoUploadState());
  const currentQuestionGroup: AdminQuestionGroup =
    mode === "quiz" ? "quiz" : mode === "bonus" ? "bonus" : "practice";
  const isValidDayNumber = Number.isInteger(dayNumber) && dayNumber >= 1 && dayNumber <= ADMIN_PLAN_TOTAL_DAYS;

  const showToast = useCallback((tone: "success" | "error", message: string) => {
    const nextToast = {
      id: Date.now(),
      tone,
      message,
    } satisfies NonNullable<ToastState>;

    setToast(nextToast);
    window.setTimeout(() => {
      setToast((current) => (current?.id === nextToast.id ? null : current));
    }, 3400);
  }, []);

  const hydrateSnapshot = useCallback(
    (next: AdminPlanSnapshot) => {
      const nextDay = next.days.find((day) => day.day_number === dayNumber) ?? null;
      const nextLesson = nextDay
        ? next.lessons
            .filter((lesson) => lesson.course_day_id === nextDay.id)
            .sort((left, right) => left.sort_order - right.sort_order)[0] ?? null
        : null;
      const nextSections = nextLesson
        ? next.sections.filter((section) => section.lesson_id === nextLesson.id).sort((left, right) => left.sort_order - right.sort_order)
        : [];

      setSnapshot(next);
      setDayForm(
        nextDay
          ? {
              course_id: nextDay.course_id,
              day_number: nextDay.day_number,
              title: nextDay.title,
              subtitle: nextDay.subtitle,
              description: nextDay.description,
              estimated_minutes: nextDay.estimated_minutes,
              is_published: nextDay.is_published,
              sort_order: nextDay.sort_order,
            }
          : getEmptyDayForm(next.course.id, dayNumber),
      );
      setLessonForm(
        nextLesson
          ? {
              course_day_id: nextLesson.course_day_id,
              title: nextLesson.title,
              type: nextLesson.type,
              content: nextLesson.content,
              video_url: nextLesson.video_url ?? "",
              video_provider: nextLesson.video_provider ?? "none",
              video_title: nextLesson.video_title ?? "",
              video_thumbnail_url: nextLesson.video_thumbnail_url ?? "",
              video_duration_seconds: nextLesson.video_duration_seconds ?? 0,
              video_status: nextLesson.video_status ?? "draft",
              video_storage_path: nextLesson.video_storage_path ?? "",
              estimated_minutes: nextLesson.estimated_minutes,
              sort_order: nextLesson.sort_order,
              is_published: nextLesson.is_published,
            }
          : getEmptyLessonForm(nextDay?.id ?? ""),
      );
      setSectionForm(getEmptySectionForm(nextLesson?.id ?? "", nextSections.length + 1));
      setEditingSectionId(null);
      setQuestionForm(getEmptyQuestionForm(nextDay?.id ?? "", nextLesson?.id ?? null, currentQuestionGroup));
      setEditingQuestionId(null);
      setVideoUpload(getEmptyVideoUploadState());
    },
    [currentQuestionGroup, dayNumber],
  );

  const loadSnapshot = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await getAdminPlanSnapshot();
      hydrateSnapshot(next);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Не успях да заредя admin плана.");
    } finally {
      setIsLoading(false);
    }
  }, [hydrateSnapshot]);

  useEffect(() => {
    let active = true;

    getAdminPlanSnapshot()
      .then((next) => {
        if (active) {
          hydrateSnapshot(next);
          setIsLoading(false);
        }
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Не успях да заредя admin плана.");
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [hydrateSnapshot]);

  const activeDay = useMemo(
    () => snapshot?.days.find((day) => day.day_number === dayNumber) ?? null,
    [dayNumber, snapshot?.days],
  );
  const activeLesson = useMemo(
    () =>
      activeDay
        ? snapshot?.lessons
            .filter((lesson) => lesson.course_day_id === activeDay.id)
            .sort((left, right) => left.sort_order - right.sort_order)[0] ?? null
        : null,
    [activeDay, snapshot?.lessons],
  );
  const activeSections = useMemo(
    () =>
      activeLesson
        ? (snapshot?.sections ?? [])
            .filter((section) => section.lesson_id === activeLesson.id)
            .sort((left, right) => left.sort_order - right.sort_order)
        : [],
    [activeLesson, snapshot?.sections],
  );
  const activeQuestions = useMemo(
    () =>
      activeDay
        ? (snapshot?.questions ?? [])
            .filter((question) => question.course_day_id === activeDay.id)
            .sort((left, right) => left.sort_order - right.sort_order)
        : [],
    [activeDay, snapshot?.questions],
  );
  const questionOptionsById = useMemo(() => {
    const map = new Map<string, QuestionOptionInput[]>();
    for (const option of snapshot?.questionOptions ?? []) {
      const current = map.get(option.question_id) ?? [];
      current.push({
        id: option.id,
        option_text: option.option_text,
        is_correct: option.is_correct,
        sort_order: option.sort_order,
      });
      map.set(option.question_id, current.sort((left, right) => left.sort_order - right.sort_order));
    }
    return map;
  }, [snapshot?.questionOptions]);

  const filteredQuestions = useMemo(
    () => activeQuestions.filter((question) => getResolvedQuestionGroup(question) === currentQuestionGroup),
    [activeQuestions, currentQuestionGroup],
  );
  const isModeRequiringDay = mode !== "dashboard" && mode !== "plan";
  const isVideoModeReady =
    mode !== "video" ||
    !activeDay ||
    !activeLesson ||
    lessonForm.course_day_id === activeDay.id;
  const publishedDayCount = snapshot?.dayCards.filter((card) => card.status === "published").length ?? 0;
  const lessonCount = snapshot?.lessons.length ?? 0;
  const questionCount = snapshot?.questions.length ?? 0;
  const videoCount = snapshot?.lessons.filter((lesson) => lesson.video_url && lesson.video_status === "published").length ?? 0;

  const ensureDayAndReload = useCallback(async () => {
    setIsSaving(true);
    try {
      await ensurePlanDay(dayNumber);
      await loadSnapshot();
      showToast("success", `Създадох съдържание за Ден ${dayNumber}.`);
    } catch (actionError) {
      showToast("error", actionError instanceof Error ? actionError.message : "Не успях да създам деня.");
    } finally {
      setIsSaving(false);
    }
  }, [dayNumber, loadSnapshot, showToast]);

  async function handleSaveDay() {
    if (!snapshot || !activeDay) {
      return;
    }

    setIsSaving(true);
    try {
      await savePlanDay(activeDay.id, dayForm);
      await loadSnapshot();
      showToast("success", `Запазих Ден ${dayNumber}.`);
    } catch (saveError) {
      showToast("error", saveError instanceof Error ? saveError.message : "Не успях да запазя деня.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveLesson() {
    if (!activeDay) {
      showToast("error", "Първо създай деня.");
      return;
    }

    if (!lessonForm.title.trim()) {
      showToast("error", "Добави заглавие на урока.");
      return;
    }

    setIsSaving(true);
    try {
      await savePlanLesson(activeLesson?.id ?? null, {
        ...lessonForm,
        course_day_id: activeDay.id,
      });
      await loadSnapshot();
      showToast("success", "Урокът е запазен.");
    } catch (saveError) {
      showToast("error", saveError instanceof Error ? saveError.message : "Не успях да запазя урока.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveSection() {
    if (!activeLesson) {
      showToast("error", "Първо създай урок за този ден.");
      return;
    }

    if (!sectionForm.title.trim() || !sectionForm.content.trim()) {
      showToast("error", "Попълни заглавие и съдържание на секцията.");
      return;
    }

    setIsSaving(true);
    try {
      await savePlanSection(editingSectionId, {
        ...sectionForm,
        lesson_id: activeLesson.id,
      });
      await loadSnapshot();
      setEditingSectionId(null);
      setSectionForm(getEmptySectionForm(activeLesson.id, activeSections.length + 1));
      showToast("success", "Секцията е запазена.");
    } catch (saveError) {
      showToast("error", saveError instanceof Error ? saveError.message : "Не успях да запазя секцията.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteSection(sectionId: string) {
    setIsSaving(true);
    try {
      await removePlanSection(sectionId);
      await loadSnapshot();
      if (editingSectionId === sectionId && activeLesson) {
        setEditingSectionId(null);
        setSectionForm(getEmptySectionForm(activeLesson.id, activeSections.length));
      }
      showToast("success", "Секцията е изтрита.");
    } catch (deleteError) {
      showToast("error", deleteError instanceof Error ? deleteError.message : "Не успях да изтрия секцията.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReorderSections(sectionId: string, direction: "up" | "down") {
    const currentIndex = activeSections.findIndex((section) => section.id === sectionId);
    if (currentIndex === -1) {
      return;
    }

    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= activeSections.length) {
      return;
    }

    const orderedIds = activeSections.map((section) => section.id);
    const [moved] = orderedIds.splice(currentIndex, 1);
    orderedIds.splice(nextIndex, 0, moved);

    setIsSaving(true);
    try {
      await reorderPlanSections(orderedIds);
      await loadSnapshot();
      showToast("success", "Подредбата на секциите е обновена.");
    } catch (reorderError) {
      showToast("error", reorderError instanceof Error ? reorderError.message : "Не успях да подредя секциите.");
    } finally {
      setIsSaving(false);
    }
  }

  function openSectionEditor(section: LessonSection) {
    setEditingSectionId(section.id);
    setSectionForm({
      lesson_id: section.lesson_id,
      title: section.title,
      section_type: section.section_type,
      content: section.content,
      sort_order: section.sort_order,
    });
  }

  function validateQuestionForm() {
    if (!activeDay) {
      return "Първо създай деня.";
    }
    if (!questionForm.prompt.trim()) {
      return "Добави текст на задачата.";
    }

    if (questionForm.question_type === "multiple_choice" || questionForm.question_type === "true_false") {
      const options = (questionForm.options ?? []).filter((option) => option.option_text.trim().length > 0);
      const correctAnswers = options.filter((option) => option.is_correct);

      if (options.length < 2) {
        return "Добави поне 2 опции.";
      }

      if (correctAnswers.length !== 1) {
        return "Трябва да има точно 1 верен отговор.";
      }
    }

    if (questionForm.question_type === "open_answer" && !questionForm.expected_answer?.trim()) {
      return "Добави очакван отговор за open answer задачата.";
    }

    return null;
  }

  async function handleSaveQuestion() {
    const validationError = validateQuestionForm();
    if (validationError) {
      showToast("error", validationError);
      return;
    }

    if (!activeDay) {
      return;
    }

    setIsSaving(true);
    try {
      await savePlanQuestion(editingQuestionId, {
        ...questionForm,
        course_day_id: activeDay.id,
        lesson_id: activeLesson?.id ?? questionForm.lesson_id,
        is_bonus: currentQuestionGroup === "bonus",
        question_group: currentQuestionGroup,
      });
      await loadSnapshot();
      setQuestionForm(getEmptyQuestionForm(activeDay.id, activeLesson?.id ?? null, currentQuestionGroup));
      setEditingQuestionId(null);
      showToast("success", "Задачата е запазена.");
    } catch (saveError) {
      showToast("error", saveError instanceof Error ? saveError.message : "Не успях да запазя задачата.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    setIsSaving(true);
    try {
      await removePlanQuestion(questionId);
      await loadSnapshot();
      showToast("success", "Задачата е изтрита.");
    } catch (deleteError) {
      showToast("error", deleteError instanceof Error ? deleteError.message : "Не успях да изтрия задачата.");
    } finally {
      setIsSaving(false);
    }
  }

  function openQuestionEditor(question: Question) {
    setEditingQuestionId(question.id);
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
      question_group: getResolvedQuestionGroup(question),
      sort_order: question.sort_order,
      is_published: question.is_published,
      options: questionOptionsById.get(question.id) ?? getDefaultQuestionOptions(question.question_type),
    });
  }

  function updateQuestionType(questionType: QuestionInput["question_type"]) {
    setQuestionForm((current) => ({
      ...current,
      question_type: questionType,
      expected_answer: questionType === "open_answer" ? current.expected_answer : null,
      options: getDefaultQuestionOptions(questionType),
    }));
  }

  async function handleVideoUpload(file: File) {
    if (!activeDay) {
      showToast("error", "Първо създай деня.");
      return;
    }

    if (!isAllowedLessonVideoFile(file)) {
      const message = "Позволени са само mp4, webm и mov файлове.";
      setVideoUpload((current) => ({ ...current, error: message }));
      showToast("error", message);
      return;
    }

    if (file.size > getLessonVideoMaxBytes()) {
      const message = `Видео файлът е по-голям от ${LESSON_VIDEO_MAX_MB} MB.`;
      setVideoUpload((current) => ({ ...current, error: message }));
      showToast("error", message);
      return;
    }

    setVideoUpload({ isUploading: true, progress: 10, error: null, success: null });
    try {
      const previousVideoUrl = lessonForm.video_url;
      const previousStoragePath = lessonForm.video_storage_path;
      const uploadResult = await uploadLessonVideo({ file, courseDayId: activeDay.id });
      setVideoUpload({ isUploading: true, progress: 85, error: null, success: null });
      setLessonForm((current) => ({
        ...current,
        video_provider: "uploaded",
        video_url: uploadResult.publicUrl,
        video_storage_path: uploadResult.path ?? "",
        video_status: current.video_status,
      }));
      setVideoUpload({ isUploading: false, progress: 100, error: null, success: "Видеото е качено." });

      if (previousVideoUrl && previousStoragePath && previousVideoUrl !== uploadResult.publicUrl) {
        void deleteLessonVideoByUrl(previousVideoUrl).catch(() => undefined);
      }
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Не успях да кача видеото.";
      setVideoUpload({ isUploading: false, progress: 0, error: message, success: null });
      showToast("error", message);
    }
  }

  async function handleRemoveVideo() {
    const currentVideoUrl = lessonForm.video_url;
    setLessonForm((current) => ({
      ...current,
      video_provider: "none",
      video_url: "",
      video_storage_path: "",
      video_title: "",
      video_thumbnail_url: "",
      video_duration_seconds: 0,
      video_status: "draft",
    }));
    setVideoUpload(getEmptyVideoUploadState());

    if (currentVideoUrl) {
      try {
        await deleteLessonVideoByUrl(currentVideoUrl);
      } catch {
        // Best effort cleanup only.
      }
    }
  }

  async function handleSaveVideo() {
    if (!activeDay) {
      showToast("error", "Първо създай деня.");
      return;
    }

    if (!activeLesson && !lessonForm.title.trim()) {
      showToast("error", "Първо добави заглавие на урока.");
      return;
    }

    if (lessonForm.video_url && !isValidVideoUrl(lessonForm.video_url)) {
      showToast("error", "Линкът към видеото трябва да е валиден URL.");
      return;
    }

    setIsSaving(true);
    try {
      await savePlanLesson(activeLesson?.id ?? null, {
        ...lessonForm,
        course_day_id: activeDay.id,
        title: lessonForm.title.trim() || activeLesson?.title || `Видео урок за Ден ${dayNumber}`,
      });
      await loadSnapshot();
      showToast("success", "Видео настройките са запазени.");
    } catch (saveError) {
      showToast("error", saveError instanceof Error ? saveError.message : "Не успях да запазя видеото.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <LoadingState title="Зареждам admin плана" lines={6} />;
  }

  if (error || !snapshot) {
    return (
      <ErrorState
        title="Не успях да заредя admin CMS"
        description={error ?? "Възникна грешка при зареждане на плана."}
        action={<NeonButton onClick={() => void loadSnapshot()}>Опитай отново</NeonButton>}
      />
    );
  }

  if (!isValidDayNumber) {
    return (
      <EmptyState
        title="Невалиден ден"
        description={`Избери ден между 1 и ${ADMIN_PLAN_TOTAL_DAYS}.`}
        action={<NeonButton href="/admin/plan">Към 10-дневния план</NeonButton>}
      />
    );
  }

  if (isModeRequiringDay && !activeDay) {
    return renderMissingDayState();
  }

  if (mode === "video" && !isVideoModeReady) {
    return <LoadingState title="Зареждам видео редактора" lines={5} />;
  }

  const previewVideo = lessonForm.video_url ? resolveLessonVideo(lessonForm.video_url) : null;
  const previewLessonSections = activeSections.length > 0 ? activeSections : [];

  function renderDayActions(dayIndex: number) {
    return (
      <div className="flex flex-wrap gap-2">
        <NeonButton href={buildAdminDayHref(dayIndex)} variant="secondary">Редактирай ден</NeonButton>
        <NeonButton href={buildAdminDayHref(dayIndex, "lesson")} variant="ghost">Урок</NeonButton>
        <NeonButton href={buildAdminDayHref(dayIndex, "video")} variant="ghost">Видео</NeonButton>
        <NeonButton href={buildAdminDayHref(dayIndex, "practice")} variant="ghost">Задачи</NeonButton>
        <NeonButton href={buildAdminDayHref(dayIndex, "quiz")} variant="ghost">Тест</NeonButton>
        <NeonButton href={buildAdminDayHref(dayIndex, "bonus")} variant="ghost">Бонус</NeonButton>
        <NeonButton href={buildAdminDayHref(dayIndex, "preview")} variant="ghost">Preview</NeonButton>
      </div>
    );
  }

  function renderMissingDayState() {
    return (
      <EmptyState
        title={`Ден ${dayNumber} още не е създаден`}
        description="Създай съдържание за този ден и после ще можеш да управляваш урока, видеото и задачите."
        action={
          <NeonButton onClick={() => void ensureDayAndReload()} disabled={isSaving}>
            Създай съдържание за този ден
          </NeonButton>
        }
      />
    );
  }

  function renderQuestionForm() {
    const optionCount = questionForm.options?.length ?? 0;

    return (
      <NeonCard padding="md" className="space-y-4">
        <SectionHeader
          label="Question Editor"
          title={editingQuestionId ? "Редакция на задача" : `Нова ${getQuestionGroupLabel(currentQuestionGroup).toLowerCase()} задача`}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <FormSelect
            label="Тип задача"
            value={questionForm.question_type}
            onChange={(event) => {
              const value = event.currentTarget?.value ?? "multiple_choice";
              updateQuestionType(value as QuestionInput["question_type"]);
            }}
          >
            <option value="multiple_choice">multiple_choice</option>
            <option value="true_false">true_false</option>
            <option value="open_answer">open_answer</option>
          </FormSelect>
          <FormSelect
            label="Трудност"
            value={questionForm.difficulty}
            onChange={(event) => {
              const value = event.currentTarget?.value ?? "medium";
              setQuestionForm((current) => ({
                ...current,
                difficulty: value as QuestionInput["difficulty"],
              }));
            }}
          >
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </FormSelect>
          <FormInput
            label="Тема"
            value={questionForm.topic}
            onChange={(event) => {
              const value = event.currentTarget?.value ?? "";
              setQuestionForm((current) => ({ ...current, topic: value }));
            }}
          />
          <FormInput
            label="Точки"
            type="number"
            min={0}
            value={questionForm.points}
            onChange={(event) => {
              const value = event.currentTarget?.value ?? "0";
              setQuestionForm((current) => ({ ...current, points: Number(value) || 0 }));
            }}
          />
          <FormInput
            label="Sort order"
            type="number"
            min={1}
            value={questionForm.sort_order}
            onChange={(event) => {
              const value = event.currentTarget?.value ?? "1";
              setQuestionForm((current) => ({ ...current, sort_order: Number(value) || 1 }));
            }}
          />
          <div className="lg:col-span-2">
            <FormSwitch
              checked={questionForm.is_published}
              onChange={(checked) => setQuestionForm((current) => ({ ...current, is_published: checked }))}
              label="Публикувана задача"
              description="Непубликуваните задачи няма да се виждат на ученика."
            />
          </div>
        </div>
        <FormTextarea
          label="Въпрос"
          rows={4}
          value={questionForm.prompt}
          onChange={(event) => {
            const value = event.currentTarget?.value ?? "";
            setQuestionForm((current) => ({ ...current, prompt: value }));
          }}
        />
        <FormTextarea
          label="Обяснение"
          rows={4}
          value={questionForm.explanation}
          onChange={(event) => {
            const value = event.currentTarget?.value ?? "";
            setQuestionForm((current) => ({ ...current, explanation: value }));
          }}
        />
        {questionForm.question_type === "open_answer" ? (
          <FormInput
            label="Очакван отговор"
            value={questionForm.expected_answer ?? ""}
            onChange={(event) => {
              const value = event.currentTarget?.value ?? "";
              setQuestionForm((current) => ({ ...current, expected_answer: value }));
            }}
          />
        ) : (
          <div className="space-y-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Опции</p>
                <p className="mt-1 text-xs text-[var(--mh-text-muted)]">
                  Минимум 2 опции и точно 1 верен отговор.
                </p>
              </div>
              {questionForm.question_type === "multiple_choice" ? (
                <NeonButton
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setQuestionForm((current) => ({
                      ...current,
                      options: [
                        ...(current.options ?? []),
                        {
                          option_text: "",
                          is_correct: false,
                          sort_order: optionCount + 1,
                        },
                      ],
                    }))
                  }
                >
                  <Plus className="h-4 w-4" />
                  Добави опция
                </NeonButton>
              ) : null}
            </div>
            <div className="space-y-3">
              {(questionForm.options ?? []).map((option, index) => (
                <div key={`${editingQuestionId ?? "new"}-${index}`} className="grid gap-3 rounded-[20px] border border-white/8 bg-slate-950/35 p-3 lg:grid-cols-[1fr_auto_auto]">
                  <FormInput
                    label={`Опция ${index + 1}`}
                    value={option.option_text}
                    onChange={(event) => {
                      const value = event.currentTarget?.value ?? "";
                      setQuestionForm((current) => ({
                        ...current,
                        options: (current.options ?? []).map((candidate, candidateIndex) =>
                          candidateIndex === index ? { ...candidate, option_text: value } : candidate,
                        ),
                      }));
                    }}
                  />
                  <FormSwitch
                    checked={option.is_correct}
                    onChange={() =>
                      setQuestionForm((current) => ({
                        ...current,
                        options: (current.options ?? []).map((candidate, candidateIndex) => ({
                          ...candidate,
                          is_correct: candidateIndex === index,
                        })),
                      }))
                    }
                    label="Верен"
                  />
                  {questionForm.question_type === "multiple_choice" ? (
                    <NeonButton
                      type="button"
                      variant="danger"
                      onClick={() =>
                        setQuestionForm((current) => ({
                          ...current,
                          options: (current.options ?? [])
                            .filter((_, candidateIndex) => candidateIndex !== index)
                            .map((candidate, candidateIndex) => ({
                              ...candidate,
                              sort_order: candidateIndex + 1,
                            })),
                        }))
                      }
                      disabled={(questionForm.options?.length ?? 0) <= 2}
                      className="self-end"
                    >
                      <Trash2 className="h-4 w-4" />
                      Махни
                    </NeonButton>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <NeonButton type="button" onClick={() => void handleSaveQuestion()} disabled={isSaving}>
            <Save className="h-4 w-4" />
            {editingQuestionId ? "Запази промените" : "Добави задача"}
          </NeonButton>
          {editingQuestionId ? (
            <NeonButton
              type="button"
              variant="ghost"
              onClick={() => {
                setEditingQuestionId(null);
                setQuestionForm(getEmptyQuestionForm(activeDay?.id ?? "", activeLesson?.id ?? null, currentQuestionGroup));
              }}
            >
              Отказ
            </NeonButton>
          ) : null}
        </div>
      </NeonCard>
    );
  }

  let content: ReactNode;

  if (mode === "dashboard") {
    content = (
      <div className="space-y-6">
        <SectionHeader
          label="Admin Dashboard"
          title="10-дневна подготовка по математика"
          action={<NeonButton href="/admin/day/1">Редактирай Ден 1</NeonButton>}
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Target} value={`${publishedDayCount}/${ADMIN_PLAN_TOTAL_DAYS}`} label="Публикувани дни" tone="cyan" />
          <StatCard icon={BookOpen} value={lessonCount} label="Уроци" tone="gold" />
          <StatCard icon={FileQuestion} value={questionCount} label="Всички задачи" tone="amber" />
          <StatCard icon={CirclePlay} value={videoCount} label="Публикувани видеа" tone="cyan" />
        </div>
        <NeonCard padding="md" className="space-y-4">
          <SectionHeader
            label="Статус на плана"
            title="Какво има в 10-дневния курс"
            action={<NeonButton href="/admin/plan" variant="secondary">Отвори 10-дневния план</NeonButton>}
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {snapshot.dayCards.slice(0, 3).map((card) => (
              <NeonCard key={card.dayNumber} tone="muted" padding="sm" className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="mh-label">Ден {card.dayNumber}</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{card.title}</h3>
                  </div>
                  {getStatusBadge(card.status)}
                </div>
                <p className="text-sm text-[var(--mh-text-muted)]">{card.subtitle}</p>
                <div className="flex flex-wrap gap-2 text-xs text-[var(--mh-text-muted)]">
                  <Badge tone={card.hasLesson ? "cyan" : "neutral"}>{card.hasLesson ? "Има урок" : "Без урок"}</Badge>
                  <Badge tone={card.hasVideo ? "green" : "neutral"}>{card.hasVideo ? "Има видео" : "Без видео"}</Badge>
                  <Badge tone="purple">{card.practiceCount} задачи</Badge>
                </div>
              </NeonCard>
            ))}
          </div>
        </NeonCard>
      </div>
    );
  } else if (mode === "plan") {
    content = (
      <div className="space-y-6">
        <SectionHeader
          label="10-дневен план"
          title="Управление на съдържанието по дни"
          action={<NeonButton href="/admin">Към dashboard</NeonButton>}
        />
        <div className="grid gap-4 xl:grid-cols-2">
          {snapshot.dayCards.map((card) => (
            <NeonCard key={card.dayNumber} padding="md" className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="mh-label">Ден {card.dayNumber}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{card.title}</h3>
                  <p className="mt-2 text-sm text-[var(--mh-text-muted)]">{card.subtitle}</p>
                </div>
                {getStatusBadge(card.status)}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone={card.hasLesson ? "cyan" : "neutral"}>{card.hasLesson ? "Има урок" : "Няма урок"}</Badge>
                {getVideoBadge(card.lesson)}
                <Badge tone="purple">{card.practiceCount} задачи</Badge>
                <Badge tone="green">{card.quizCount} тестови</Badge>
                <Badge tone="gold">{card.bonusCount} бонус</Badge>
              </div>
              {renderDayActions(card.dayNumber)}
              {card.day ? (
                <NeonButton
                  type="button"
                  variant={card.day.is_published ? "ghost" : "success"}
                  onClick={() => {
                    if (!card.day) {
                      return;
                    }
                    const nextDay = card.day;
                    setDayForm({
                      course_id: nextDay.course_id,
                      day_number: nextDay.day_number,
                      title: nextDay.title,
                      subtitle: nextDay.subtitle,
                      description: nextDay.description,
                      estimated_minutes: nextDay.estimated_minutes,
                      is_published: !nextDay.is_published,
                      sort_order: nextDay.sort_order,
                    });
                    void savePlanDay(nextDay.id, {
                      course_id: nextDay.course_id,
                      day_number: nextDay.day_number,
                      title: nextDay.title,
                      subtitle: nextDay.subtitle,
                      description: nextDay.description,
                      estimated_minutes: nextDay.estimated_minutes,
                      is_published: !nextDay.is_published,
                      sort_order: nextDay.sort_order,
                    })
                      .then(loadSnapshot)
                      .then(() =>
                        showToast("success", !nextDay.is_published ? `Публикува Ден ${card.dayNumber}.` : `Скри Ден ${card.dayNumber}.`),
                      )
                      .catch((publishError) =>
                        showToast("error", publishError instanceof Error ? publishError.message : "Не успях да обновя статуса."),
                      );
                  }}
                >
                  {card.day.is_published ? "Unpublish" : "Publish"}
                </NeonButton>
              ) : (
                <NeonButton type="button" onClick={() => void ensurePlanDay(card.dayNumber).then(loadSnapshot)}>
                  Създай ден
                </NeonButton>
              )}
            </NeonCard>
          ))}
        </div>
      </div>
    );
  } else if (mode === "day") {
    content = (
      <div className="space-y-6">
        <SectionHeader
          label={`Ден ${dayNumber}`}
          title="Редактор на деня"
          action={<NeonButton href="/admin/plan" variant="secondary">Към плана</NeonButton>}
        />
        <NeonCard padding="md" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <FormInput
              label="Заглавие"
              value={dayForm.title}
              onChange={(event) => {
                const value = event.currentTarget?.value ?? "";
                setDayForm((current) => ({ ...current, title: value }));
              }}
            />
            <FormInput
              label="Подзаглавие"
              value={dayForm.subtitle}
              onChange={(event) => {
                const value = event.currentTarget?.value ?? "";
                setDayForm((current) => ({ ...current, subtitle: value }));
              }}
            />
            <FormInput
              label="Estimated minutes"
              type="number"
              min={0}
              value={dayForm.estimated_minutes}
              onChange={(event) => {
                const value = event.currentTarget?.value ?? "0";
                setDayForm((current) => ({ ...current, estimated_minutes: Number(value) || 0 }));
              }}
            />
            <div className="lg:col-span-2">
              <FormSwitch
                checked={dayForm.is_published}
                onChange={(checked) => setDayForm((current) => ({ ...current, is_published: checked }))}
                label="Публикуван ден"
                description="Само публикуваните дни се виждат в student приложението."
              />
            </div>
          </div>
          <FormTextarea
            label="Описание"
            rows={6}
            value={dayForm.description}
            onChange={(event) => {
              const value = event.currentTarget?.value ?? "";
              setDayForm((current) => ({ ...current, description: value }));
            }}
          />
          <div className="flex flex-wrap gap-3">
            <NeonButton type="button" onClick={() => void handleSaveDay()} disabled={isSaving}>
              <Save className="h-4 w-4" />
              Запази деня
            </NeonButton>
            {renderDayActions(dayNumber)}
          </div>
        </NeonCard>
      </div>
    );
  } else if (mode === "lesson") {
    content = (
      <div className="space-y-6">
        <SectionHeader
          label={`Ден ${dayNumber}`}
          title="Lesson editor"
          action={<NeonButton href={buildAdminDayHref(dayNumber, "video")} variant="secondary">Към видеото</NeonButton>}
        />
        <NeonCard padding="md" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <FormInput
              label="Lesson title"
              value={lessonForm.title}
              onChange={(event) => {
                const value = event.currentTarget?.value ?? "";
                setLessonForm((current) => ({ ...current, title: value }));
              }}
            />
            <FormInput
              label="Estimated minutes"
              type="number"
              min={0}
              value={lessonForm.estimated_minutes}
              onChange={(event) => {
                const value = event.currentTarget?.value ?? "0";
                setLessonForm((current) => ({ ...current, estimated_minutes: Number(value) || 0 }));
              }}
            />
            <div className="lg:col-span-2">
              <FormSwitch
                checked={lessonForm.is_published}
                onChange={(checked) => setLessonForm((current) => ({ ...current, is_published: checked }))}
                label="Публикуван урок"
                description="Секциите стават видими за ученика, когато урокът е публикуван."
              />
            </div>
          </div>
          <FormTextarea
            label="Intro / content"
            rows={8}
            value={lessonForm.content}
            onChange={(event) => {
              const value = event.currentTarget?.value ?? "";
              setLessonForm((current) => ({ ...current, content: value }));
            }}
          />
          <NeonButton type="button" onClick={() => void handleSaveLesson()} disabled={isSaving}>
            <Save className="h-4 w-4" />
            Запази урока
          </NeonButton>
        </NeonCard>

        {!activeLesson ? (
          <EmptyState
            title="Още няма урок за този ден"
            description="Създай урока и после ще можеш да управляваш секции, формули, примери и съвети."
            action={<NeonButton onClick={() => void handleSaveLesson()}>Създай урок</NeonButton>}
          />
        ) : (
          <>
            <NeonCard padding="md" className="space-y-4">
              <SectionHeader
                label="Lesson sections"
                title="Подреди теорията на деня"
              />
              {activeSections.length === 0 ? (
                <EmptyState
                  title="Няма lesson sections"
                  description="Добави теория, пример, формула или tip, за да подредиш урока."
                />
              ) : (
                <div className="space-y-3">
                  {activeSections.map((section, index) => (
                    <div key={section.id} className="rounded-[24px] border border-white/8 bg-slate-950/35 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge tone="cyan">{section.section_type}</Badge>
                            <Badge tone="neutral">#{section.sort_order}</Badge>
                          </div>
                          <h3 className="mt-3 text-lg font-semibold text-white">{section.title}</h3>
                          <p className="mt-2 line-clamp-3 text-sm text-[var(--mh-text-muted)]">{section.content}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <NeonButton type="button" variant="ghost" onClick={() => openSectionEditor(section)}>
                            Редактирай
                          </NeonButton>
                          <NeonButton
                            type="button"
                            variant="ghost"
                            onClick={() => void handleReorderSections(section.id, "up")}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </NeonButton>
                          <NeonButton
                            type="button"
                            variant="ghost"
                            onClick={() => void handleReorderSections(section.id, "down")}
                            disabled={index === activeSections.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </NeonButton>
                          <NeonButton type="button" variant="danger" onClick={() => void handleDeleteSection(section.id)}>
                            <Trash2 className="h-4 w-4" />
                          </NeonButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </NeonCard>

            <NeonCard padding="md" className="space-y-4">
              <SectionHeader
                label="Section editor"
                title={editingSectionId ? "Редакция на секция" : "Нова секция"}
              />
              <div className="grid gap-4 lg:grid-cols-2">
                <FormInput
                  label="Заглавие"
                  value={sectionForm.title}
                  onChange={(event) => {
                    const value = event.currentTarget?.value ?? "";
                    setSectionForm((current) => ({ ...current, title: value }));
                  }}
                />
                <FormSelect
                  label="Тип секция"
                  value={sectionForm.section_type}
                  onChange={(event) => {
                    const value = event.currentTarget?.value ?? "theory";
                    setSectionForm((current) => ({ ...current, section_type: value }));
                  }}
                >
                  {SECTION_TYPES.map((sectionType) => (
                    <option key={sectionType} value={sectionType}>
                      {sectionType}
                    </option>
                  ))}
                </FormSelect>
                <FormInput
                  label="Sort order"
                  type="number"
                  min={1}
                  value={sectionForm.sort_order}
                  onChange={(event) => {
                    const value = event.currentTarget?.value ?? "1";
                    setSectionForm((current) => ({ ...current, sort_order: Number(value) || 1 }));
                  }}
                />
              </div>
              <FormTextarea
                label="Съдържание"
                rows={8}
                value={sectionForm.content}
                onChange={(event) => {
                  const value = event.currentTarget?.value ?? "";
                  setSectionForm((current) => ({ ...current, content: value }));
                }}
              />
              <div className="flex flex-wrap gap-3">
                <NeonButton type="button" onClick={() => void handleSaveSection()} disabled={isSaving}>
                  <Save className="h-4 w-4" />
                  {editingSectionId ? "Запази секцията" : "Добави секция"}
                </NeonButton>
                {editingSectionId ? (
                  <NeonButton
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditingSectionId(null);
                      setSectionForm(getEmptySectionForm(activeLesson?.id ?? "", activeSections.length + 1));
                    }}
                  >
                    Отказ
                  </NeonButton>
                ) : null}
              </div>
            </NeonCard>
          </>
        )}
      </div>
    );
  } else if (mode === "video") {
    content = (
      <div className="space-y-6">
        <SectionHeader
          label={`Ден ${dayNumber}`}
          title="Видео към урока"
          action={<NeonButton href={buildAdminDayHref(dayNumber, "lesson")} variant="secondary">Към урока</NeonButton>}
        />
        <NeonCard padding="md" className="space-y-4">
          {!activeLesson ? (
            <EmptyState
              title="Няма урок за този ден"
              description="Създай урока първо, за да закачиш видео към него."
              action={<NeonButton href={buildAdminDayHref(dayNumber, "lesson")}>Създай урок за този ден</NeonButton>}
            />
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <FormSelect
                  label="Video provider"
                  value={lessonForm.video_provider ?? "none"}
                  onChange={(event) => {
                    const value = event.currentTarget?.value ?? "none";
                    setLessonForm((current) => ({
                      ...current,
                      video_provider: value as LessonInput["video_provider"],
                    }));
                  }}
                >
                  <option value="none">none</option>
                  <option value="youtube">youtube</option>
                  <option value="vimeo">vimeo</option>
                  <option value="external">external</option>
                  <option value="uploaded">uploaded</option>
                </FormSelect>
                <FormSelect
                  label="Video status"
                  value={lessonForm.video_status ?? "draft"}
                  onChange={(event) => {
                    const value = event.currentTarget?.value ?? "draft";
                    setLessonForm((current) => ({
                      ...current,
                      video_status: value as LessonInput["video_status"],
                    }));
                  }}
                >
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                </FormSelect>
                <FormInput
                  label="Video URL"
                  placeholder="https://youtube.com/... или https://vimeo.com/..."
                  value={lessonForm.video_url ?? ""}
                  hint="Постави линк към YouTube, Vimeo или външно видео."
                  onChange={(event) => {
                    const value = event.currentTarget?.value ?? "";
                    setLessonForm((current) => ({
                      ...current,
                      video_url: value.trim(),
                    }));
                  }}
                />
                <FormInput
                  label="Video title"
                  value={lessonForm.video_title ?? ""}
                  onChange={(event) => {
                    const value = event.currentTarget?.value ?? "";
                    setLessonForm((current) => ({ ...current, video_title: value }));
                  }}
                />
                <FormInput
                  label="Thumbnail URL"
                  value={lessonForm.video_thumbnail_url ?? ""}
                  onChange={(event) => {
                    const value = event.currentTarget?.value ?? "";
                    setLessonForm((current) => ({ ...current, video_thumbnail_url: value }));
                  }}
                />
                <FormInput
                  label="Duration in seconds"
                  type="number"
                  min={0}
                  value={lessonForm.video_duration_seconds ?? ""}
                  onChange={(event) => {
                    const value = event.currentTarget?.value ?? "";
                    setLessonForm((current) => ({
                      ...current,
                      video_duration_seconds: Number(value || "0") || 0,
                    }));
                  }}
                />
              </div>
              <div className="space-y-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div>
                  <p className="text-sm font-semibold text-white">Качи видео</p>
                  <p className="mt-1 text-xs text-[var(--mh-text-muted)]">
                    Позволени формати: mp4, webm, mov. Максимум {LESSON_VIDEO_MAX_MB} MB.
                  </p>
                </div>
                <FormInput
                  label="Video upload"
                  type="file"
                  accept={LESSON_VIDEO_ALLOWED_TYPES.join(",")}
                  onChange={(event) => {
                    const input = event.currentTarget;
                    const file = input?.files?.[0];
                    if (file) {
                      void handleVideoUpload(file);
                    }
                    if (input) {
                      input.value = "";
                    }
                  }}
                />
                {videoUpload.isUploading || videoUpload.error || videoUpload.success ? (
                  <div className="rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
                    <div className="flex items-center justify-between gap-3 text-sm text-white">
                      <span>
                        {videoUpload.isUploading
                          ? "Качвам видео..."
                          : videoUpload.error
                            ? "Качването не успя"
                            : "Видеото е качено"}
                      </span>
                      <span>{videoUpload.progress}%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-cyan-300 transition-all"
                        style={{ width: `${videoUpload.progress}%` }}
                      />
                    </div>
                    {videoUpload.error ? <p className="mt-3 text-sm text-rose-300">{videoUpload.error}</p> : null}
                    {videoUpload.success ? <p className="mt-3 text-sm text-emerald-300">{videoUpload.success}</p> : null}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <NeonButton type="button" onClick={() => void handleSaveVideo()} disabled={isSaving || videoUpload.isUploading}>
                  <Save className="h-4 w-4" />
                  Запази видео настройките
                </NeonButton>
                <NeonButton type="button" variant="ghost" onClick={() => void handleRemoveVideo()}>
                  Премахни видео
                </NeonButton>
              </div>
              {previewVideo ? (
                <NeonCard tone="muted" padding="sm" className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="mh-label">Video Preview</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">{lessonForm.video_title || activeLesson.title}</h3>
                    </div>
                    {getVideoBadge({
                      ...activeLesson,
                      video_url: lessonForm.video_url,
                      video_status: lessonForm.video_status,
                    })}
                  </div>
                  {previewVideo.kind === "embed" ? (
                    <div className="aspect-video overflow-hidden rounded-[24px] border border-white/10">
                      <iframe
                        src={previewVideo.src}
                        title={lessonForm.video_title || activeLesson.title}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : previewVideo.kind === "file" ? (
                    <video controls preload="metadata" className="w-full rounded-[24px] border border-white/10 bg-black">
                      <source src={previewVideo.src} />
                    </video>
                  ) : (
                    <NeonButton href={previewVideo.src} target="_blank" rel="noreferrer" variant="secondary">
                      Отвори външното видео
                    </NeonButton>
                  )}
                </NeonCard>
              ) : null}
            </>
          )}
        </NeonCard>
      </div>
    );
  } else if (mode === "practice" || mode === "quiz" || mode === "bonus") {
    content = (
      <div className="space-y-6">
        <SectionHeader
          label={`Ден ${dayNumber}`}
          title={getQuestionEditorTitle(currentQuestionGroup)}
          action={<NeonButton href={buildAdminDayHref(dayNumber, "preview")} variant="secondary">Preview</NeonButton>}
        />
        {filteredQuestions.length === 0 ? (
          <EmptyState
            title={`Още няма ${getQuestionGroupLabel(currentQuestionGroup).toLowerCase()} за този ден`}
            description="Добави първата задача отдолу и тя ще се появи веднага в списъка."
          />
        ) : (
          <div className="space-y-3">
            {filteredQuestions.map((question) => (
              <NeonCard key={question.id} padding="sm" className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="cyan">{question.question_type}</Badge>
                      <Badge tone="purple">{question.points} т.</Badge>
                      <Badge tone={question.is_published ? "green" : "gold"}>
                        {question.is_published ? "Публикувана" : "Чернова"}
                      </Badge>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-white">{question.prompt}</h3>
                    <p className="mt-2 text-sm text-[var(--mh-text-muted)]">{question.topic || "Без тема"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <NeonButton type="button" variant="ghost" onClick={() => openQuestionEditor(question)}>
                      Редактирай
                    </NeonButton>
                    <NeonButton
                      type="button"
                      variant={question.is_published ? "ghost" : "success"}
                      onClick={() => {
                        void savePlanQuestion(question.id, {
                          course_day_id: question.course_day_id,
                          lesson_id: question.lesson_id,
                          question_type: question.question_type,
                          prompt: question.prompt,
                          explanation: question.explanation,
                          expected_answer: question.expected_answer,
                          difficulty: question.difficulty,
                          points: question.points,
                          topic: question.topic,
                          is_bonus: getResolvedQuestionGroup(question) === "bonus",
                          question_group: getResolvedQuestionGroup(question),
                          sort_order: question.sort_order,
                          is_published: !question.is_published,
                          options: questionOptionsById.get(question.id) ?? [],
                        })
                          .then(loadSnapshot)
                          .then(() =>
                            showToast("success", !question.is_published ? "Задачата е публикувана." : "Задачата е скрита."),
                          )
                          .catch((publishError) =>
                            showToast("error", publishError instanceof Error ? publishError.message : "Не успях да обновя задачата."),
                          );
                      }}
                    >
                      {question.is_published ? "Unpublish" : "Publish"}
                    </NeonButton>
                    <NeonButton type="button" variant="danger" onClick={() => void handleDeleteQuestion(question.id)}>
                      <Trash2 className="h-4 w-4" />
                    </NeonButton>
                  </div>
                </div>
              </NeonCard>
            ))}
          </div>
        )}
        {renderQuestionForm()}
      </div>
    );
  } else {
    const previewQuestions = {
      practice: activeQuestions.filter((question) => getResolvedQuestionGroup(question) === "practice"),
      quiz: activeQuestions.filter((question) => getResolvedQuestionGroup(question) === "quiz"),
      bonus: activeQuestions.filter((question) => getResolvedQuestionGroup(question) === "bonus"),
    };
    const publishedPreviewVideo = activeLesson?.video_status === "published" && activeLesson.video_url
      ? resolveLessonVideo(activeLesson.video_url)
      : null;

      content = (
      <div className="space-y-6">
        <SectionHeader
          label={`Preview · Ден ${dayNumber}`}
          title={activeDay?.title ?? `Ден ${dayNumber}`}
          action={<NeonButton href={buildAdminDayHref(dayNumber)} variant="secondary">Назад към редактора</NeonButton>}
        />
        <NeonCard padding="md" className="space-y-3">
          <p className="mh-label">План за деня</p>
          <h2 className="text-2xl font-semibold text-white">{activeDay?.title ?? `Ден ${dayNumber}`}</h2>
          <p className="text-sm text-[var(--mh-text-muted)]">{activeDay?.subtitle ?? ""}</p>
          <p className="text-sm text-[var(--mh-text-soft)]">{activeDay?.description ?? ""}</p>
        </NeonCard>

        {!activeLesson ? (
          <EmptyState
            title="Няма урок за preview"
            description="Създай урок и lesson sections, за да видиш student изгледа."
          />
        ) : (
          <>
            <NeonCard padding="md" className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="mh-label">Урок</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{activeLesson.title}</h3>
                </div>
                <Badge tone={activeLesson.is_published ? "green" : "gold"}>
                  {activeLesson.is_published ? "Публикуван" : "Чернова"}
                </Badge>
              </div>
              <p className="text-sm text-[var(--mh-text-soft)]">{activeLesson.content || "Все още няма въведение към урока."}</p>
              {publishedPreviewVideo ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge tone="cyan">Видео</Badge>
                    <Badge tone="green">Видимо за ученика</Badge>
                  </div>
                  {publishedPreviewVideo.kind === "embed" ? (
                    <div className="aspect-video overflow-hidden rounded-[24px] border border-white/10">
                      <iframe
                        src={publishedPreviewVideo.src}
                        title={activeLesson.video_title ?? activeLesson.title}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : publishedPreviewVideo.kind === "file" ? (
                    <video controls preload="metadata" className="w-full rounded-[24px] border border-white/10 bg-black">
                      <source src={publishedPreviewVideo.src} />
                    </video>
                  ) : (
                    <NeonButton href={publishedPreviewVideo.src} target="_blank" rel="noreferrer" variant="secondary">
                      Гледай видеото
                    </NeonButton>
                  )}
                </div>
              ) : (
                <EmptyState
                  title="Няма публикувано видео"
                  description="Ако видеото е draft или липсва, ученикът няма да вижда video секция."
                />
              )}
            </NeonCard>

            <NeonCard padding="md" className="space-y-4">
              <p className="mh-label">Lesson sections</p>
              {previewLessonSections.length === 0 ? (
                <EmptyState
                  title="Няма lesson sections"
                  description="Добави теория, пример или формула, за да попълниш урока."
                />
              ) : (
                <div className="space-y-3">
                  {previewLessonSections.map((section) => (
                    <div key={section.id} className="rounded-[20px] border border-white/8 bg-slate-950/35 p-4">
                      <div className="flex items-center gap-2">
                        <Badge tone="cyan">{section.section_type}</Badge>
                      </div>
                      <h4 className="mt-3 text-lg font-semibold text-white">{section.title}</h4>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--mh-text-soft)]">{section.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </NeonCard>

            <div className="grid gap-4 xl:grid-cols-3">
              {(["practice", "quiz", "bonus"] as const).map((group) => (
                <NeonCard key={group} padding="md" className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="mh-label">{getQuestionGroupLabel(group)}</p>
                      <h4 className="mt-2 text-lg font-semibold text-white">{previewQuestions[group].length} въпроса</h4>
                    </div>
                    <Badge tone={group === "practice" ? "purple" : group === "quiz" ? "green" : "gold"}>
                      {group}
                    </Badge>
                  </div>
                  {previewQuestions[group].length === 0 ? (
                    <EmptyState
                      title="Няма съдържание"
                      description="Тук ученикът ще види EmptyState, докато не добавиш въпроси."
                    />
                  ) : (
                    <div className="space-y-2">
                      {previewQuestions[group].slice(0, 3).map((question) => (
                        <div key={question.id} className="rounded-[18px] border border-white/8 bg-slate-950/35 px-4 py-3">
                          <p className="text-sm font-medium text-white">{question.prompt}</p>
                          <p className="mt-1 text-xs text-[var(--mh-text-muted)]">{question.topic || "Без тема"}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </NeonCard>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-8 lg:px-8">
      <NeonCard tone="muted" padding="sm" className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mh-label">Курс</p>
          <h1 className="mt-2 text-xl font-semibold text-white">10-дневна подготовка по математика</h1>
          <p className="mt-1 text-sm text-[var(--mh-text-muted)]">Slug: {DEFAULT_ADMIN_COURSE_SLUG}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <NeonButton href="/admin" variant={mode === "dashboard" ? "primary" : "ghost"}>
            <Rocket className="h-4 w-4" />
            Dashboard
          </NeonButton>
          <NeonButton href="/admin/plan" variant={mode === "plan" ? "primary" : "ghost"}>
            <Layers className="h-4 w-4" />
            10-дневен план
          </NeonButton>
          {dayNumber ? (
            <NeonButton href={buildAdminDayHref(dayNumber)} variant={mode === "day" ? "primary" : "ghost"}>
              <Sparkles className="h-4 w-4" />
              Ден {dayNumber}
            </NeonButton>
          ) : null}
        </div>
      </NeonCard>

      {content}

      {toast ? (
        <div className="fixed bottom-5 right-5 z-[80] max-w-sm">
          <NeonCard
            tone={toast.tone === "success" ? "green" : "purple"}
            padding="sm"
            className="border-white/12 shadow-[0_18px_60px_rgba(6,10,22,0.45)]"
          >
            <div className="flex items-start gap-3">
              <Badge tone={toast.tone === "success" ? "green" : "gold"}>
                {toast.tone === "success" ? "Успех" : "Грешка"}
              </Badge>
              <p className="text-sm text-white">{toast.message}</p>
            </div>
          </NeonCard>
        </div>
      ) : null}
    </div>
  );
}

class AdminPlanWorkspaceErrorBoundary extends Component<AdminPlanWorkspaceProps, { hasError: boolean; error: string | null }> {
  constructor(props: AdminPlanWorkspaceProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("AdminPlanWorkspace caught an error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title="Възникна грешка в admin workspace"
          description={this.state.error ?? "Моля, презаредете страницата или опитайте по-късно."}
          action={
            <NeonButton onClick={() => window.location.reload()}>
              Презареди
            </NeonButton>
          }
        />
      );
    }

    return <AdminPlanWorkspaceContent {...this.props} />;
  }
}

export function AdminPlanWorkspace(props: AdminPlanWorkspaceProps) {
  return <AdminPlanWorkspaceErrorBoundary {...props} />;
}

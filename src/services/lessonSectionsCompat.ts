import type { LessonSection } from "@/types/course";
import type { LessonSectionInput } from "@/types/admin";

type SupabaseLike = any;

function isMissingPublishedColumn(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error ? String(error.code ?? "") : "";
  const message = "message" in error ? String(error.message ?? "") : "";
  return code === "42703" || message.includes("lesson_sections.is_published");
}

export function normalizeLessonSection(section: Partial<LessonSection> & Pick<LessonSection, "id" | "lesson_id" | "title" | "section_type" | "content" | "sort_order" | "created_at" | "updated_at">): LessonSection {
  const hasVideo = Boolean(section.video_url);

  return {
    ...section,
    is_published: typeof section.is_published === "boolean" ? section.is_published : true,
    video_url: section.video_url ?? null,
    video_provider: section.video_provider ?? (hasVideo ? "external" : "none"),
    video_status: section.video_status ?? "draft",
  } as LessonSection;
}

function stripPublishedField<T extends LessonSectionInput | LessonSectionInput[]>(payload: T): T {
  if (Array.isArray(payload)) {
    return payload.map(({ is_published: _ignored, ...item }) => item) as T;
  }

  const { is_published: _ignored, ...item } = payload;
  return item as T;
}

export async function listPublishedLessonSectionsCompat(supabase: SupabaseLike, lessonId: string): Promise<LessonSection[]> {
  const publishedQuery = await supabase
    .from("lesson_sections")
    .select("*")
    .eq("lesson_id", lessonId)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (!publishedQuery.error) {
    return ((publishedQuery.data ?? []) as LessonSection[]).map(normalizeLessonSection);
  }

  if (!isMissingPublishedColumn(publishedQuery.error)) {
    throw new Error(publishedQuery.error.message);
  }

  const fallbackQuery = await supabase
    .from("lesson_sections")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("sort_order", { ascending: true });

  if (fallbackQuery.error) {
    throw new Error(fallbackQuery.error.message);
  }

  return ((fallbackQuery.data ?? []) as LessonSection[]).map(normalizeLessonSection);
}

export async function saveLessonSectionCompat(
  supabase: SupabaseLike,
  sectionId: string | null,
  input: LessonSectionInput,
): Promise<LessonSection> {
  const run = async (payload: LessonSectionInput | Omit<LessonSectionInput, "is_published">) => {
    if (!sectionId) {
      return supabase.from("lesson_sections").insert(payload).select("*").single();
    }

    return supabase.from("lesson_sections").update(payload).eq("id", sectionId).select("*").single();
  };

  let result = await run(input);
  if (result.error && isMissingPublishedColumn(result.error)) {
    result = await run(stripPublishedField(input));
  }

  if (result.error) {
    throw new Error(result.error.message);
  }

  return normalizeLessonSection(result.data as LessonSection);
}

export async function replaceLessonSectionsForLessonCompat(
  supabase: SupabaseLike,
  lessonId: string,
  inputs: LessonSectionInput[],
): Promise<LessonSection[]> {
  const { error: deleteError } = await supabase.from("lesson_sections").delete().eq("lesson_id", lessonId);
  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (inputs.length === 0) {
    return [];
  }

  const attemptInsert = async (payload: LessonSectionInput[] | Array<Omit<LessonSectionInput, "is_published">>) =>
    supabase.from("lesson_sections").insert(payload).select("*");

  let result = await attemptInsert(inputs);
  if (result.error && isMissingPublishedColumn(result.error)) {
    result = await attemptInsert(stripPublishedField(inputs));
  }

  if (result.error) {
    throw new Error(result.error.message);
  }

  return ((result.data ?? []) as LessonSection[]).map(normalizeLessonSection);
}

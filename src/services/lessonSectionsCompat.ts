import type { LessonSection } from "@/types/course";
import type { LessonSectionInput } from "@/types/admin";

type SupabaseLike = any;

const OPTIONAL_LESSON_SECTION_COLUMNS = [
  "is_published",
  "video_url",
  "video_provider",
  "video_status",
] as const;

type OptionalLessonSectionColumn = (typeof OPTIONAL_LESSON_SECTION_COLUMNS)[number];

function getErrorText(error: unknown) {
  if (!error || typeof error !== "object") {
    return "";
  }

  const message = "message" in error ? String(error.message ?? "") : "";
  const details = "details" in error ? String(error.details ?? "") : "";
  const hint = "hint" in error ? String(error.hint ?? "") : "";
  return [message, details, hint, JSON.stringify(error)].join(" ");
}

function getMissingLessonSectionColumn(error: unknown): OptionalLessonSectionColumn | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const code = "code" in error ? String(error.code ?? "") : "";
  if (code !== "42703" && code !== "PGRST204") {
    return null;
  }

  const combinedText = getErrorText(error);
  const lowerCombinedText = combinedText.toLowerCase();

  for (const column of OPTIONAL_LESSON_SECTION_COLUMNS) {
    if (
      combinedText.includes(`lesson_sections.${column}`) ||
      (combinedText.includes(`'${column}'`) && combinedText.includes("'lesson_sections'")) ||
      (combinedText.includes(`"${column}"`) && combinedText.includes("\"lesson_sections\"")) ||
      (lowerCombinedText.includes(column) &&
        lowerCombinedText.includes("lesson_sections") &&
        lowerCombinedText.includes("schema cache")) ||
      lowerCombinedText.includes(`column lesson_sections.${column} does not exist`)
    ) {
      return column;
    }
  }

  return null;
}

function stripLessonSectionFields<T extends LessonSectionInput | LessonSectionInput[]>(
  payload: T,
  fieldsToStrip: ReadonlySet<OptionalLessonSectionColumn>,
): T {
  if (fieldsToStrip.size === 0) {
    return payload;
  }

  const stripItem = (item: LessonSectionInput) => {
    const nextItem: Record<string, unknown> = { ...item };
    for (const field of fieldsToStrip) {
      delete nextItem[field];
    }
    return nextItem;
  };

  if (Array.isArray(payload)) {
    return payload.map((item) => stripItem(item)) as unknown as T;
  }

  return stripItem(payload) as unknown as T;
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

  if (getMissingLessonSectionColumn(publishedQuery.error) !== "is_published") {
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
  const run = async (payload: LessonSectionInput | Partial<LessonSectionInput>) => {
    if (!sectionId) {
      return supabase.from("lesson_sections").insert(payload).select("*").single();
    }

    return supabase.from("lesson_sections").update(payload).eq("id", sectionId).select("*").single();
  };

  const missingColumns = new Set<OptionalLessonSectionColumn>();

  while (true) {
    const result = await run(stripLessonSectionFields(input, missingColumns));

    if (!result.error) {
      return normalizeLessonSection(result.data as LessonSection);
    }

    const missingColumn = getMissingLessonSectionColumn(result.error);
    if (!missingColumn || missingColumns.has(missingColumn)) {
      throw new Error(result.error.message);
    }

    missingColumns.add(missingColumn);
  }
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

  const attemptInsert = async (payload: LessonSectionInput[] | Array<Partial<LessonSectionInput>>) =>
    supabase.from("lesson_sections").insert(payload).select("*");

  const missingColumns = new Set<OptionalLessonSectionColumn>();

  while (true) {
    const result = await attemptInsert(stripLessonSectionFields(inputs, missingColumns));

    if (!result.error) {
      return ((result.data ?? []) as LessonSection[]).map(normalizeLessonSection);
    }

    const missingColumn = getMissingLessonSectionColumn(result.error);
    if (!missingColumn || missingColumns.has(missingColumn)) {
      throw new Error(result.error.message);
    }

    missingColumns.add(missingColumn);
  }
}

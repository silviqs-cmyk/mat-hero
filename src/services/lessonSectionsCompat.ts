import type { LessonSection } from "@/types/course";
import type { LessonSectionInput, LessonSectionPatch, LessonSectionSave } from "@/types/admin";
import { getSectionPatch, SECTION_EDITABLE_FIELDS } from "@/lib/adminTheorySections";

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

function stripLessonSectionFields<T extends Partial<LessonSectionInput> | Partial<LessonSectionInput>[]>(
  payload: T,
  fieldsToStrip: ReadonlySet<OptionalLessonSectionColumn>,
): T {
  if (fieldsToStrip.size === 0) {
    return payload;
  }

  const stripItem = (item: Partial<LessonSectionInput>) => {
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
    mini_task_answer: section.mini_task_answer ?? null,
    mini_task_explanation: section.mini_task_explanation ?? null,
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
  baseline?: LessonSection,
  insertId?: string,
): Promise<LessonSection> {
  if (sectionId) {
    const saved = baseline ?? await readSection(supabase, sectionId, input.lesson_id);
    const [result] = await saveLessonSectionsCompat(supabase, input.lesson_id, [{
      kind: "update", id: sectionId, baseline: saved, patch: getSectionPatch(saved, input),
    }]);
    return result;
  }
  const [result] = await saveLessonSectionsCompat(supabase, input.lesson_id, [{
    kind: "create", id: insertId ?? crypto.randomUUID(), input,
  }]);
  return result;
}

async function readSection(supabase: SupabaseLike, id: string, lessonId: string): Promise<LessonSection> {
  const { data, error } = await supabase.from("lesson_sections").select("*")
    .eq("id", id).eq("lesson_id", lessonId).single();
  if (error || !data) throw new Error("Секцията липсва или е от друг урок. Презареди редактора.");
  return normalizeLessonSection(data);
}

function sanitizePatch(patch: LessonSectionPatch): LessonSectionPatch {
  return Object.fromEntries(SECTION_EDITABLE_FIELDS.filter(key => patch[key] !== undefined)
    .map(key => [key, patch[key]])) as LessonSectionPatch;
}

export async function validateLessonSectionSaves(supabase: SupabaseLike, lessonId: string, inputs: LessonSectionSave[]) {
  if (new Set(inputs.map(input => input.id)).size !== inputs.length) throw new Error("Повтарящи се section IDs.");
  for (const input of inputs) {
    if (input.kind === "create") {
      if (input.input.lesson_id !== lessonId) throw new Error("Новата секция е от друг урок.");
      continue;
    }
    if (input.baseline.id !== input.id || input.baseline.lesson_id !== lessonId) throw new Error("Невалидна връзка на секцията.");
    const current = await readSection(supabase, input.id, lessonId);
    const patch = sanitizePatch(input.patch);
    // An identical retry is harmless; otherwise the original snapshot must still be current.
    const alreadySaved = Object.entries(patch).every(([key, value]) => current[key as keyof LessonSection] === value);
    if (!alreadySaved && current.updated_at !== input.baseline.updated_at) {
      throw new Error("Секцията е променена междувременно. Презареди редактора преди запис.");
    }
  }
}

export async function saveLessonSectionsCompat(
  supabase: SupabaseLike,
  lessonId: string,
  inputs: LessonSectionSave[],
): Promise<LessonSection[]> {
  await validateLessonSectionSaves(supabase, lessonId, inputs);
  const saved: LessonSection[] = [];
  for (const input of inputs) {
    const missingColumns = new Set<OptionalLessonSectionColumn>();
    const patch = input.kind === "update" ? sanitizePatch(input.patch) : null;
    if (input.kind === "update") {
      const current = await readSection(supabase, input.id, lessonId);
      if (Object.entries(patch!).every(([key, value]) => current[key as keyof LessonSection] === value)) {
        saved.push(current);
        continue;
      }
    }
    while (true) {
      const payload = stripLessonSectionFields(input.kind === "create" ? {
        ...sanitizePatch(input.input), lesson_id: lessonId,
      } : patch!, missingColumns);
      if (input.kind === "update" && Object.keys(payload).length === 0) {
        saved.push(await readSection(supabase, input.id, lessonId));
        break;
      }
      const result = input.kind === "create"
        ? await supabase.from("lesson_sections").insert({ ...payload, id: input.id }).select("*").single()
        : await supabase.from("lesson_sections").update(payload).eq("id", input.id)
            .eq("lesson_id", lessonId).eq("updated_at", input.baseline.updated_at).select("*").single();
      if (!result.error) {
        saved.push(normalizeLessonSection(result.data));
        break;
      }
      if (input.kind === "create" && result.error.code === "23505") {
        const current = await readSection(supabase, input.id, lessonId);
        if (Object.entries(payload).every(([key, value]) => current[key as keyof LessonSection] === value)) {
          saved.push(current);
          break;
        }
        throw new Error("Конфликт при създаване на секция. Презареди редактора.");
      }
      const missingColumn = getMissingLessonSectionColumn(result.error);
      if (!missingColumn || missingColumns.has(missingColumn)) {
        throw new Error(result.error.code === "PGRST116"
          ? "Секцията е променена междувременно. Презареди редактора."
          : result.error.message);
      }
      missingColumns.add(missingColumn);
    }
  }
  return saved;
}

import { parseTheoryContent } from "@/lib/parseTheoryContent";
import type { LessonSection } from "@/types/course";
import type { LessonSectionInput, LessonSectionPatch, LessonSectionSave } from "@/types/admin";

export const SECTION_EDITABLE_FIELDS = [
  "title", "section_type", "content", "sort_order", "is_published",
  "video_url", "video_provider", "video_status",
] as const;

export function getSectionPatch(baseline: LessonSection, input: Partial<LessonSectionInput>): LessonSectionPatch {
  return Object.fromEntries(SECTION_EDITABLE_FIELDS
    .filter(key => input[key] !== undefined && input[key] !== baseline[key])
    .map(key => [key, input[key]])) as LessonSectionPatch;
}

const identityError = "Не мога еднозначно да свържа темите със съществуващите секции. Използвай редактора на конкретната секция за преименуване или изтриване.";

// Headings are only a conservative bridge for the existing bulk text editor.
// A missing/ambiguous heading is never interpreted as deletion or a positional match.
export function planTheorySectionSave(
  lessonId: string,
  content: string,
  title: string,
  sections: LessonSection[],
  isPublished: boolean,
  newId: (key: string) => string,
): LessonSectionSave[] {
  const topics = parseTheoryContent(content, title);
  const existing = sections.filter(section => section.section_type === "theory");
  const key = (value: string) => value.trim();
  const oldTitles = existing.map(section => key(section.title));
  const newTitles = topics.map(topic => key(topic.title));
  if (new Set(oldTitles).size !== oldTitles.length || new Set(newTitles).size !== newTitles.length
    || oldTitles.some(value => !newTitles.includes(value))) throw new Error(identityError);
  const occupiedOrders = new Set(sections.filter(section => section.section_type !== "theory").map(section => section.sort_order));
  if (topics.some((_, index) => occupiedOrders.has(index + 1))) throw new Error(identityError);
  return topics.map((topic, index) => {
    const section = existing.find(section => key(section.title) === key(topic.title));
    if (section) {
      return { kind: "update", id: section.id, baseline: section,
        patch: getSectionPatch(section, { title: topic.title, content: topic.content, sort_order: index + 1 }) };
    }
    return { kind: "create", id: newId(key(topic.title)), input: {
      lesson_id: lessonId, title: topic.title, section_type: "theory", content: topic.content,
      sort_order: index + 1, is_published: isPublished, video_url: null, video_provider: "none", video_status: "draft",
    } };
  });
}

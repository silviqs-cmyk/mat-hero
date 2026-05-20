import type { LessonSection } from "@/types/course";

export interface ParsedTheoryTopic {
  title: string;
  type: "theory";
  content: string;
}

const TITLE_FALLBACK = "\u0422\u0435\u043c\u0430";
const TOPIC_MARKER_PATTERN = /^##\s*\u0442\u0435\u043c\u0430\s*:\s*(.+?)\s*$/iu;

function normalizeTheoryContent(rawContent: string) {
  return rawContent.replace(/\r\n/g, "\n").trim();
}

function parseMarkedTopics(normalizedContent: string): ParsedTheoryTopic[] {
  const lines = normalizedContent.split("\n");
  const markers = lines
    .map((line, index) => {
      const match = line.trim().match(TOPIC_MARKER_PATTERN);
      if (!match) {
        return null;
      }

      return {
        index,
        title: match[1]?.trim() || "",
      };
    })
    .filter((value): value is { index: number; title: string } => Boolean(value));

  if (markers.length === 0) {
    return [];
  }

  return markers
    .map((marker, markerIndex) => {
      const nextMarkerIndex = markers[markerIndex + 1]?.index ?? lines.length;
      const content = lines.slice(marker.index + 1, nextMarkerIndex).join("\n").trim();

      return {
        title: marker.title || `${TITLE_FALLBACK} ${markerIndex + 1}`,
        type: "theory" as const,
        content,
      };
    })
    .filter((topic) => topic.content.length > 0);
}

function parseFallbackTopic(normalizedContent: string, fallbackTitle: string): ParsedTheoryTopic[] {
  return [
    {
      title: fallbackTitle.trim() || TITLE_FALLBACK,
      type: "theory",
      content: normalizedContent,
    },
  ];
}

export function parseTheoryContent(rawContent: string, fallbackTitle = TITLE_FALLBACK): ParsedTheoryTopic[] {
  const normalizedContent = normalizeTheoryContent(rawContent);

  if (!normalizedContent) {
    return [];
  }

  const markedTopics = parseMarkedTopics(normalizedContent);
  if (markedTopics.length > 0) {
    return markedTopics;
  }

  return parseFallbackTopic(normalizedContent, fallbackTitle);
}

export function buildLessonSectionsFromTheoryContent(
  lesson: Pick<LessonSection, "id" | "lesson_id" | "created_at" | "updated_at" | "is_published">,
  rawContent: string,
  fallbackTitle: string,
  existingSections: Array<
    Partial<Pick<LessonSection, "sort_order" | "video_url" | "video_provider" | "video_status">>
  > = [],
): LessonSection[] {
  return parseTheoryContent(rawContent, fallbackTitle).map((topic, index) => {
    const savedSection = existingSections.find((section) => section.sort_order === index + 1);

    return {
      id: `${lesson.id}-parsed-${index + 1}`,
      lesson_id: lesson.lesson_id,
      title: topic.title,
      section_type: "theory",
      content: topic.content,
      sort_order: index + 1,
      is_published: lesson.is_published,
      video_url: savedSection?.video_url ?? null,
      video_provider: savedSection?.video_provider ?? "none",
      video_status: savedSection?.video_status ?? "draft",
      created_at: lesson.created_at,
      updated_at: lesson.updated_at,
    };
  });
}

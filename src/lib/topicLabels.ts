import { buildLessonHref } from "@/lib/studentFlow";

const TOPIC_LABELS: Record<string, string> = {
  rational_numbers: "Рационални числа",
  "rational numbers": "Рационални числа",
  integer_operations: "Действия с цели числа",
  "integer operations": "Действия с цели числа",
  fractions: "Дроби",
  divisibility: "Делимост",
  absolute_value: "Абсолютна стойност",
  "absolute value": "Абсолютна стойност",
  prime_composite: "Прости и съставни числа",
  "prime and composite numbers": "Прости и съставни числа",
  "prime numbers": "Прости числа",
  gcd_lcm: "НОД и НОК",
  "gcd and lcm": "НОД и НОК",
  order_of_operations: "Ред на действията",
  "order of operations": "Ред на действията",
  "natural numbers": "Естествени числа",
};

function toHumanReadableTopic(topic: string) {
  return topic
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase("bg-BG"));
}

function normalizeTopicValue(value: string) {
  return value
    .toLocaleLowerCase("bg-BG")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatTopicLabel(topic: string | null | undefined) {
  const normalizedTopic = topic?.trim();
  if (!normalizedTopic) {
    return "Без тема";
  }

  const normalizedKey = normalizeTopicValue(normalizedTopic);

  return TOPIC_LABELS[normalizedTopic] ?? TOPIC_LABELS[normalizedKey] ?? toHumanReadableTopic(normalizedTopic);
}

export function findLessonSectionIndexForTopic(
  sections: Array<{ title?: string | null; content?: string | null }>,
  topic: string | null | undefined,
) {
  const normalizedTopic = topic?.trim();
  if (!normalizedTopic) {
    return 0;
  }

  const formattedTopic = formatTopicLabel(normalizedTopic);
  const candidates = [normalizedTopic, formattedTopic].map(normalizeTopicValue);

  const matchIndex = sections.findIndex((section) => {
    const title = normalizeTopicValue(section.title ?? "");
    const content = normalizeTopicValue(section.content ?? "");

    return candidates.some((candidate) => {
      if (!candidate) {
        return false;
      }

      return title.includes(candidate) || content.includes(candidate);
    });
  });

  return matchIndex >= 0 ? matchIndex : 0;
}

export function buildLessonTopicHref(courseSlug: string, dayNumber: number, topic: string | null | undefined) {
  const lessonHref = buildLessonHref(courseSlug, dayNumber);
  const normalizedTopic = topic?.trim();

  if (!normalizedTopic) {
    return lessonHref;
  }

  return `${lessonHref}?topic=${encodeURIComponent(normalizedTopic)}`;
}

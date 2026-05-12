import type { LessonSection } from "@/types/course";

const TITLE_FALLBACK = "Тема";

function normalizeContent(content: string) {
  return content.replace(/\r\n/g, "\n").trim();
}

function isLikelyTopicTitle(line: string) {
  const value = line.trim();

  if (!value) {
    return false;
  }

  if (value.length > 72) {
    return false;
  }

  if (/[.?!]$/.test(value)) {
    return false;
  }

  if (/^[\d\s./()+\-=:|]+$/.test(value)) {
    return false;
  }

  const words = value.split(/\s+/);
  if (words.length > 8) {
    return false;
  }

  return true;
}

function createVirtualSection(
  section: LessonSection,
  index: number,
  title: string,
  content: string,
): LessonSection {
  return {
    ...section,
    id: `${section.id}-topic-${index + 1}`,
    title: title.trim() || `${TITLE_FALLBACK} ${index + 1}`,
    content: content.trim(),
    sort_order: section.sort_order + index / 100,
  };
}

function splitTheoryByHeadings(section: LessonSection) {
  const lines = normalizeContent(section.content).split("\n");
  const headingIndexes: number[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]?.trim() ?? "";
    if (!line) {
      continue;
    }

    const previousIsBlank = index === 0 || !lines[index - 1]?.trim();
    const hasContentAfter = lines.slice(index + 1).some((candidate) => candidate.trim().length > 0);

    if (previousIsBlank && hasContentAfter && isLikelyTopicTitle(line)) {
      headingIndexes.push(index);
    }
  }

  if (headingIndexes.length === 0) {
    return [];
  }

  return headingIndexes
    .map((headingIndex, index) => {
      const nextHeadingIndex = headingIndexes[index + 1] ?? lines.length;
      const title = lines[headingIndex]?.trim() ?? "";
      const content = lines.slice(headingIndex + 1, nextHeadingIndex).join("\n").trim();

      if (!content) {
        return null;
      }

      return createVirtualSection(section, index, title, content);
    })
    .filter((topic): topic is LessonSection => Boolean(topic));
}

function splitTheoryByParagraphs(section: LessonSection) {
  const blocks = normalizeContent(section.content)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length <= 1) {
    return [section];
  }

  return blocks.map((block, index) => {
    const lines = block
      .split("\n")
      .map((line) => line.trimEnd())
      .filter((line) => line.trim().length > 0);
    const firstLine = lines[0]?.trim() ?? "";
    const hasInlineTitle = lines.length > 1 && isLikelyTopicTitle(firstLine);
    const title = hasInlineTitle
      ? firstLine
      : section.title?.trim()
        ? `${section.title.trim()} ${index + 1}`
        : `${TITLE_FALLBACK} ${index + 1}`;
    const content = hasInlineTitle ? lines.slice(1).join("\n").trim() : block;

    return createVirtualSection(section, index, title, content);
  });
}

export function expandLessonSectionToTopics(section: LessonSection) {
  if (section.section_type !== "theory") {
    return [section];
  }

  const normalizedContent = normalizeContent(section.content);
  if (!normalizedContent) {
    return [];
  }

  const headingTopics = splitTheoryByHeadings(section);
  if (headingTopics.length > 0) {
    return headingTopics;
  }

  return splitTheoryByParagraphs({
    ...section,
    content: normalizedContent,
  });
}

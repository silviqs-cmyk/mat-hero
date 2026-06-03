"use client";

import { Fragment, useState } from "react";
import { renderFormattedInlineText } from "@/components/lesson/LessonSectionContent";
import { NeonButton } from "@/components/ui/NeonButton";
import { SectionLabel } from "@/components/ui/SectionLabel";

interface FormattedTheoryContentProps {
  content: string;
}

type ContentBlock =
  | { type: "paragraph"; lines: string[] }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "formula"; lines: string[] }
  | { type: "section"; label: string; lines: string[]; tone: "neutral" | "cyan" | "gold" };

const ORDERED_LIST_PATTERN = /^(\d+)\.\s+/u;
const UNORDERED_LIST_PATTERN = /^([-\u2022])\s+/u;
const STANDALONE_BOLD_PATTERN = /^\*\*([\s\S]+?)\*\*$/u;
const DIVISIBILITY_RULE_PATTERN = /^На\s+\d+\s+/u;

const SECTION_PATTERNS = [
  { pattern: /^Основно правило:\s*(.*)$/iu, label: "ОСНОВНО ПРАВИЛО", tone: "cyan" as const },
  { pattern: /^Правило:\s*(.*)$/iu, label: "ОСНОВНО ПРАВИЛО", tone: "cyan" as const },
  { pattern: /^Примери?:\s*(.*)$/iu, label: "ПРИМЕРИ", tone: "gold" as const },
  { pattern: /^Пример:\s*(.*)$/iu, label: "ПРИМЕР", tone: "gold" as const },
  { pattern: /^Важно за НВО:\s*(.*)$/iu, label: "ВАЖНО ЗА НВО", tone: "gold" as const },
  { pattern: /^За НВО е важно(?: да знаеш)?[:\s-]*(.*)$/iu, label: "ВАЖНО ЗА НВО", tone: "gold" as const },
  { pattern: /^Важно:\s*(.*)$/iu, label: "ВАЖНО", tone: "cyan" as const },
  { pattern: /^Внимавай:\s*(.*)$/iu, label: "ВНИМАВАЙ", tone: "gold" as const },
  { pattern: /^Капан:\s*(.*)$/iu, label: "КАПАН", tone: "gold" as const },
  { pattern: /^Решение:\s*(.*)$/iu, label: "РЕШЕНИЕ", tone: "neutral" as const },
  { pattern: /^Мини задача:\s*(.*)$/iu, label: "МИНИ ЗАДАЧА", tone: "neutral" as const },
  { pattern: /^Отговор:\s*(.*)$/iu, label: "ОТГОВОР", tone: "neutral" as const },
];

function isOrderedListItem(line: string) {
  return ORDERED_LIST_PATTERN.test(line);
}

function isUnorderedListItem(line: string) {
  return UNORDERED_LIST_PATTERN.test(line);
}

function isDivisibilityRuleLine(line: string) {
  return DIVISIBILITY_RULE_PATTERN.test(line.trim());
}

function stripListMarker(line: string) {
  return line.replace(ORDERED_LIST_PATTERN, "").replace(UNORDERED_LIST_PATTERN, "").trim();
}

function getSectionMatch(line: string) {
  for (const entry of SECTION_PATTERNS) {
    const match = line.match(entry.pattern);
    if (match) {
      return {
        label: entry.label,
        tone: entry.tone,
        firstLine: match[1]?.trim() ?? "",
      };
    }
  }

  return null;
}

function isFormulaLikeLine(line: string) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.length > 100) {
    return false;
  }

  if (/\\frac\s*\{.+\}\s*\{.+\}/u.test(trimmed)) {
    return true;
  }

  if (/\b\d+\s*\/\s*\d+\b/u.test(trimmed)) {
    return true;
  }

  if (/(\|[^|]+\|)|[=≠≥≤√^·]/u.test(trimmed)) {
    return true;
  }

  return /[\p{L}\p{N}]\s*[:+\-*/]\s*[\p{L}\p{N}]/u.test(trimmed);
}

function renderInline(line: string, keyPrefix: string) {
  return renderFormattedInlineText(line, keyPrefix).map((node, index) => (
    <Fragment key={`${keyPrefix}-${index}`}>{node}</Fragment>
  ));
}

function getStandaloneBoldText(line: string) {
  return line.match(STANDALONE_BOLD_PATTERN)?.[1]?.trim() ?? null;
}

function buildBlocks(content: string): ContentBlock[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ContentBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const rawLine = lines[index] ?? "";
    const currentLine = rawLine.trimEnd();
    const trimmedLine = currentLine.trim();

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    const section = getSectionMatch(trimmedLine);
    if (section) {
      const sectionLines = section.firstLine ? [section.firstLine] : [];
      index += 1;

      while (index < lines.length) {
        const nextLine = (lines[index] ?? "").trimEnd();
        const nextTrimmed = nextLine.trim();

        if (!nextTrimmed) {
          break;
        }

        if (getSectionMatch(nextTrimmed) || isOrderedListItem(nextTrimmed) || isUnorderedListItem(nextTrimmed)) {
          break;
        }

        sectionLines.push(nextTrimmed);
        index += 1;
      }

      blocks.push({ type: "section", label: section.label, tone: section.tone, lines: sectionLines });
      continue;
    }

    if (isOrderedListItem(trimmedLine) || isUnorderedListItem(trimmedLine)) {
      const ordered = isOrderedListItem(trimmedLine);
      const items: string[] = [];

      while (index < lines.length) {
        const nextLine = (lines[index] ?? "").trimEnd();
        const nextTrimmed = nextLine.trim();

        if (!nextTrimmed) {
          break;
        }

        const matchesExpectedType = ordered ? isOrderedListItem(nextTrimmed) : isUnorderedListItem(nextTrimmed);
        if (!matchesExpectedType) {
          break;
        }

        items.push(stripListMarker(nextTrimmed));
        index += 1;
      }

      blocks.push({ type: "list", ordered, items });
      continue;
    }

    if (isDivisibilityRuleLine(trimmedLine)) {
      const items: string[] = [];

      while (index < lines.length) {
        const nextTrimmed = ((lines[index] ?? "").trimEnd()).trim();
        if (!nextTrimmed || !isDivisibilityRuleLine(nextTrimmed)) {
          break;
        }

        items.push(nextTrimmed);
        index += 1;
      }

      blocks.push({ type: "list", ordered: false, items });
      continue;
    }

    const groupLines: string[] = [];
    while (index < lines.length) {
      const nextLine = (lines[index] ?? "").trimEnd();
      const nextTrimmed = nextLine.trim();

      if (!nextTrimmed) {
        break;
      }

      if (getSectionMatch(nextTrimmed) || isOrderedListItem(nextTrimmed) || isUnorderedListItem(nextTrimmed) || isDivisibilityRuleLine(nextTrimmed)) {
        break;
      }

      groupLines.push(nextTrimmed);
      index += 1;
    }

    const isFormulaBlock = groupLines.length > 0 && groupLines.every((line) => isFormulaLikeLine(line));
    if (isFormulaBlock) {
      blocks.push({ type: "formula", lines: groupLines });
    } else if (groupLines.length > 0) {
      blocks.push({ type: "paragraph", lines: groupLines });
    }
  }

  return blocks;
}

function getSectionToneClass(tone: "neutral" | "cyan" | "gold") {
  switch (tone) {
    case "cyan":
      return "border-cyan-400/16 bg-cyan-400/[0.04]";
    case "gold":
      return "border-amber-400/16 bg-amber-400/[0.04]";
    default:
      return "border-white/10 bg-white/[0.02]";
  }
}

function getSectionLabelClass(tone: "neutral" | "cyan" | "gold") {
  switch (tone) {
    case "cyan":
      return "text-[var(--mh-accent-cyan-soft)]";
    case "gold":
      return "text-amber-200/90";
    default:
      return "text-white/70";
  }
}

function AskMatMiniTask({ prompt }: { prompt: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4 space-y-3">
      <NeonButton
        type="button"
        variant="ghost"
        className="min-h-11 px-4 py-2 text-sm"
        onClick={() => setIsOpen((current) => !current)}
      >
        Питай МАТ
      </NeonButton>
      {isOpen ? (
        <div className="rounded-[18px] border border-cyan-400/16 bg-cyan-400/[0.04] px-4 py-4">
          <SectionLabel className="text-[var(--mh-accent-cyan-soft)]">КАК ДА ТРЪГНЕШ</SectionLabel>
          <div className="mt-3 space-y-2 text-[1rem] leading-7 text-[var(--mh-text)]">
            <p>1. Прочети внимателно условието и открий какво точно се търси.</p>
            <p>2. Отдели важните числа, зависимости и ключови думи в задачата.</p>
            <p>3. Реши стъпка по стъпка и накрая провери дали отговорът пасва на условието.</p>
            {prompt ? <p className="text-white/82">Насока: {prompt}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function FormattedTheoryContent({ content }: FormattedTheoryContentProps) {
  const blocks = buildBlocks(content);

  return (
    <div className="max-w-3xl space-y-5">
      {blocks.map((block, blockIndex) => {
        if (block.type === "paragraph") {
          return (
            <div key={`paragraph-${blockIndex}`} className="space-y-3.5">
              {block.lines.map((line, lineIndex) =>
                getStandaloneBoldText(line) ? (
                  <h4
                    key={`paragraph-${blockIndex}-${lineIndex}`}
                    className="break-words pt-1 text-[1.04rem] font-semibold leading-7 tracking-normal text-white"
                  >
                    {renderInline(getStandaloneBoldText(line) ?? line, `paragraph-${blockIndex}-${lineIndex}`)}
                  </h4>
                ) : (
                  <p
                    key={`paragraph-${blockIndex}-${lineIndex}`}
                    className="break-words text-[1rem] leading-7 text-[var(--mh-text)]"
                  >
                    {renderInline(line, `paragraph-${blockIndex}-${lineIndex}`)}
                  </p>
                ),
              )}
            </div>
          );
        }

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";

          return (
            <ListTag
              key={`list-${blockIndex}`}
              className={
                block.ordered
                  ? "ml-5 list-decimal space-y-3 text-[1rem] leading-7 text-[var(--mh-text)] marker:text-cyan-200"
                  : "ml-5 list-disc space-y-3 text-[1rem] leading-7 text-[var(--mh-text)] marker:text-cyan-200"
              }
            >
              {block.items.map((item, itemIndex) => (
                <li key={`list-${blockIndex}-${itemIndex}`} className="break-words pl-1">
                  {renderInline(item, `list-${blockIndex}-${itemIndex}`)}
                </li>
              ))}
            </ListTag>
          );
        }

        if (block.type === "formula") {
          return (
            <div key={`formula-${blockIndex}`} className="rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-4">
              <div className="space-y-2.5">
                {block.lines.map((line, lineIndex) => (
                  <div
                    key={`formula-${blockIndex}-${lineIndex}`}
                    className="whitespace-pre-wrap break-words text-[1rem] font-semibold leading-7 text-white"
                  >
                    {renderInline(line, `formula-${blockIndex}-${lineIndex}`)}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        const isMiniTask = block.label === "МИНИ ЗАДАЧА";

        return (
          <div
            key={`section-${blockIndex}`}
            className={`rounded-[22px] border px-4 py-4 ${getSectionToneClass(block.tone)}`}
          >
            <SectionLabel className={getSectionLabelClass(block.tone)}>{block.label}</SectionLabel>
            <div className="mt-3 space-y-3.5">
              {block.lines.map((line, lineIndex) =>
                getStandaloneBoldText(line) ? (
                  <h4
                    key={`section-${blockIndex}-${lineIndex}`}
                    className="break-words text-[1rem] font-semibold leading-7 tracking-normal text-white"
                  >
                    {renderInline(getStandaloneBoldText(line) ?? line, `section-${blockIndex}-${lineIndex}`)}
                  </h4>
                ) : (
                  <p
                    key={`section-${blockIndex}-${lineIndex}`}
                    className="break-words text-[1rem] leading-7 text-[var(--mh-text)]"
                  >
                    {renderInline(line, `section-${blockIndex}-${lineIndex}`)}
                  </p>
                ),
              )}
            </div>
            {isMiniTask ? <AskMatMiniTask prompt={block.lines[0] ?? ""} /> : null}
          </div>
        );
      })}
    </div>
  );
}

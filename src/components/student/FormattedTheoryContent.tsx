"use client";

import { Fragment, useState } from "react";
import { renderFormattedInlineText } from "@/components/lesson/LessonSectionContent";
import { NeonButton } from "@/components/ui/NeonButton";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getMiniTaskAskMatContent } from "@/lib/miniTaskAskMatContent";

interface FormattedTheoryContentProps {
  content: string;
  sectionId?: string;
}

type ContentBlock =
  | { type: "paragraph"; lines: string[] }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "formula"; lines: string[] }
  | { type: "section"; label: string; lines: string[]; tone: "neutral" | "cyan" | "gold" };

interface MiniTaskSplitResult {
  intro: string;
  items: string[];
}

const ORDERED_LIST_PATTERN = /^(\d+)\.\s+/u;
const UNORDERED_LIST_PATTERN = /^([-\u2022])\s+/u;
const STANDALONE_BOLD_PATTERN = /^\*\*([\s\S]+?)\*\*$/u;
const MINI_TASK_TRIGGER_PATTERN = /^(пресметни|изчисли|изчислете|опрости|опростете|реши|решете|сравни|подреди|разложи|замести|намери|намерете)\b/iu;
const MINI_TASK_QUESTION_TERMS = [
  "\u043a\u043e\u0438",
  "\u0434\u0430\u043b\u0438",
  "\u043a\u0430\u043a\u0432\u043e",
  "\u0437\u0430\u0449\u043e",
  "\u0442\u0435\u043c\u0430",
  "\u0442\u0438\u043f",
  "\u043f\u043e-\u0432\u0430\u0436\u043d\u043e",
  "\u043f\u044a\u0440\u0432\u043e",
] as const;
const MINI_TASK_CLASSIFICATION_TERMS = [
  "\u043f\u0440\u043e\u0441\u0442\u0438",
  "\u0441\u044a\u0441\u0442\u0430\u0432\u043d\u0438",
  "\u0447\u0438\u0441\u043b\u0430\u0442\u0430",
  "\u0434\u0430\u043d\u043d\u0438",
  "\u0442\u0435\u043c\u0430",
  "\u0442\u0438\u043f",
] as const;
const BULGARIAN_SUBPOINT_LABELS = [
  "а",
  "б",
  "в",
  "г",
  "д",
  "е",
  "ж",
  "з",
  "и",
  "й",
  "к",
  "л",
  "м",
  "н",
  "о",
  "п",
  "р",
  "с",
  "т",
  "у",
  "ф",
  "х",
  "ц",
  "ч",
  "ш",
  "щ",
  "ъ",
  "ь",
  "ю",
  "я",
] as const;
const DIVISIBILITY_RULE_PATTERN = /^На\s+\d+\s+/u;

const SECTION_PATTERNS = [
  { pattern: /^Най-важното правило:\s*(.*)$/iu, label: "НАЙ-ВАЖНОТО ПРАВИЛО", tone: "cyan" as const },
  { pattern: /^Правило:\s*(.*)$/iu, label: "НАЙ-ВАЖНОТО ПРАВИЛО", tone: "cyan" as const },
  { pattern: /^Примери?:\s*(.*)$/iu, label: "ПРИМЕРИ", tone: "gold" as const },
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

function containsAnyTerm(value: string, terms: readonly string[]) {
  const normalizedValue = value.toLocaleLowerCase("bg-BG");
  return terms.some((term) => normalizedValue.includes(term));
}

function splitMiniTaskItems(rawItems: string) {
  const normalized = rawItems.trim().replace(/[.?!]\s*$/u, "");
  if (!normalized) {
    return [];
  }

  const sourceParts: string[] = [];
  let currentPart = "";
  let parenthesisDepth = 0;

  for (let index = 0; index < normalized.length; index += 1) {
    const character = normalized[index];

    if (character === "(") {
      parenthesisDepth += 1;
      currentPart += character;
      continue;
    }

    if (character === ")") {
      parenthesisDepth = Math.max(0, parenthesisDepth - 1);
      currentPart += character;
      continue;
    }

    if (parenthesisDepth === 0 && character === ",") {
      const trimmedPart = currentPart.trim();
      if (trimmedPart) {
        sourceParts.push(trimmedPart);
      }
      currentPart = "";
      continue;
    }

    if (parenthesisDepth === 0 && normalized.slice(index, index + 3) === " и ") {
      const trimmedPart = currentPart.trim();
      if (trimmedPart) {
        sourceParts.push(trimmedPart);
      }
      currentPart = "";
      index += 2;
      continue;
    }

    currentPart += character;
  }

  const trimmedPart = currentPart.trim();
  if (trimmedPart) {
    sourceParts.push(trimmedPart);
  }

  return sourceParts.filter(Boolean);
}

function shouldRenderMiniTaskAsSubtasks(intro: string, items: string[]) {
  if (items.length < 2 || items.some((item) => item.length > 40)) {
    return false;
  }

  const normalizedIntro = intro.trim();
  if (!normalizedIntro) {
    return false;
  }

  if (containsAnyTerm(normalizedIntro, MINI_TASK_QUESTION_TERMS) && !MINI_TASK_TRIGGER_PATTERN.test(normalizedIntro)) {
    return false;
  }

  const onlyNumbers = items.every((item) => /^[\d\s]+$/u.test(item));
  if (onlyNumbers && containsAnyTerm(normalizedIntro, MINI_TASK_CLASSIFICATION_TERMS)) {
    return false;
  }

  return true;
}

function trySplitMiniTaskLine(line: string): MiniTaskSplitResult | null {
  const trimmedLine = line.trim();
  if (!trimmedLine) {
    return null;
  }

  const colonIndex = trimmedLine.indexOf(":");
  if (colonIndex >= 0) {
    const intro = trimmedLine.slice(0, colonIndex + 1).trim();
    const items = splitMiniTaskItems(trimmedLine.slice(colonIndex + 1));

    if (shouldRenderMiniTaskAsSubtasks(intro, items)) {
      return { intro, items };
    }

    return null;
  }

  const triggerMatch = trimmedLine.match(MINI_TASK_TRIGGER_PATTERN);
  if (!triggerMatch) {
    return null;
  }

  const trigger = triggerMatch[0].trim();
  const items = splitMiniTaskItems(trimmedLine.slice(trigger.length));
  if (!shouldRenderMiniTaskAsSubtasks(trigger, items)) {
    return null;
  }

  return { intro: `${trigger}:`, items };
}

function getBulgarianSubpointLabel(index: number) {
  return BULGARIAN_SUBPOINT_LABELS[index] ? `${BULGARIAN_SUBPOINT_LABELS[index]})` : `${index + 1})`;
}

function renderMiniTaskSubtasks(items: string[], keyPrefix: string) {
  return (
    <div className="space-y-2.5">
      {items.map((item, itemIndex) => (
        <div
          key={`${keyPrefix}-${itemIndex}`}
          className="grid grid-cols-[auto_1fr] items-start gap-x-3 rounded-[16px] border border-white/8 bg-white/[0.02] px-3.5 py-3"
        >
          <span className="pt-0.5 text-[0.95rem] font-semibold leading-6 text-white/78">
            {getBulgarianSubpointLabel(itemIndex)}
          </span>
          <div className="break-words text-[1rem] leading-7 text-[var(--mh-text)]">
            {renderInline(item, `${keyPrefix}-${itemIndex}`)}
          </div>
        </div>
      ))}
    </div>
  );
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

      if (
        getSectionMatch(nextTrimmed) ||
        isOrderedListItem(nextTrimmed) ||
        isUnorderedListItem(nextTrimmed) ||
        isDivisibilityRuleLine(nextTrimmed)
      ) {
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

function AskMatMiniTask({ prompt, sectionId }: { prompt: string; sectionId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const askMatContent = getMiniTaskAskMatContent(sectionId);
  const answerLines = askMatContent?.answer
    ? askMatContent.answer
        .split(/\n+/u)
        .map((line) => line.trim())
        .filter(Boolean)
    : [];
  const explanationLines = askMatContent?.explanation
    ? askMatContent.explanation
        .split(/\n\n+/u)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="mt-4 space-y-3">
      <NeonButton
        type="button"
        variant="ghost"
        className="min-h-11 border-lime-200/80 bg-[linear-gradient(180deg,rgba(217,249,157,0.99),rgba(190,242,100,0.97))] px-4 py-2 text-sm font-semibold tracking-[0.01em] text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_0_20px_rgba(190,242,100,0.28),0_0_40px_rgba(163,230,53,0.22)] hover:border-lime-100 hover:bg-[linear-gradient(180deg,rgba(236,252,203,0.99),rgba(217,249,157,0.98))] hover:text-slate-950 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.36),0_0_28px_rgba(190,242,100,0.34),0_0_48px_rgba(163,230,53,0.26)]"
        onClick={() => setIsOpen((current) => !current)}
      >
        Питай МАТ
      </NeonButton>
      {isOpen ? (
        <div className="rounded-[18px] border border-cyan-400/16 bg-cyan-400/[0.04] px-4 py-4">
          <SectionLabel className="text-[var(--mh-accent-cyan-soft)]">Питай МАТ</SectionLabel>
          {answerLines.length > 0 ? (
            <div className="mt-3 rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-3">
              <SectionLabel className="text-white/70">Отговор</SectionLabel>
              <div className="mt-2 space-y-2 text-[1rem] leading-7 text-[var(--mh-text)]">
                {answerLines.map((line, lineIndex) => (
                  <p key={`mini-task-answer-${sectionId ?? "fallback"}-${lineIndex}`} className="break-words">
                    {renderInline(line, `mini-task-answer-${sectionId ?? "fallback"}-${lineIndex}`)}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mt-3 space-y-3 text-[1rem] leading-7 text-[var(--mh-text)]">
            {explanationLines.length > 0 ? (
              explanationLines.map((line, lineIndex) => (
                <p key={`mini-task-explanation-${sectionId ?? "fallback"}-${lineIndex}`} className="break-words">
                  {renderInline(line, `mini-task-explanation-${sectionId ?? "fallback"}-${lineIndex}`)}
                </p>
              ))
            ) : (
              <>
                <p>1. Прочети внимателно условието и открий какво точно се търси.</p>
                <p>2. Отдели важните числа, зависимости и ключови думи в задачата.</p>
                <p>3. Реши стъпка по стъпка и накрая провери дали отговорът пасва на условието.</p>
                {prompt ? <p className="text-white/82">Насока: {prompt}</p> : null}
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function renderBlockContent(block: ContentBlock, blockIndex: number) {
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
    </div>
  );
}

export function FormattedTheoryContent({ content, sectionId }: FormattedTheoryContentProps) {
  const blocks = buildBlocks(content);
  const consumedBlockIndexes = new Set<number>();

  return (
    <div className="max-w-3xl space-y-5">
      {blocks.map((block, blockIndex) => {
        if (consumedBlockIndexes.has(blockIndex)) {
          return null;
        }

        const isMiniTask = block.type === "section" && block.label === "МИНИ ЗАДАЧА";
        if (!isMiniTask) {
          return renderBlockContent(block, blockIndex);
        }

        const taskBodyBlocks: ContentBlock[] = [];
        for (let nextIndex = blockIndex + 1; nextIndex < blocks.length; nextIndex += 1) {
          const nextBlock = blocks[nextIndex];
          if (nextBlock.type === "section") {
            break;
          }

          consumedBlockIndexes.add(nextIndex);
          taskBodyBlocks.push(nextBlock);
        }

        const inlineMiniTaskSplit =
          block.lines.length === 1
            ? trySplitMiniTaskLine(block.lines[0] ?? "")
            : null;
        const bodyMiniTaskSplit =
          !inlineMiniTaskSplit &&
          block.lines.length > 0 &&
          (block.lines.at(-1)?.trim().endsWith(":") ?? false) &&
          taskBodyBlocks[0]?.type === "paragraph" &&
          taskBodyBlocks[0].lines.length === 1
            ? (() => {
                const intro = block.lines.at(-1)?.trim() ?? "";
                const items = splitMiniTaskItems(taskBodyBlocks[0].lines[0] ?? "");
                return shouldRenderMiniTaskAsSubtasks(intro, items) ? { intro, items } : null;
              })()
            : null;
        const miniTaskSplit = inlineMiniTaskSplit ?? bodyMiniTaskSplit;
        const miniTaskLeadLines = inlineMiniTaskSplit
          ? []
          : bodyMiniTaskSplit
            ? block.lines.slice(0, -1)
            : block.lines;
        const remainingTaskBodyBlocks = bodyMiniTaskSplit ? taskBodyBlocks.slice(1) : taskBodyBlocks;

        return (
          <div
            key={`section-${blockIndex}`}
            className={`rounded-[22px] border px-4 py-4 ${getSectionToneClass(block.tone)}`}
          >
            <SectionLabel className={getSectionLabelClass(block.tone)}>{block.label}</SectionLabel>
            <div className="mt-3 space-y-3.5">
              {miniTaskLeadLines.map((line, lineIndex) =>
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
              {miniTaskSplit ? (
                <div className="space-y-3">
                  <p className="break-words text-[1rem] leading-7 text-[var(--mh-text)]">
                    {renderInline(miniTaskSplit.intro, `mini-task-intro-${blockIndex}`)}
                  </p>
                  {renderMiniTaskSubtasks(miniTaskSplit.items, `mini-task-items-${blockIndex}`)}
                </div>
              ) : null}
              {remainingTaskBodyBlocks.map((taskBodyBlock, taskBodyIndex) => (
                <Fragment key={`mini-task-body-${blockIndex}-${taskBodyIndex}`}>
                  {renderBlockContent(taskBodyBlock, blockIndex + taskBodyIndex + 1)}
                </Fragment>
              ))}
            </div>
            <AskMatMiniTask prompt={block.lines[0] ?? ""} sectionId={sectionId} />
          </div>
        );
      })}
    </div>
  );
}

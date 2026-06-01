import { Fragment, type ReactNode } from "react";
import { renderFormattedInlineText } from "@/components/lesson/LessonSectionContent";
import { SectionLabel } from "@/components/ui/SectionLabel";

interface FormattedTheoryContentProps {
  content: string;
}

type ContentBlock =
  | { type: "paragraph"; lines: string[] }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "formula"; lines: string[] }
  | { type: "callout"; label: "Важно" | "Внимавай" | "Примери"; lines: string[] };

const ORDERED_LIST_PATTERN = /^(\d+)\.\s+/u;
const UNORDERED_LIST_PATTERN = /^([-\u2022])\s+/u;
const IMPORTANT_PATTERN = /^Важно:\s*(.*)$/iu;
const CAUTION_PATTERN = /^Внимавай:\s*(.*)$/iu;
const EXAMPLES_PATTERN = /^Примери?:\s*(.*)$/iu;
const STANDALONE_BOLD_PATTERN = /^\*\*([\s\S]+?)\*\*$/u;

function isOrderedListItem(line: string) {
  return ORDERED_LIST_PATTERN.test(line);
}

function isUnorderedListItem(line: string) {
  return UNORDERED_LIST_PATTERN.test(line);
}

function stripListMarker(line: string) {
  return line.replace(ORDERED_LIST_PATTERN, "").replace(UNORDERED_LIST_PATTERN, "").trim();
}

function getCalloutMatch(line: string) {
  const importantMatch = line.match(IMPORTANT_PATTERN);
  if (importantMatch) {
    return {
      label: "Важно" as const,
      firstLine: importantMatch[1]?.trim() ?? "",
    };
  }

  const cautionMatch = line.match(CAUTION_PATTERN);
  if (cautionMatch) {
    return {
      label: "Внимавай" as const,
      firstLine: cautionMatch[1]?.trim() ?? "",
    };
  }

  const examplesMatch = line.match(EXAMPLES_PATTERN);
  if (examplesMatch) {
    return {
      label: "Примери" as const,
      firstLine: examplesMatch[1]?.trim() ?? "",
    };
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

    const callout = getCalloutMatch(trimmedLine);
    if (callout) {
      const calloutLines = callout.firstLine ? [callout.firstLine] : [];
      index += 1;

      while (index < lines.length) {
        const nextLine = (lines[index] ?? "").trimEnd();
        const nextTrimmed = nextLine.trim();

        if (!nextTrimmed) {
          break;
        }

        if (getCalloutMatch(nextTrimmed)) {
          break;
        }

        calloutLines.push(nextTrimmed);
        index += 1;
      }

      blocks.push({ type: "callout", label: callout.label, lines: calloutLines });
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

    const groupLines: string[] = [];
    while (index < lines.length) {
      const nextLine = (lines[index] ?? "").trimEnd();
      const nextTrimmed = nextLine.trim();

      if (!nextTrimmed) {
        break;
      }

      if (getCalloutMatch(nextTrimmed) || isOrderedListItem(nextTrimmed) || isUnorderedListItem(nextTrimmed)) {
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

export function FormattedTheoryContent({ content }: FormattedTheoryContentProps) {
  const blocks = buildBlocks(content);

  return (
    <div className="max-w-3xl space-y-6">
      {blocks.map((block, blockIndex) => {
        if (block.type === "paragraph") {
          return (
            <div key={`paragraph-${blockIndex}`} className="space-y-3">
              {block.lines.map((line, lineIndex) => (
                getStandaloneBoldText(line) ? (
                  <h4
                    key={`paragraph-${blockIndex}-${lineIndex}`}
                    className="break-words pt-1 text-lg font-semibold leading-snug tracking-normal text-white"
                  >
                    {renderInline(getStandaloneBoldText(line) ?? line, `paragraph-${blockIndex}-${lineIndex}`)}
                  </h4>
                ) : (
                  <p
                    key={`paragraph-${blockIndex}-${lineIndex}`}
                    className="break-words text-base leading-[1.68] text-[var(--mh-text)]"
                  >
                    {renderInline(line, `paragraph-${blockIndex}-${lineIndex}`)}
                  </p>
                )
              ))}
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
                  ? "ml-5 list-decimal space-y-2.5 text-base leading-[1.68] text-[var(--mh-text)] marker:text-cyan-200"
                  : "ml-5 list-disc space-y-2.5 text-base leading-[1.68] text-[var(--mh-text)] marker:text-cyan-200"
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
            <div key={`formula-${blockIndex}`} className="border-l border-white/10 pl-4">
              <div className="space-y-2">
                {block.lines.map((line, lineIndex) => (
                  <div
                    key={`formula-${blockIndex}-${lineIndex}`}
                    className="whitespace-pre-wrap break-words text-base font-semibold leading-8 text-white"
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
            key={`callout-${blockIndex}`}
            className="border-l border-white/10 pl-4"
          >
            <SectionLabel className="text-[var(--mh-accent-cyan-soft)]">{block.label}</SectionLabel>
            <div className="mt-2 space-y-3">
              {block.lines.map((line, lineIndex) => (
                getStandaloneBoldText(line) ? (
                  <h4
                    key={`callout-${blockIndex}-${lineIndex}`}
                    className="break-words text-base font-semibold leading-snug tracking-normal text-white"
                  >
                    {renderInline(getStandaloneBoldText(line) ?? line, `callout-${blockIndex}-${lineIndex}`)}
                  </h4>
                ) : (
                  <p
                    key={`callout-${blockIndex}-${lineIndex}`}
                    className="break-words text-base leading-[1.68] text-[var(--mh-text)]"
                  >
                    {renderInline(line, `callout-${blockIndex}-${lineIndex}`)}
                  </p>
                )
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

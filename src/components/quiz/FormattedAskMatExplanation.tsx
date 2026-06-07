"use client";

import { Fragment } from "react";
import { renderFormattedInlineText } from "@/components/lesson/LessonSectionContent";
import { SectionLabel } from "@/components/ui/SectionLabel";

interface FormattedAskMatExplanationProps {
  text: string;
}

type ExplanationBlock =
  | { type: "heading"; text: string }
  | { type: "label"; text: string }
  | { type: "ordered-list"; items: string[] }
  | { type: "unordered-list"; items: string[] }
  | { type: "formula"; lines: string[] }
  | { type: "paragraph"; lines: string[] };

const ORDERED_LIST_PATTERN = /^(\d+)\.\s+/u;
const UNORDERED_LIST_PATTERN = /^([*\u2022-])\s+/u;
const KNOWN_HEADING_PATTERN =
  /^(КАК ДА РЕШИШ|СТЪПКА\s+\d+|КАПАН|ИЗВОД|ОТГОВОР|ЗАПОМНИ|ПРОВЕРКА|ПЛАН|ИДЕЯ|РЕШЕНИЕ)$/u;
const SHORT_LABEL_PATTERN = /^[\p{L}\p{N}\s()\-–—]+:\s*$/u;
const FRACTION_PATTERN = /\b\d+\s*\/\s*\d+\b/u;
const FORMULA_SYMBOL_PATTERN = /[=+\-−*\/()|<>≤≥²³·^]/u;
const FORMULA_BINARY_PATTERN = /[\p{L}\p{N}²³]\s*[:=+\-−*\/<>≤≥]\s*[\p{L}\p{N}²³]/u;

function sanitizeAskMatLine(line: string) {
  return line.replace(/[`"„“]/gu, "").trim();
}

function renderInline(line: string, keyPrefix: string) {
  return renderFormattedInlineText(sanitizeAskMatLine(line), keyPrefix).map((node, index) => (
    <Fragment key={`${keyPrefix}-${index}`}>{node}</Fragment>
  ));
}

function stripListMarker(line: string) {
  return sanitizeAskMatLine(line.replace(ORDERED_LIST_PATTERN, "").replace(UNORDERED_LIST_PATTERN, "").trim());
}

function isUppercaseHeading(line: string) {
  const trimmed = sanitizeAskMatLine(line);
  if (!trimmed || trimmed.length > 48) {
    return false;
  }

  return KNOWN_HEADING_PATTERN.test(trimmed) || /^[\p{Lu}0-9\s]+$/u.test(trimmed);
}

function isShortLabel(line: string) {
  const trimmed = sanitizeAskMatLine(line);
  if (!trimmed || trimmed.length > 40 || !trimmed.endsWith(":")) {
    return false;
  }

  return SHORT_LABEL_PATTERN.test(trimmed);
}

function isFormulaLikeLine(line: string) {
  const trimmed = sanitizeAskMatLine(line);

  if (!trimmed || trimmed.length > 100) {
    return false;
  }

  if (FRACTION_PATTERN.test(trimmed)) {
    return true;
  }

  if (FORMULA_SYMBOL_PATTERN.test(trimmed)) {
    return true;
  }

  return FORMULA_BINARY_PATTERN.test(trimmed);
}

function buildExplanationBlocks(text: string): ExplanationBlock[] {
  const paragraphs = text
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.split("\n").map((line) => sanitizeAskMatLine(line)).filter(Boolean))
    .filter((lines) => lines.length > 0);

  return paragraphs.map((lines) => {
    if (lines.length === 1 && isUppercaseHeading(lines[0])) {
      return { type: "heading", text: lines[0] } as ExplanationBlock;
    }

    if (lines.length === 1 && isShortLabel(lines[0])) {
      return { type: "label", text: lines[0] } as ExplanationBlock;
    }

    if (lines.every((line) => ORDERED_LIST_PATTERN.test(line))) {
      return { type: "ordered-list", items: lines.map(stripListMarker) } as ExplanationBlock;
    }

    if (lines.every((line) => UNORDERED_LIST_PATTERN.test(line))) {
      return { type: "unordered-list", items: lines.map(stripListMarker) } as ExplanationBlock;
    }

    if (lines.length > 0 && lines.every((line) => isFormulaLikeLine(line))) {
      return { type: "formula", lines } as ExplanationBlock;
    }

    return { type: "paragraph", lines } as ExplanationBlock;
  });
}

export function FormattedAskMatExplanation({ text }: FormattedAskMatExplanationProps) {
  const blocks = buildExplanationBlocks(text);

  return (
    <div className="space-y-4">
      {blocks.map((block, blockIndex) => {
        if (block.type === "heading") {
          return (
            <div
              key={`askmat-heading-${blockIndex}`}
              className="rounded-[18px] border border-cyan-400/16 bg-cyan-400/[0.04] px-4 py-3"
            >
              <SectionLabel className="text-[var(--mh-accent-cyan-soft)]">{block.text}</SectionLabel>
            </div>
          );
        }

        if (block.type === "label") {
          return (
            <div key={`askmat-label-${blockIndex}`} className="pt-1">
              <SectionLabel className="text-amber-200/90">{block.text}</SectionLabel>
            </div>
          );
        }

        if (block.type === "ordered-list") {
          return (
            <ol
              key={`askmat-ordered-${blockIndex}`}
              className="ml-5 list-decimal space-y-3 text-[1rem] leading-7 text-[var(--mh-text)] marker:text-cyan-200"
            >
              {block.items.map((item, itemIndex) => (
                <li key={`askmat-ordered-${blockIndex}-${itemIndex}`} className="break-words pl-1">
                  {renderInline(item, `askmat-ordered-${blockIndex}-${itemIndex}`)}
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === "unordered-list") {
          return (
            <ul
              key={`askmat-unordered-${blockIndex}`}
              className="ml-5 list-disc space-y-3 text-[1rem] leading-7 text-[var(--mh-text)] marker:text-cyan-200"
            >
              {block.items.map((item, itemIndex) => (
                <li key={`askmat-unordered-${blockIndex}-${itemIndex}`} className="break-words pl-1">
                  {renderInline(item, `askmat-unordered-${blockIndex}-${itemIndex}`)}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "formula") {
          return (
            <div
              key={`askmat-formula-${blockIndex}`}
              className="rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-4"
            >
              <div className="space-y-2.5">
                {block.lines.map((line, lineIndex) => (
                  <div
                    key={`askmat-formula-${blockIndex}-${lineIndex}`}
                    className="whitespace-pre-wrap break-words text-[1rem] font-semibold leading-7 text-white"
                  >
                    {renderInline(line, `askmat-formula-${blockIndex}-${lineIndex}`)}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return (
          <div key={`askmat-paragraph-${blockIndex}`} className="space-y-3.5">
            {block.lines.map((line, lineIndex) => (
              <p
                key={`askmat-paragraph-${blockIndex}-${lineIndex}`}
                className="break-words text-[1rem] leading-7 text-[var(--mh-text)]"
              >
                {renderInline(line, `askmat-paragraph-${blockIndex}-${lineIndex}`)}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}

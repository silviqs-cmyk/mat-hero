import { Fragment, type ReactNode } from "react";
import { renderLessonMathInline } from "@/components/lesson/renderLessonMathInline";

interface LessonSectionContentProps {
  text: string;
}

const COLOR_PATTERN = /\[color=(cyan|gold|green|red)\]([\s\S]*?)\[\/color\]/giu;
const BOLD_PATTERN = /\*\*([\s\S]+?)\*\*/gu;

function getColorClassName(color: string) {
  switch (color.toLocaleLowerCase("en-US")) {
    case "gold":
      return "text-amber-200";
    case "green":
      return "text-emerald-200";
    case "red":
      return "text-rose-200";
    case "cyan":
    default:
      return "text-cyan-200";
  }
}

function renderBoldAndMathInline(line: string, keyPrefix: string) {
  const content: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(BOLD_PATTERN)) {
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      content.push(
        <Fragment key={`${keyPrefix}-text-${matchIndex}`}>
          {renderLessonMathInline(line.slice(lastIndex, matchIndex)).map((node, nodeIndex) => (
            <Fragment key={`${keyPrefix}-text-${matchIndex}-${nodeIndex}`}>{node}</Fragment>
          ))}
        </Fragment>,
      );
    }

    content.push(
      <strong key={`${keyPrefix}-bold-${matchIndex}`} className="font-semibold text-white">
        {renderLessonMathInline(match[1] ?? "").map((node, nodeIndex) => (
          <Fragment key={`${keyPrefix}-bold-${matchIndex}-${nodeIndex}`}>{node}</Fragment>
        ))}
      </strong>,
    );

    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < line.length) {
    content.push(
      <Fragment key={`${keyPrefix}-tail-${lastIndex}`}>
        {renderLessonMathInline(line.slice(lastIndex)).map((node, nodeIndex) => (
          <Fragment key={`${keyPrefix}-tail-${lastIndex}-${nodeIndex}`}>{node}</Fragment>
        ))}
      </Fragment>,
    );
  }

  return content;
}

function renderFormattedLine(line: string, keyPrefix: string) {
  const content: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(COLOR_PATTERN)) {
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      content.push(...renderBoldAndMathInline(line.slice(lastIndex, matchIndex), `${keyPrefix}-plain-${matchIndex}`));
    }

    content.push(
      <span key={`${keyPrefix}-color-${matchIndex}`} className={getColorClassName(match[1] ?? "cyan")}>
        {renderBoldAndMathInline(match[2] ?? "", `${keyPrefix}-color-inner-${matchIndex}`)}
      </span>,
    );

    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < line.length) {
    content.push(...renderBoldAndMathInline(line.slice(lastIndex), `${keyPrefix}-tail-${lastIndex}`));
  }

  return content;
}

export function renderFormattedInlineText(line: string, keyPrefix: string) {
  return renderFormattedLine(line, keyPrefix);
}

export function LessonSectionContent({ text }: LessonSectionContentProps) {
  const paragraphs = text
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.split("\n").map((line) => line.trimEnd()).filter(Boolean))
    .filter((lines) => lines.length > 0);

  return (
    <div className="space-y-3">
      {paragraphs.map((lines, paragraphIndex) => (
        <div key={`paragraph-${paragraphIndex}`} className="space-y-2">
          {lines.map((line, lineIndex) => (
            <p
              key={`line-${paragraphIndex}-${lineIndex}`}
              className="overflow-hidden break-words py-1 whitespace-normal"
            >
              {renderFormattedLine(line, `node-${paragraphIndex}-${lineIndex}`).map((node, nodeIndex) => (
                <Fragment key={`node-${paragraphIndex}-${lineIndex}-${nodeIndex}`}>{node}</Fragment>
              ))}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

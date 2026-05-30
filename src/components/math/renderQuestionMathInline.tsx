import { Fragment, type ReactNode } from "react";
import { Fraction } from "@/components/lesson/Fraction";
import { renderInlineSuperscripts } from "@/components/lesson/renderInlineSuperscripts";

const FRACTION_PATTERN =
  /(\([^()\n]+\)|[A-Za-z0-9]+)\s*\/\s*(\([^()\n]+\)|[A-Za-z0-9]+)/gu;

interface RenderQuestionMathInlineOptions {
  inlineFractions?: boolean;
}

function appendFormattedText(content: ReactNode[], value: string, keyPrefix: string) {
  renderInlineSuperscripts(value).forEach((node, index) => {
    content.push(<Fragment key={`${keyPrefix}-${index}`}>{node}</Fragment>);
  });
}

export function renderQuestionMathInline(
  line: string,
  keyPrefix: string,
  options?: RenderQuestionMathInlineOptions,
): ReactNode[] {
  const content: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(FRACTION_PATTERN)) {
    const matchIndex = match.index ?? 0;
    const numerator = match[1] ?? "";
    const denominator = match[2] ?? "";

    if (!numerator || !denominator) {
      continue;
    }

    if (matchIndex > lastIndex) {
      appendFormattedText(content, line.slice(lastIndex, matchIndex), `${keyPrefix}-text-${matchIndex}`);
    }

    if (options?.inlineFractions) {
      content.push(
        <span key={`${keyPrefix}-fraction-${matchIndex}`} className="whitespace-nowrap">
          {renderInlineSuperscripts(numerator).map((node, index) => (
            <Fragment key={`${keyPrefix}-fraction-numerator-${matchIndex}-${index}`}>{node}</Fragment>
          ))}
          /
          {renderInlineSuperscripts(denominator).map((node, index) => (
            <Fragment key={`${keyPrefix}-fraction-denominator-${matchIndex}-${index}`}>{node}</Fragment>
          ))}
        </span>,
      );
    } else {
      content.push(
        <Fraction
          key={`${keyPrefix}-fraction-${matchIndex}`}
          numerator={numerator}
          denominator={denominator}
        />,
      );
    }

    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < line.length) {
    appendFormattedText(content, line.slice(lastIndex), `${keyPrefix}-tail-${lastIndex}`);
  }

  return content;
}

import { Fragment, type ReactNode } from "react";
import { Fraction } from "@/components/lesson/Fraction";
import { renderInlineSuperscripts } from "@/components/lesson/renderInlineSuperscripts";

const FRACTION_PATTERN = /(?<![\p{L}\p{N}_])([A-Za-z0-9]+)\/([A-Za-z0-9]+)(?![\p{L}\p{N}_])/gu;

export function renderLessonMathInline(line: string): ReactNode[] {
  const content: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(FRACTION_PATTERN)) {
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      content.push(
        <Fragment key={`text-${matchIndex}`}>
          {renderInlineSuperscripts(line.slice(lastIndex, matchIndex)).map((node, nodeIndex) => (
            <Fragment key={`text-${matchIndex}-${nodeIndex}`}>{node}</Fragment>
          ))}
        </Fragment>,
      );
    }

    content.push(
      <Fraction
        key={`${matchIndex}-${match[0]}`}
        numerator={match[1]}
        denominator={match[2]}
      />,
    );

    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < line.length) {
    content.push(
      <Fragment key={`tail-${lastIndex}`}>
        {renderInlineSuperscripts(line.slice(lastIndex)).map((node, nodeIndex) => (
          <Fragment key={`tail-${lastIndex}-${nodeIndex}`}>{node}</Fragment>
        ))}
      </Fragment>,
    );
  }

  return content;
}

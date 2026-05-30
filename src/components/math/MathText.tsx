import { Fragment, type ElementType } from "react";
import { renderQuestionMathInline } from "@/components/math/renderQuestionMathInline";

interface MathTextProps {
  text: string;
  as?: ElementType;
  className?: string;
  inline?: boolean;
  inlineFractions?: boolean;
}

function renderInlineLine(line: string, keyPrefix: string, inlineFractions = false) {
  return renderQuestionMathInline(line, keyPrefix, { inlineFractions }).map((node, index) => (
    <Fragment key={`${keyPrefix}-${index}`}>{node}</Fragment>
  ));
}

function buildParagraphs(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.split("\n").map((line) => line.trimEnd()))
    .filter((lines) => lines.some((line) => line.trim().length > 0));
}

export function MathText({
  text,
  as: Component = "div",
  className,
  inline = false,
  inlineFractions = false,
}: MathTextProps) {
  if (inline) {
    const lines = text.replace(/\r\n/g, "\n").split("\n");

    return (
      <Component className={className}>
        {lines.map((line, lineIndex) => (
          <Fragment key={`inline-${lineIndex}`}>
            {lineIndex > 0 ? <br /> : null}
            {renderInlineLine(line, `inline-${lineIndex}`, inlineFractions)}
          </Fragment>
        ))}
      </Component>
    );
  }

  const paragraphs = buildParagraphs(text);

  return (
    <Component className={className}>
      {paragraphs.map((lines, paragraphIndex) => (
        <div key={`paragraph-${paragraphIndex}`} className={paragraphIndex > 0 ? "mt-3" : undefined}>
          {lines.map((line, lineIndex) =>
            line.trim().length > 0 ? (
              <p
                key={`paragraph-${paragraphIndex}-${lineIndex}`}
                className={
                  lineIndex > 0
                    ? "mt-1 whitespace-normal break-normal [overflow-wrap:normal] [word-break:normal]"
                    : "whitespace-normal break-normal [overflow-wrap:normal] [word-break:normal]"
                }
              >
                {renderInlineLine(line, `paragraph-${paragraphIndex}-${lineIndex}`, inlineFractions)}
              </p>
            ) : null,
          )}
        </div>
      ))}
    </Component>
  );
}

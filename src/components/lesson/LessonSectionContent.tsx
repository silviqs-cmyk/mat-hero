import { Fragment } from "react";
import { renderLessonMathInline } from "@/components/lesson/renderLessonMathInline";

interface LessonSectionContentProps {
  text: string;
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
              {renderLessonMathInline(line).map((node, nodeIndex) => (
                <Fragment key={`node-${paragraphIndex}-${lineIndex}-${nodeIndex}`}>{node}</Fragment>
              ))}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

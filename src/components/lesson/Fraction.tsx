import { Fragment } from "react";
import { renderInlineSuperscripts } from "@/components/lesson/renderInlineSuperscripts";

interface FractionProps {
  numerator: string;
  denominator: string;
}

export function Fraction({ numerator, denominator }: FractionProps) {
  return (
    <span className="mx-1 inline-flex shrink-0 align-middle text-current">
      <span className="inline-flex min-w-[1.9em] flex-col items-center justify-center whitespace-nowrap leading-none">
        <span className="px-1 text-[0.8em]">
          {renderInlineSuperscripts(numerator).map((node, nodeIndex) => (
            <Fragment key={`numerator-${nodeIndex}`}>{node}</Fragment>
          ))}
        </span>
        <span className="my-0.5 w-full border-t border-current" />
        <span className="px-1 text-[0.8em]">
          {renderInlineSuperscripts(denominator).map((node, nodeIndex) => (
            <Fragment key={`denominator-${nodeIndex}`}>{node}</Fragment>
          ))}
        </span>
      </span>
    </span>
  );
}

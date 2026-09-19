export interface TheoryConceptVisualProps {
  mainSymbol: string;
  tags: readonly string[];
}

export function TheoryConceptVisual({ mainSymbol, tags }: TheoryConceptVisualProps) {
  return (
    <div className="flex w-full min-w-0 flex-col items-start gap-4 py-6 sm:py-8" data-theory-concept-visual>
      <p className="max-w-full text-left text-lg font-medium leading-tight tracking-wide text-cyan-200 [overflow-wrap:anywhere] [text-shadow:0_0_18px_rgba(34,211,238,0.15)] sm:text-[1.375rem]">
        {mainSymbol}
      </p>
      <div className="flex max-w-full flex-wrap justify-start gap-2">
        {tags.map((tag, index) => (
          <span
            key={tag}
            className={`inline-flex min-w-0 max-w-full items-center rounded-full border px-3 py-1 text-xs font-medium leading-5 [overflow-wrap:anywhere] ${index % 2 === 0
              ? "border-cyan-400/20 bg-cyan-400/5 text-cyan-200"
              : "border-purple-400/20 bg-purple-400/5 text-purple-200"}`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

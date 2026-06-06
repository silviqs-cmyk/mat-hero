import { MathText } from "@/components/math/MathText";

interface PreviewOption {
  id: string;
  option_text: string;
  is_correct: boolean;
}

interface QuestionFeedbackPreviewProps {
  prompt: string;
  imageUrl?: string | null;
  questionType: "multiple_choice" | "open_answer" | "true_false";
  options: PreviewOption[];
  selectedOptionId: string | null;
  submittedAnswerText: string;
  correctAnswer: string | null;
  revealCorrectAnswer: boolean;
}

export function QuestionFeedbackPreview({
  prompt,
  imageUrl = null,
  questionType,
  options,
  selectedOptionId,
  submittedAnswerText,
  correctAnswer,
  revealCorrectAnswer,
}: QuestionFeedbackPreviewProps) {
  const isOpenAnswer = questionType === "open_answer";

  return (
    <div className="space-y-4">
      <div className="rounded-[20px] border border-white/8 bg-black/10 p-4">
        <p className="mh-label">Условие</p>
        <div className="mt-3 text-sm leading-6 text-white">
          <MathText text={prompt} className="text-sm leading-6 text-white" />
        </div>

        {imageUrl ? (
          <div className="mt-4 overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.03]">
            <img
              src={imageUrl}
              alt="Илюстрация към задачата"
              className="block h-auto w-full object-contain"
              loading="lazy"
            />
          </div>
        ) : null}
      </div>

      {isOpenAnswer ? (
        <div className="grid gap-3">
          <div className="rounded-[20px] border border-rose-400/35 bg-rose-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-rose-200">Твоят отговор</p>
            <div className="mt-2 text-sm leading-6 text-rose-50">
              <MathText text={submittedAnswerText || "Няма въведен отговор"} className="text-sm leading-6 text-rose-50" />
            </div>
          </div>

          {revealCorrectAnswer && correctAnswer ? (
            <div className="rounded-[20px] border border-emerald-400/35 bg-emerald-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-200">Верен отговор</p>
              <div className="mt-2 text-sm leading-6 text-emerald-50">
                <MathText text={correctAnswer} className="text-sm leading-6 text-emerald-50" />
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="mh-label">Отговори</p>
          {options.map((option, index) => {
            const isSelected = selectedOptionId === option.id;
            const isRevealedCorrect = revealCorrectAnswer && option.is_correct;
            const optionClass = isRevealedCorrect
              ? "border-emerald-400/45 bg-emerald-500/10 text-emerald-50 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]"
              : isSelected
                ? "border-rose-400/45 bg-rose-500/10 text-rose-50 shadow-[0_0_0_1px_rgba(251,113,133,0.2)]"
                : "border-white/8 bg-[rgba(16,20,34,0.92)] text-slate-200";

            return (
              <div
                key={option.id}
                className={`rounded-[20px] border px-4 py-3 text-sm leading-6 ${optionClass}`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-white/10 text-xs font-bold text-cyan-100">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <MathText text={option.option_text} className="text-sm leading-6" />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {isSelected ? (
                        <span className="rounded-full border border-rose-300/25 bg-rose-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-rose-100">
                          Твоят избор
                        </span>
                      ) : null}
                      {isRevealedCorrect ? (
                        <span className="rounded-full border border-emerald-300/25 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-100">
                          Верен отговор
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

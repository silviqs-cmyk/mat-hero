interface AnswerOptionProps {
  optionText: string;
  optionId: string;
  isSelected: boolean;
  isCorrect: boolean;
  showFeedback: boolean;
  onClick: () => void;
}

export function AnswerOption({
  optionText,
  optionId,
  isSelected,
  isCorrect,
  showFeedback,
  onClick,
}: AnswerOptionProps) {
  const feedbackClass = showFeedback
    ? isCorrect
      ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_20px_rgba(16,185,129,0.14)]"
      : isSelected
        ? "border-rose-400/50 bg-rose-500/10 text-rose-200 shadow-[0_0_0_1px_rgba(251,113,133,0.3),0_0_20px_rgba(251,113,133,0.1)]"
        : "border-white/8 bg-[rgba(24,28,40,0.92)] text-slate-300"
    : isSelected
      ? "border-cyan-300/45 bg-cyan-400/12 text-white shadow-[0_0_0_1px_rgba(57,215,255,0.2),0_0_24px_rgba(57,215,255,0.14)]"
      : "border-white/8 bg-[rgba(24,28,40,0.92)] text-slate-200 hover:border-cyan-400/30 hover:shadow-[0_0_0_1px_rgba(57,215,255,0.15),0_0_16px_rgba(57,215,255,0.08)]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-4 rounded-[22px] border px-5 py-4 text-left text-sm font-semibold leading-6 transition duration-200 lg:px-6 lg:py-5 lg:text-base ${feedbackClass}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-white/10 text-xs font-bold text-cyan-200">
        {optionId}
      </span>
      <span className="flex-1">{optionText}</span>
    </button>
  );
}

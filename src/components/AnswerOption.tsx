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
      ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.14)]"
      : isSelected
        ? "border-rose-400/50 bg-rose-500/10 text-rose-200"
        : "border-white/8 bg-[rgba(24,28,40,0.92)] text-slate-300"
    : isSelected
      ? "border-cyan-300/45 bg-cyan-400/12 text-white shadow-[0_0_24px_rgba(57,215,255,0.14)]"
      : "border-white/8 bg-[rgba(24,28,40,0.92)] text-slate-200 hover:border-cyan-400/30";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left text-sm font-semibold transition ${feedbackClass}`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-xs text-cyan-200">
        {optionId}
      </span>
      <span>{optionText}</span>
    </button>
  );
}

"use client";

import { useEffect, useRef } from "react";

interface AnswerFeedbackModalProps {
  isOpen: boolean;
  isCorrect: boolean;
  explanation: string;
  correctAnswer: string | null;
  isLastQuestion: boolean;
  onContinue: () => void;
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export function AnswerFeedbackModal({
  isOpen,
  isCorrect,
  explanation,
  correctAnswer,
  isLastQuestion,
  onContinue,
}: AnswerFeedbackModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const primaryButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    primaryButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onContinue();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusable = getFocusableElements(dialogRef.current);
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onContinue]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/82 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-live="polite"
        aria-label={isCorrect ? "Верен отговор" : "Грешен отговор"}
        className={`mh-card w-full max-h-[80vh] overflow-y-auto rounded-t-[28px] border px-5 py-6 sm:max-w-xl sm:rounded-[28px] sm:px-6 ${
          isCorrect
            ? "border-cyan-400/30 shadow-[0_0_36px_rgba(34,211,238,0.18)]"
            : "border-rose-400/30 shadow-[0_0_36px_rgba(244,63,94,0.14)]"
        }`}
      >
        <div className="space-y-5">
          <div className="mx-auto h-1.5 w-14 rounded-full bg-white/15 sm:hidden" aria-hidden="true" />

          <div className="space-y-3">
            <p className="mh-label">Обратна връзка</p>
            <h2 className={`font-display text-3xl leading-tight ${isCorrect ? "text-cyan-100" : "text-rose-300"}`}>
              {isCorrect ? "Вярно!" : "Не съвсем"}
            </h2>
            <p className="mh-copy-muted">
              {isCorrect ? "Браво, това е правилният отговор." : "Виж обяснението и продължи."}
            </p>
            {!isCorrect && correctAnswer ? (
              <p className="text-sm font-semibold text-white">Верен отговор: {correctAnswer}</p>
            ) : null}
            {!isCorrect && explanation ? <p className="mh-copy-muted">{explanation}</p> : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              ref={primaryButtonRef}
              type="button"
              onClick={onContinue}
              className="mh-btn mh-btn-primary w-full sm:w-auto"
            >
              {isLastQuestion ? "Виж резултата" : "Следващ въпрос"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

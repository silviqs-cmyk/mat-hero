"use client";

import { AnimatePresence, motion, useReducedMotion, type Transition } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MathText } from "@/components/math/MathText";
import { FormattedAskMatExplanation } from "@/components/quiz/FormattedAskMatExplanation";
import { FeedbackMascot } from "@/components/quiz/FeedbackMascot";
import { NeonButton } from "@/components/ui/NeonButton";

interface AnswerFeedbackModalProps {
  isOpen: boolean;
  state: "correct" | "incorrect" | "completed";
  isCorrect: boolean;
  explanation: string;
  correctAnswer: string | null;
  showStandaloneCorrectAnswer?: boolean;
  pointsEarned?: number;
  primaryLabel: string;
  showAskMat?: boolean;
  titleOverride?: string;
  messageOverride?: string;
  completionHint?: string | null;
  mascotGifSrcOverride?: string | null;
  wrongAnswerPreview?: ReactNode;
  onContinue: () => void;
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

function getModalCopy(state: AnswerFeedbackModalProps["state"]) {
  if (state === "completed") {
    return {
      title: "Тестът е завършен!",
      message: "Продължи към резултата си.",
    };
  }

  if (state === "correct") {
    return {
      title: "Вярно!",
      message: "Браво, това е правилният отговор.",
    };
  }

  return {
    title: "Не съвсем",
    message: "Виж правилния отговор и обяснението.",
  };
}

export function AnswerFeedbackModal({
  isOpen,
  state,
  isCorrect,
  explanation,
  correctAnswer,
  showStandaloneCorrectAnswer = true,
  pointsEarned = 0,
  primaryLabel,
  showAskMat = false,
  titleOverride,
  messageOverride,
  completionHint = null,
  mascotGifSrcOverride = null,
  wrongAnswerPreview = null,
  onContinue,
}: AnswerFeedbackModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const primaryButtonRef = useRef<HTMLButtonElement | null>(null);
  const continueClickedRef = useRef(false);
  const [showAskMatDetails, setShowAskMatDetails] = useState(false);
  const [showWrongAnswerDetails, setShowWrongAnswerDetails] = useState(false);
  const copy = getModalCopy(state);
  const portalRoot = typeof window === "undefined" ? null : window.document.body;
  const hasAskMatDetails = Boolean(correctAnswer || explanation);
  const shouldRenderAskMat = state !== "completed" && showAskMat && hasAskMatDetails;
  const shouldShowDetails =
    state !== "completed" && (shouldRenderAskMat ? showAskMatDetails : !isCorrect || state === "incorrect");
  const askMatGifSrc = shouldRenderAskMat && showAskMatDetails ? "/images/feedback/ask-mat.gif" : null;
  const shouldShowTitle = !(shouldRenderAskMat && showAskMatDetails);
  const shouldShowWrongAnswerPreview = Boolean(wrongAnswerPreview);
  const resolvedTitle = titleOverride ?? copy.title;
  const resolvedMessage = messageOverride ?? copy.message;
  const resolvedMascotGifSrc = mascotGifSrcOverride ?? askMatGifSrc;

  useEffect(() => {
    if (isOpen) {
      continueClickedRef.current = false;
      setShowAskMatDetails(false);
      setShowWrongAnswerDetails(false);
    }
  }, [isOpen, correctAnswer, explanation, primaryLabel]);

  function handlePrimaryClick() {
    if (continueClickedRef.current) {
      return;
    }

    continueClickedRef.current = true;
    onContinue();
  }

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
        return;
      }

      if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
        const activeElement = document.activeElement as HTMLElement | null;
        const tagName = activeElement?.tagName;
        const isTextEntry =
          tagName === "INPUT" ||
          tagName === "TEXTAREA" ||
          tagName === "SELECT" ||
          activeElement?.isContentEditable;
        const isInteractiveControl = tagName === "BUTTON" || tagName === "A";

        if (!isTextEntry && !isInteractiveControl) {
          event.preventDefault();
          handlePrimaryClick();
          return;
        }
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

  const dialogInitial = prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.985 };
  const dialogAnimate =
    prefersReducedMotion
      ? { opacity: 1 }
      : state === "incorrect"
        ? { opacity: 1, y: [0, -3, 3, -2, 0], scale: 1 }
        : { opacity: 1, y: 0, scale: 1 };
  const dialogTransition: Transition =
    prefersReducedMotion ? { duration: 0 } : { duration: state === "incorrect" ? 0.3 : 0.28, ease: "easeOut" };

  const modalMarkup = (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/82 p-0 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-live="polite"
        aria-label={copy.title}
        initial={dialogInitial}
        animate={dialogAnimate}
        transition={dialogTransition}
        className={`mh-card flex max-h-[calc(100vh-1rem)] w-full flex-col overflow-hidden rounded-t-[28px] border bg-black px-5 py-6 sm:max-h-[min(48rem,calc(100vh-2rem))] sm:max-w-2xl sm:rounded-[28px] sm:px-6 ${
          state === "completed"
            ? "border-lime-400/30 shadow-[0_0_40px_rgba(132,204,22,0.18)]"
            : state === "correct"
              ? "border-cyan-400/30 shadow-[0_0_36px_rgba(34,211,238,0.18)]"
              : "border-rose-400/30 shadow-[0_0_36px_rgba(244,63,94,0.14)]"
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-5">
          <div className="mx-auto h-1.5 w-14 rounded-full bg-white/15 sm:hidden" aria-hidden="true" />

          <div className="flex justify-center">
            <FeedbackMascot state={state} size="md" gifSrcOverride={resolvedMascotGifSrc} />
          </div>

          <div className="space-y-3 text-center">
            {shouldShowTitle ? (
              <h2
                className={`font-display text-3xl leading-tight ${
                  state === "completed"
                    ? "text-lime-100"
                    : state === "correct"
                      ? "text-cyan-100"
                      : "text-rose-300"
                }`}
              >
                {resolvedTitle}
              </h2>
            ) : null}
            <p className="mh-copy-muted">{resolvedMessage}</p>
            {state === "completed" && completionHint ? (
              <p className="text-sm font-semibold text-cyan-200">{completionHint}</p>
            ) : null}
            {isCorrect && state !== "completed" && pointsEarned > 0 ? (
              <p className="text-sm font-semibold text-cyan-200">+{pointsEarned} точки</p>
            ) : null}
          </div>

          {shouldShowWrongAnswerPreview ? (
            <NeonButton
              type="button"
              variant="ghost"
              className="w-full justify-center"
              onClick={() => setShowWrongAnswerDetails((current) => !current)}
            >
              {showWrongAnswerDetails ? "Скрий задачата" : "👀 Виж къде сбърка"}
            </NeonButton>
          ) : null}

          <AnimatePresence initial={false} mode="wait">
            {shouldShowDetails ? (
              <motion.div
                key={showAskMatDetails ? "ask-mat-details" : "feedback-details"}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
                className="min-h-0 max-h-[34vh] space-y-3 overflow-y-auto rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-left sm:max-h-[42vh]"
              >
                {showStandaloneCorrectAnswer && correctAnswer ? (
                  <p className="text-base font-semibold text-white">
                    Верен отговор: <MathText text={correctAnswer} as="span" inline />
                  </p>
                ) : null}
                {explanation ? <FormattedAskMatExplanation text={explanation} /> : null}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {showWrongAnswerDetails && shouldShowWrongAnswerPreview ? (
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
                className="min-h-0 max-h-[34vh] overflow-y-auto rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-left sm:max-h-[42vh]"
              >
                {wrongAnswerPreview}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="sticky bottom-0 mt-auto flex flex-col gap-3 border-t border-white/8 bg-black pt-4 sm:flex-row sm:justify-end">
            {shouldRenderAskMat ? (
              <NeonButton
                type="button"
                variant="ghost"
                className="min-h-11 w-full justify-center border-[#4aa3ff]/70 bg-[linear-gradient(180deg,#03041f_0%,#070a2b_100%)] px-4 text-sm font-extrabold tracking-[0.01em] text-cyan-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_22px_rgba(59,130,246,0.42),0_0_46px_rgba(37,99,235,0.32)] hover:border-[#7fc3ff] hover:bg-[linear-gradient(180deg,#070a2f_0%,#0c1140_100%)] hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_30px_rgba(96,165,250,0.5),0_0_56px_rgba(37,99,235,0.38)] sm:w-auto"
                onClick={() => setShowAskMatDetails((current) => !current)}
              >
                <Image
                  src="/images/ask-mat-button-icon-v4.png"
                  alt=""
                  width={32}
                  height={32}
                  className="h-7 w-7 object-contain"
                  aria-hidden="true"
                />
                Питай МАТ
              </NeonButton>
            ) : null}
            <button
              ref={primaryButtonRef}
              type="button"
              onClick={handlePrimaryClick}
              disabled={continueClickedRef.current}
              className="mh-btn mh-btn-primary w-full sm:w-auto"
            >
              {primaryLabel}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  if (!portalRoot) {
    return modalMarkup;
  }

  return createPortal(modalMarkup, portalRoot);
}

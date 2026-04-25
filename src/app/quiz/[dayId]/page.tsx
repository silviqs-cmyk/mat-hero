"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MascotCharacter } from "@/components/MascotCharacter";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { useAppState } from "@/components/providers/AppStateProvider";
import { getPracticeQuestionsForDay } from "@/lib/practiceQuestions";
import { getQuestionsByDay } from "@/lib/supabaseClient";
import { demoQuestions } from "@/lib/demoData";
import type { Question, QuizMode, TopicName } from "@/types";

interface QuizPageProps {
  params: Promise<{ dayId: string }>;
}

export default function QuizPage({ params }: QuizPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeQuiz } = useAppState();
  const [dayId, setDayId] = useState(1);
  const [mode, setMode] = useState<QuizMode>("main");
  const [questions, setQuestions] = useState<Question[]>(
    getPracticeQuestionsForDay(1, "main"),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<
    Array<{ questionId: number; selectedAnswer: string; isCorrect: boolean }>
  >([]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      const resolved = await params;
      const nextDayId = Number(resolved.dayId);
      const nextMode = searchParams.get("mode") === "extra" ? "extra" : "main";
      const practiceQuestions = getPracticeQuestionsForDay(nextDayId, nextMode);

      if (!ignore && practiceQuestions.length > 0) {
        setDayId(nextDayId);
        setMode(nextMode);
        setQuestions(practiceQuestions);
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setAnswers([]);
        return;
      }

      const { data } = await getQuestionsByDay(nextDayId);
      const fallbackQuestions =
        data.length > 0 ? data : demoQuestions.filter((question) => question.day_id === nextDayId);

      if (!ignore) {
        setDayId(nextDayId);
        setMode("main");
        setQuestions(fallbackQuestions);
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setAnswers([]);
      }
    }

    void load();
    return () => {
      ignore = true;
    };
  }, [params, searchParams]);

  const currentQuestion = questions[currentIndex];
  const isBonusMode = mode === "extra";
  const answeredQuestionsCount = answers.length;
  const isCorrectAnswer = selectedAnswer === currentQuestion.correct_answer;

  if (!currentQuestion) {
    return (
      <div className="panel rounded-[28px] p-5">
        <p className="text-sm text-[var(--muted)]">Няма налични въпроси за този ден.</p>
      </div>
    );
  }

  const handleSelect = (answer: string) => {
    if (showFeedback) {
      return;
    }

    setSelectedAnswer(answer);
    setShowFeedback(true);

    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedAnswer: answer,
        isCorrect: answer === currentQuestion.correct_answer,
      },
    ]);
  };

  const handleContinue = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      return;
    }

    await completeQuiz({
      dayId,
      mode,
      topic: currentQuestion.topic as TopicName,
      totalQuestions: questions.length,
      answers,
    });

    router.push("/results");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <MascotCharacter
        mood={showFeedback && isCorrectAnswer ? "happy" : "idle"}
        message={
          isBonusMode
            ? "Това е бонус тренировка. Натисни още малко и затвърди темата."
            : "Избери отговор и ще получиш обратна връзка веднага."
        }
      />
      <ProgressBar
        label={isBonusMode ? "Бонус тренировка" : "Напредък в теста"}
        value={answeredQuestionsCount}
        max={questions.length}
        helperText={
          isBonusMode
            ? "Допълнителни задачи за по-силен резултат."
            : "Един въпрос наведнъж, без излишно напрежение."
        }
        accent={isBonusMode ? "pink" : "cyan"}
      />

      <AnimatePresence mode="wait">
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          currentIndex={currentIndex}
          total={questions.length}
          selectedAnswer={selectedAnswer}
          showFeedback={showFeedback}
          onAnswerSelect={handleSelect}
        />
      </AnimatePresence>

      {showFeedback ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-[28px] p-5"
        >
          <p
            className={`text-sm font-semibold ${
              isCorrectAnswer ? "text-lime-200" : "text-rose-300"
            }`}
          >
            {isCorrectAnswer
              ? "Точно така."
              : `Верният отговор е ${currentQuestion.correct_answer}.`}
          </p>
          {isCorrectAnswer ? (
            <div className="mt-4 flex justify-center rounded-[24px] border border-cyan-400/20 bg-[radial-gradient(circle,rgba(32,237,255,0.12),transparent_65%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4 shadow-[0_0_32px_rgba(37,221,255,0.14)]">
              <Image
                src="/images/success.gif"
                alt="MatHero celebrates a correct answer"
                width={240}
                height={240}
                unoptimized
                className="h-auto w-full max-w-[240px] rounded-[20px]"
              />
            </div>
          ) : null}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleContinue}
              className="btn-neon-primary rounded-2xl px-5 py-3 text-sm font-semibold"
            >
              {currentIndex < questions.length - 1 ? "Следващ" : "Резултат"}
            </button>
            <Link
              href={`/explanation/${currentQuestion.id}`}
              className="btn-neon-outline rounded-2xl px-5 py-3 text-sm font-semibold"
            >
              Обяснение
            </Link>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

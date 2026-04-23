"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MascotCharacter } from "@/components/MascotCharacter";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { useAppState } from "@/components/providers/AppStateProvider";
import { getQuestionsByDay } from "@/lib/supabaseClient";
import { demoQuestions } from "@/lib/demoData";
import type { Question, TopicName } from "@/types";

interface QuizPageProps {
  params: Promise<{ dayId: string }>;
}

export default function QuizPage({ params }: QuizPageProps) {
  const router = useRouter();
  const { completeQuiz } = useAppState();
  const [dayId, setDayId] = useState(1);
  const [questions, setQuestions] = useState<Question[]>(
    demoQuestions.filter((q) => q.day_id === 1),
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
      const { data } = await getQuestionsByDay(nextDayId);

      if (!ignore) {
        setDayId(nextDayId);
        setQuestions(data);
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
  }, [params]);

  const currentQuestion = questions[currentIndex];

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
      topic: currentQuestion.topic as TopicName,
      totalQuestions: questions.length,
      answers,
    });

    router.push("/results");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <MascotCharacter
        mood={showFeedback && selectedAnswer === currentQuestion.correct_answer ? "happy" : "idle"}
        message="Избери отговор и ще получиш обратна връзка веднага."
      />
      <ProgressBar
        label="Напредък в теста"
        value={currentIndex + 1}
        max={questions.length}
        helperText="Един въпрос наведнъж, без излишно напрежение."
        accent="cyan"
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
              selectedAnswer === currentQuestion.correct_answer
                ? "text-lime-200"
                : "text-rose-300"
            }`}
          >
            {selectedAnswer === currentQuestion.correct_answer
              ? "Точно така."
              : `Верният отговор е ${currentQuestion.correct_answer}.`}
          </p>
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

"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MascotCharacter } from "@/components/MascotCharacter";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { useAppState } from "@/components/providers/AppStateProvider";
import { Badge } from "@/components/ui/Badge";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { demoQuestions } from "@/lib/demoData";
import { getPracticeQuestionsForDay } from "@/lib/practiceQuestions";
import { getQuestionsByDay } from "@/lib/supabaseClient";
import type { Question, QuizMode, TopicName } from "@/types";

interface QuizPageProps {
  params: Promise<{ dayId: string }>;
}

export default function QuizPage({ params }: QuizPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeQuiz, recordQuestionProgress } = useAppState();
  const [dayId, setDayId] = useState(1);
  const [mode, setMode] = useState<QuizMode>("main");
  const [questions, setQuestions] = useState<Question[]>(getPracticeQuestionsForDay(1, "main"));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<Array<{ questionId: number; selectedAnswer: string; isCorrect: boolean }>>([]);
  const [awardedQuestionXp, setAwardedQuestionXp] = useState(0);
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      const resolved = await params;
      const nextDayId = Number(resolved.dayId);
      const nextMode = searchParams.get("mode") === "extra" ? "extra" : "main";
      const requestedIndex = Number(searchParams.get("questionIndex") ?? "0");
      const practiceQuestions = getPracticeQuestionsForDay(nextDayId, nextMode);
      const nextIndex = Number.isFinite(requestedIndex) ? Math.max(0, requestedIndex) : 0;

      if (!ignore && practiceQuestions.length > 0) {
        setDayId(nextDayId);
        setMode(nextMode);
        setQuestions(practiceQuestions);
        setCurrentIndex(Math.min(nextIndex, Math.max(0, practiceQuestions.length - 1)));
        setSelectedAnswer(null);
        setShowFeedback(false);
        setAnswers([]);
        setAwardedQuestionXp(0);
        setShowCompletionOverlay(false);
        return;
      }

      const { data } = await getQuestionsByDay(nextDayId);
      const fallbackQuestions = data.length > 0 ? data : demoQuestions.filter((question) => question.day_id === nextDayId);

      if (!ignore) {
        setDayId(nextDayId);
        setMode("main");
        setQuestions(fallbackQuestions);
        setCurrentIndex(Math.min(nextIndex, Math.max(0, fallbackQuestions.length - 1)));
        setSelectedAnswer(null);
        setShowFeedback(false);
        setAnswers([]);
        setAwardedQuestionXp(0);
        setShowCompletionOverlay(false);
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
  const isCorrectAnswer = selectedAnswer === currentQuestion?.correct_answer;
  const topicLabel = currentQuestion?.topic ?? `Ден ${dayId}`;

  if (!currentQuestion) {
    return (
      <NeonCard padding="sm">
        <p className="mh-copy-muted">Няма налични въпроси за този ден.</p>
      </NeonCard>
    );
  }

  const handleSelect = async (answer: string) => {
    if (showFeedback) {
      return;
    }

    const isCorrect = answer === currentQuestion.correct_answer;
    setSelectedAnswer(answer);
    setShowFeedback(true);
    setAnswers((prev) => [...prev, { questionId: currentQuestion.id, selectedAnswer: answer, isCorrect }]);

    if (isCorrect) {
      setAwardedQuestionXp((prev) => prev + 10);
      await recordQuestionProgress({ topic: currentQuestion.topic as TopicName, isCorrect: true });
    }
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
      awardedQuestionXp,
    });

    if (mode === "main") {
      const nextDay = Math.min(10, dayId + 1);
      const nextHref = dayId < 10 ? `/lesson/${nextDay}` : "/roadmap";
      setShowCompletionOverlay(true);
      window.setTimeout(() => {
        router.push(nextHref);
      }, 5000);
      return;
    }

    router.push("/results");
  };

  const mascotMessage =
    isCorrectAnswer && showFeedback
      ? "Страхотна работа. Реши задачата вярно и можеш спокойно да продължиш напред."
      : isBonusMode
        ? "Това е бонус тренировка. Натисни още малко и затвърди темата."
        : "Избери отговор и ще получиш обратна връзка веднага.";

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {showCompletionOverlay ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(1,1,2)] px-6">
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center">
            <Image
              src="/images/success.gif"
              alt="MatHero celebrates a completed test"
              width={320}
              height={320}
              unoptimized
              className="h-auto w-full max-w-[320px] mix-blend-screen shadow-[0_0_48px_rgba(37,221,255,0.18)]"
            />
            <h2 className="mt-6 font-display text-4xl text-white">Страхотна работа!</h2>
            <p className="mh-copy-muted mt-3 max-w-md">Тестът е завършен. Зареждам следващия ден.</p>
          </motion.div>
        </div>
      ) : null}

      <NeonCard padding="sm">
        <SectionHeader
          label={isBonusMode ? "Бонус тренировка" : "Тест за деня"}
          title={<h2 className="mh-heading-lg">Ден {dayId}</h2>}
          action={<Badge tone="cyan">{currentIndex + 1} / {questions.length} въпроса</Badge>}
        />
        <p className="mh-copy-muted mt-2">Тема: {topicLabel}</p>
      </NeonCard>

      <MascotCharacter
        mood={showFeedback && isCorrectAnswer ? "celebrating" : "idle"}
        title={showFeedback && isCorrectAnswer ? "Страхотна работа!" : undefined}
        message={mascotMessage}
      />

      <ProgressBar
        label={isBonusMode ? "Бонус тренировка" : "Напредък в теста"}
        value={answeredQuestionsCount}
        max={questions.length}
        helperText={isBonusMode ? "Допълнителни задачи за по-силен резултат." : "Един въпрос наведнъж, без излишно напрежение."}
        accent={isBonusMode ? "pink" : "cyan"}
      />

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
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

        <motion.aside initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
          <NeonCard padding="sm" className="bg-[rgb(1,1,2)] lg:p-6">
            <p className="mh-label">Обратна връзка</p>

            {showFeedback ? (
              <>
                <div className={`mt-4 rounded-[24px] p-4 lg:p-5 ${isCorrectAnswer ? "border border-cyan-400/20 bg-cyan-400/5" : "border border-rose-400/20 bg-rose-400/5"}`}>
                  <h3 className={`font-display text-2xl leading-tight lg:text-[1.8rem] ${isCorrectAnswer ? "bg-gradient-to-r from-cyan-200 via-sky-100 to-fuchsia-200 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]" : "text-rose-300"}`}>
                    {isCorrectAnswer ? "Точно така." : "Опитай отново с повече увереност."}
                  </h3>
                  <p className="mh-copy-muted mt-3">
                    {isCorrectAnswer
                      ? "Избра верния отговор и можеш да продължиш към следващата задача."
                      : `Верният отговор е ${currentQuestion.correct_answer}. Можеш да отвориш обяснението и да видиш решението стъпка по стъпка.`}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <NeonButton type="button" onClick={handleContinue}>
                    {currentIndex < questions.length - 1 ? "Следващ" : "Резултат"}
                  </NeonButton>
                  <NeonButton
                    href={`/explanation/${currentQuestion.id}?fromDay=${dayId}&mode=${mode}&questionIndex=${currentIndex}`}
                    variant="secondary"
                  >
                    Обяснение
                  </NeonButton>
                </div>
              </>
            ) : (
              <>
                <h3 className="mt-4 font-display text-2xl leading-tight text-white lg:text-[1.8rem]">Избери отговор</h3>
                <div className="mt-5 rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="mh-copy text-slate-300">
                    Съвет: първо огледай всички варианти, после избери този, който можеш да защитиш с решение.
                  </p>
                </div>
              </>
            )}
          </NeonCard>
        </motion.aside>
      </section>
    </div>
  );
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createInitialProgress } from "@/lib/demoData";
import { getOrCreateSessionId } from "@/lib/session";
import { saveQuizAttempt, updateUserProgress } from "@/lib/supabaseClient";
import type { QuizAnswerPayload, QuizResultSummary, TopicName, UserProgress } from "@/types";

interface AppStateContextValue {
  sessionId: string;
  progress: UserProgress;
  latestResult: QuizResultSummary | null;
  completeQuiz: (input: {
    dayId: number;
    topic: TopicName;
    totalQuestions: number;
    answers: QuizAnswerPayload[];
  }) => Promise<void>;
}

const STORAGE_KEY = "maturohero-progress";
const RESULT_KEY = "maturohero-latest-result";

const AppStateContext = createContext<AppStateContextValue | null>(null);

function getInitialState() {
  if (typeof window === "undefined") {
    const fallbackSessionId = "loading-session";

    return {
      sessionId: fallbackSessionId,
      progress: createInitialProgress(fallbackSessionId),
      latestResult: null as QuizResultSummary | null,
      hydrated: false,
    };
  }

  const nextSessionId = getOrCreateSessionId();
  const savedProgress = window.localStorage.getItem(STORAGE_KEY);
  const savedResult = window.localStorage.getItem(RESULT_KEY);

  return {
    sessionId: nextSessionId,
    progress: savedProgress
      ? ({ ...JSON.parse(savedProgress), session_id: nextSessionId } as UserProgress)
      : createInitialProgress(nextSessionId),
    latestResult: savedResult
      ? (JSON.parse(savedResult) as QuizResultSummary)
      : null,
    hydrated: true,
  };
}

function computeWeakTopics(topicScores: UserProgress["topic_scores"]): TopicName[] {
  return (Object.entries(topicScores) as Array<[TopicName, number]>)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([topic]) => topic);
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const initialState = getInitialState();
  const [sessionId] = useState(initialState.sessionId);
  const [progress, setProgress] = useState<UserProgress>(initialState.progress);
  const [latestResult, setLatestResult] = useState<QuizResultSummary | null>(
    initialState.latestResult,
  );
  const [hydrated] = useState(initialState.hydrated);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...progress, session_id: sessionId }),
    );
  }, [progress, sessionId, hydrated]);

  useEffect(() => {
    if (!hydrated || !latestResult) {
      return;
    }

    window.localStorage.setItem(RESULT_KEY, JSON.stringify(latestResult));
  }, [latestResult, hydrated]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      sessionId,
      progress,
      latestResult,
      completeQuiz: async ({ dayId, topic, totalQuestions, answers }) => {
        const correctCount = answers.filter((answer) => answer.isCorrect).length;
        const score = Math.round((correctCount / totalQuestions) * 100);
        const completedDays = progress.completed_days.includes(dayId)
          ? progress.completed_days
          : [...progress.completed_days, dayId];

        const currentTopicScore = progress.topic_scores[topic];
        const nextTopicScore = Math.min(
          100,
          Math.round(currentTopicScore * 0.55 + score * 0.45),
        );

        const topicScores = {
          ...progress.topic_scores,
          [topic]: nextTopicScore,
        };

        const weakTopics = computeWeakTopics(topicScores);
        const recommendations =
          score >= 80
            ? [
                "Отличен резултат. Продължи към следващия ден.",
                "Реши още 1 смесен тест за скорост.",
              ]
            : [
                `Върни се към урока по ${topic.toLowerCase()} за 5 минути.`,
                "Прегледай стъпките на грешните задачи.",
              ];

        const nextProgress: UserProgress = {
          ...progress,
          current_day: Math.min(10, Math.max(progress.current_day, dayId + 1)),
          xp: progress.xp + score + 25,
          streak: progress.streak + 1,
          last_quiz_score: score,
          completed_days: completedDays.sort((a, b) => a - b),
          weak_topics: weakTopics,
          topic_scores: topicScores,
        };

        const result: QuizResultSummary = {
          dayId,
          score,
          totalQuestions,
          recommendations,
          weakTopics,
          correctQuestionIds: answers
            .filter((answer) => answer.isCorrect)
            .map((answer) => answer.questionId),
          incorrectQuestionIds: answers
            .filter((answer) => !answer.isCorrect)
            .map((answer) => answer.questionId),
        };

        setProgress(nextProgress);
        setLatestResult(result);

        void saveQuizAttempt({
          sessionId,
          dayId,
          score,
          totalQuestions,
          answers,
        });

        void updateUserProgress({
          sessionId,
          progress: {
            current_day: nextProgress.current_day,
            xp: nextProgress.xp,
            streak: nextProgress.streak,
            last_quiz_score: nextProgress.last_quiz_score,
            completed_days: nextProgress.completed_days,
            weak_topics: nextProgress.weak_topics,
            topic_scores: nextProgress.topic_scores,
          },
        });
      },
    }),
    [latestResult, progress, sessionId],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider.");
  }

  return context;
}

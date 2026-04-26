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
import {
  getUserProgress,
  saveQuizAttempt,
  supabase,
  updateUserProgress,
} from "@/lib/supabaseClient";
import type {
  QuizAnswerPayload,
  QuizMode,
  QuizResultSummary,
  TopicName,
  UserProgress,
} from "@/types";

interface AppStateContextValue {
  sessionId: string;
  progress: UserProgress;
  latestResult: QuizResultSummary | null;
  recordQuestionProgress: (input: {
    topic: TopicName;
    isCorrect: boolean;
  }) => Promise<void>;
  completeQuiz: (input: {
    dayId: number;
    mode: QuizMode;
    topic: TopicName;
    totalQuestions: number;
    answers: QuizAnswerPayload[];
    awardedQuestionXp: number;
  }) => Promise<void>;
  resetProgress: () => void;
}

const STORAGE_PREFIX = "maturohero-progress-v3";
const RESULT_PREFIX = "maturohero-latest-result-v3";
const QUESTION_CORRECT_XP = 10;

const AppStateContext = createContext<AppStateContextValue | null>(null);

function getProgressStorageKey(sessionId: string) {
  return `${STORAGE_PREFIX}:${sessionId}`;
}

function getResultStorageKey(sessionId: string) {
  return `${RESULT_PREFIX}:${sessionId}`;
}

function readProgressFromStorage(sessionId: string): UserProgress | null {
  if (typeof window === "undefined") {
    return null;
  }

  const savedProgress = window.localStorage.getItem(getProgressStorageKey(sessionId));
  return savedProgress
    ? ({ ...JSON.parse(savedProgress), session_id: sessionId } as UserProgress)
    : null;
}

function readLatestResultFromStorage(sessionId: string): QuizResultSummary | null {
  if (typeof window === "undefined") {
    return null;
  }

  const savedResult = window.localStorage.getItem(getResultStorageKey(sessionId));
  return savedResult ? (JSON.parse(savedResult) as QuizResultSummary) : null;
}

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

  return {
    sessionId: nextSessionId,
    progress: readProgressFromStorage(nextSessionId) ?? createInitialProgress(nextSessionId),
    latestResult: readLatestResultFromStorage(nextSessionId),
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
  const [sessionId, setSessionId] = useState(initialState.sessionId);
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
      getProgressStorageKey(sessionId),
      JSON.stringify({ ...progress, session_id: sessionId }),
    );
  }, [progress, sessionId, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (latestResult) {
      window.localStorage.setItem(getResultStorageKey(sessionId), JSON.stringify(latestResult));
      return;
    }

    window.localStorage.removeItem(getResultStorageKey(sessionId));
  }, [latestResult, sessionId, hydrated]);

  useEffect(() => {
    if (!hydrated || !supabase) {
      return;
    }

    const authClient = supabase;
    let active = true;

    async function syncForSession(nextSessionId: string, isAuthenticated: boolean) {
      const localProgress =
        readProgressFromStorage(nextSessionId) ?? createInitialProgress(nextSessionId);
      const localResult = readLatestResultFromStorage(nextSessionId);

      if (!isAuthenticated) {
        if (!active) {
          return;
        }

        setSessionId(nextSessionId);
        setProgress(localProgress);
        setLatestResult(localResult);
        return;
      }

      const { data } = await getUserProgress(nextSessionId);

      if (!active) {
        return;
      }

      setSessionId(nextSessionId);
      setProgress({ ...data, session_id: nextSessionId });
      setLatestResult(localResult);
    }

    async function bootstrapAuthState() {
      const {
        data: { session },
      } = await authClient.auth.getSession();

      const authenticatedUserId = session?.user.id ?? null;
      const nextSessionId = authenticatedUserId ?? getOrCreateSessionId();
      await syncForSession(nextSessionId, Boolean(authenticatedUserId));
    }

    void bootstrapAuthState();

    const {
      data: { subscription },
    } = authClient.auth.onAuthStateChange((_event, session) => {
      const authenticatedUserId = session?.user.id ?? null;
      const nextSessionId = authenticatedUserId ?? getOrCreateSessionId();
      void syncForSession(nextSessionId, Boolean(authenticatedUserId));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [hydrated]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      sessionId,
      progress,
      latestResult,
      recordQuestionProgress: async ({ topic, isCorrect }) => {
        if (!isCorrect) {
          return;
        }

        const nextTopicScore = Math.min(100, (progress.topic_scores[topic] ?? 50) + 2);
        const topicScores = {
          ...progress.topic_scores,
          [topic]: nextTopicScore,
        };
        const weakTopics = computeWeakTopics(topicScores);
        const nextProgress: UserProgress = {
          ...progress,
          xp: progress.xp + QUESTION_CORRECT_XP,
          weak_topics: weakTopics,
          topic_scores: topicScores,
        };

        setProgress(nextProgress);

        await updateUserProgress({
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
      completeQuiz: async ({ dayId, mode, topic, totalQuestions, answers, awardedQuestionXp }) => {
        const correctCount = answers.filter((answer) => answer.isCorrect).length;
        const score = Math.round((correctCount / totalQuestions) * 100);
        const completedDays = progress.completed_days.includes(dayId)
          ? progress.completed_days
          : [...progress.completed_days, dayId];
        const shouldAdvanceDay = mode === "main";

        const currentTopicScore = progress.topic_scores[topic] ?? 50;
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
                mode === "main"
                  ? "Отличен резултат. Ако искаш, мини и през бонус задачите за деня."
                  : "Бонус пакетът е овладян. Спокойно можеш да продължиш към следващия ден.",
                "Прегледай и обясненията на задачите, за да затвърдиш подхода.",
              ]
            : [
                `Върни се към урока по ${topic.toLowerCase()} за 5 минути.`,
                mode === "main"
                  ? "След основния тест мини и през бонус задачите, но бавно и с фокус."
                  : "Прегледай стъпките на грешните задачи и опитай пак по-късно.",
              ];

        const nextProgress: UserProgress = {
          ...progress,
          current_day: shouldAdvanceDay
            ? Math.min(10, Math.max(progress.current_day, dayId + 1))
            : progress.current_day,
          xp:
            progress.xp +
            score +
            (mode === "extra" ? 15 : 25) -
            awardedQuestionXp,
          streak: shouldAdvanceDay ? progress.streak + 1 : progress.streak,
          last_quiz_score: score,
          completed_days: shouldAdvanceDay ? completedDays.sort((a, b) => a - b) : progress.completed_days,
          weak_topics: weakTopics,
          topic_scores: topicScores,
        };

        const result: QuizResultSummary = {
          dayId,
          mode,
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

        await Promise.all([
          saveQuizAttempt({
            sessionId,
            dayId,
            score,
            totalQuestions,
            answers,
          }),
          updateUserProgress({
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
          }),
        ]);
      },
      resetProgress: () => {
        const freshProgress = createInitialProgress(sessionId);

        setProgress(freshProgress);
        setLatestResult(null);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            getProgressStorageKey(sessionId),
            JSON.stringify({ ...freshProgress, session_id: sessionId }),
          );
          window.localStorage.removeItem(getResultStorageKey(sessionId));
        }

        void updateUserProgress({
          sessionId,
          progress: {
            current_day: freshProgress.current_day,
            xp: freshProgress.xp,
            streak: freshProgress.streak,
            last_quiz_score: freshProgress.last_quiz_score,
            completed_days: freshProgress.completed_days,
            weak_topics: freshProgress.weak_topics,
            topic_scores: freshProgress.topic_scores,
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

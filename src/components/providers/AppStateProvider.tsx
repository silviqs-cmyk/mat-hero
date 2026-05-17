"use client";

import {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getAuthRedirectPath,
  getSessionWithRecovery,
  getUserWithRecovery,
  isProtectedAppRoute,
} from "@/lib/auth/browserSession";
import { LoadingState } from "@/components/ui/LoadingState";
import { createInitialProgress } from "@/lib/demoData";
import { getOrCreateSessionId } from "@/lib/session";
import {
  getUserProgress,
  saveQuizAttempt,
  supabase,
  updateUserProgress,
} from "@/lib/supabaseClient";
import type {
  AuthUserProfile,
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
  authUser: AuthUserProfile;
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
const GUEST_USER: AuthUserProfile = {
  id: null,
  email: null,
  displayName: "",
  gradeLabel: null,
  isGuest: true,
  isReady: false,
};

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

function toDisplayName(email: string | null, metadata: Record<string, unknown> | undefined) {
  const metadataName =
    typeof metadata?.full_name === "string"
      ? metadata.full_name
      : typeof metadata?.display_name === "string"
        ? metadata.display_name
        : typeof metadata?.name === "string"
          ? metadata.name
          : null;

  if (metadataName && metadataName.trim().length > 0) {
    return metadataName.trim();
  }

  if (email) {
    const localPart = email.split("@")[0]?.trim();
    if (localPart) {
      return localPart.charAt(0).toUpperCase() + localPart.slice(1);
    }
  }

  return "";
}

function toGradeLabel(metadata: Record<string, unknown> | undefined) {
  if (typeof metadata?.grade_label === "string" && metadata.grade_label.trim().length > 0) {
    return metadata.grade_label.trim();
  }

  if (typeof metadata?.grade === "string" && metadata.grade.trim().length > 0) {
    return metadata.grade.trim();
  }

  return null;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const initialState = getInitialState();
  const [sessionId, setSessionId] = useState(initialState.sessionId);
  const [progress, setProgress] = useState<UserProgress>(initialState.progress);
  const [latestResult, setLatestResult] = useState<QuizResultSummary | null>(
    initialState.latestResult,
  );
  const [authUser, setAuthUser] = useState<AuthUserProfile>(GUEST_USER);
  const [hydrated] = useState(initialState.hydrated);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const redirectTimeoutRef = useRef<number | null>(null);

  const cancelPendingRedirect = useEffectEvent(() => {
    if (redirectTimeoutRef.current !== null && typeof window !== "undefined") {
      window.clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }

    setIsCheckingAccess(false);
  });

  const scheduleLoginRedirect = useEffectEvent(() => {
    if (!isProtectedAppRoute(pathname)) {
      cancelPendingRedirect();
      return;
    }

    const redirectPath = getAuthRedirectPath(pathname);

    if (pathname === redirectPath) {
      cancelPendingRedirect();
      return;
    }

    setIsCheckingAccess(true);

    if (redirectTimeoutRef.current !== null || typeof window === "undefined") {
      return;
    }

    redirectTimeoutRef.current = window.setTimeout(() => {
      redirectTimeoutRef.current = null;
      router.replace(redirectPath);
    }, 150);
  });

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
        setAuthUser({ ...GUEST_USER, isReady: true });
        return;
      }

      try {
        const { data } = await getUserProgress(nextSessionId);
        const user = await getUserWithRecovery({
          pathname,
          redirect: true,
          router,
        });

        if (!active) {
          return;
        }

        setSessionId(nextSessionId);
        setProgress({ ...data, session_id: nextSessionId });
        setLatestResult(localResult);
        setAuthUser({
          id: user?.id ?? nextSessionId,
          email: user?.email ?? null,
          displayName: toDisplayName(user?.email ?? null, user?.user_metadata),
          gradeLabel: toGradeLabel(user?.user_metadata),
          isGuest: false,
          isReady: true,
        });
        cancelPendingRedirect();
      } catch (error) {
        console.error("Supabase auth sync failed", error);

        if (!active) {
          return;
        }

        setSessionId(nextSessionId);
        setProgress(localProgress);
        setLatestResult(localResult);
        setAuthUser({ ...GUEST_USER, isReady: true });
        scheduleLoginRedirect();
      }
    }

    async function bootstrapAuthState() {
      try {
        const session = await getSessionWithRecovery({
          pathname,
          redirect: true,
          router,
        });

        const authenticatedUserId = session?.user.id ?? null;
        const nextSessionId = authenticatedUserId ?? getOrCreateSessionId();
        await syncForSession(nextSessionId, Boolean(authenticatedUserId));

        if (authenticatedUserId) {
          cancelPendingRedirect();
          return;
        }

        scheduleLoginRedirect();
      } catch (error) {
        console.error("Supabase auth bootstrap failed", error);

        if (!active) {
          return;
        }

        const nextSessionId = getOrCreateSessionId();
        await syncForSession(nextSessionId, false);
        scheduleLoginRedirect();
      }
    }

    void bootstrapAuthState();

    const {
      data: { subscription },
    } = authClient.auth.onAuthStateChange((_event, session) => {
      const authenticatedUserId = session?.user.id ?? null;
      const nextSessionId = authenticatedUserId ?? getOrCreateSessionId();

      if (authenticatedUserId) {
        cancelPendingRedirect();
      } else {
        scheduleLoginRedirect();
      }

      void syncForSession(nextSessionId, Boolean(authenticatedUserId));
    });

    return () => {
      active = false;
      cancelPendingRedirect();
      subscription.unsubscribe();
    };
  }, [hydrated, pathname, router]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      sessionId,
      progress,
      latestResult,
      authUser,
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
    [authUser, latestResult, progress, sessionId],
  );

  return (
    <AppStateContext.Provider value={value}>
      {isCheckingAccess ? (
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
          <LoadingState title="Проверявам сесията" lines={4} />
        </div>
      ) : (
        children
      )}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider.");
  }

  return context;
}

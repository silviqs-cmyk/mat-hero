import type { SupabaseClient } from "@supabase/supabase-js";
import { signOutAndClearBrowserSession } from "@/lib/auth/browserSession";
import { createInitialProgress, demoDays, demoLessons, demoQuestions } from "@/lib/demoData";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type {
  ApiResponse,
  Day,
  Lesson,
  Question,
  QuizAttempt,
  SaveQuizAttemptInput,
  UpdateUserProgressInput,
  UserProgress,
} from "@/types";

const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
let supabaseConfigError: string | null = null;

function getLegacySupabaseClient() {
  try {
    return getSupabaseBrowserClient();
  } catch (error) {
    supabaseConfigError =
      error instanceof Error
        ? error.message
        : "Supabase не е конфигуриран. Добави NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY.";
    return null;
  }
}

function getNetworkErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    if (error.message === "Failed to fetch") {
      return "Could not reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL, your network connection, and whether the Supabase project is active.";
    }

    return error.message;
  }

  return "Could not reach Supabase. Check your configuration and try again.";
}

function normalizeAuthErrorMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("email rate limit exceeded") ||
    normalized.includes("rate limit") ||
    normalized.includes("too many requests")
  ) {
    return "Изпращахме твърде много имейли за кратко. Изчакай малко и пробвай пак, или влез ако профилът вече е създаден.";
  }

  if (normalized.includes("user already registered")) {
    return "Този имейл вече е регистриран. Опитай да влезеш в профила си.";
  }

  return message;
}

function getAuthRedirectUrl(): string | undefined {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  if (!publicSiteUrl) {
    return undefined;
  }

  try {
    return new URL(publicSiteUrl).toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

export const supabase: SupabaseClient | null = getLegacySupabaseClient();

function withError<T>(data: T, error: string | null = null): ApiResponse<T> {
  return { data, error };
}

type SignUpResult = {
  requiresEmailConfirmation: boolean;
};

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<ApiResponse<boolean>> {
  if (!supabase) {
    return withError(false, supabaseConfigError ?? "Supabase не е конфигуриран.");
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return error ? withError(false, normalizeAuthErrorMessage(error.message)) : withError(true);
  } catch (error) {
    return withError(false, getNetworkErrorMessage(error));
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<ApiResponse<SignUpResult>> {
  if (!supabase) {
    return withError(
      { requiresEmailConfirmation: false },
      supabaseConfigError ?? "Supabase не е конфигуриран.",
    );
  }

  try {
    const emailRedirectTo = getAuthRedirectUrl();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: emailRedirectTo
        ? {
            emailRedirectTo,
          }
        : undefined,
    });

    if (error) {
      return withError({ requiresEmailConfirmation: false }, normalizeAuthErrorMessage(error.message));
    }

    return withError({
      requiresEmailConfirmation: !data.session,
    });
  } catch (error) {
    return withError({ requiresEmailConfirmation: false }, getNetworkErrorMessage(error));
  }
}

export async function signOutUser(): Promise<ApiResponse<boolean>> {
  if (!supabase) {
    return withError(true);
  }

  try {
    await signOutAndClearBrowserSession();
    return withError(true);
  } catch (error) {
    return withError(false, getNetworkErrorMessage(error));
  }
}

export async function getDays(): Promise<ApiResponse<Day[]>> {
  if (!supabase) {
    return withError(demoDays);
  }

  const { data, error } = await supabase
    .from("days")
    .select("*")
    .order("order_index", { ascending: true });

  return error ? withError(demoDays, error.message) : withError((data as Day[]) ?? demoDays);
}

export async function getLessonsByDay(dayId: number): Promise<ApiResponse<Lesson[]>> {
  if (!supabase) {
    return withError(demoLessons.filter((lesson) => lesson.day_id === dayId));
  }

  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("day_id", dayId)
    .order("id", { ascending: true });

  const fallback = demoLessons.filter((lesson) => lesson.day_id === dayId);
  return error ? withError(fallback, error.message) : withError((data as Lesson[]) ?? fallback);
}

export async function getQuestionsByDay(dayId: number): Promise<ApiResponse<Question[]>> {
  if (!supabase) {
    return withError(demoQuestions.filter((question) => question.day_id === dayId));
  }

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("day_id", dayId)
    .order("id", { ascending: true });

  const fallback = demoQuestions.filter((question) => question.day_id === dayId);
  return error
    ? withError(fallback, error.message)
    : withError((data as Question[]) ?? fallback);
}

export async function saveQuizAttempt(
  input: SaveQuizAttemptInput,
): Promise<ApiResponse<QuizAttempt>> {
  const fallbackAttempt: QuizAttempt = {
    id: Date.now(),
    session_id: input.sessionId,
    day_id: input.dayId,
    score: input.score,
    total_questions: input.totalQuestions,
    created_at: new Date().toISOString(),
  };

  if (!supabase) {
    return withError(fallbackAttempt);
  }

  const { data, error } = await supabase
    .from("quiz_attempts")
    .insert({
      session_id: input.sessionId,
      day_id: input.dayId,
      score: input.score,
      total_questions: input.totalQuestions,
    })
    .select("*")
    .single();

  if (error || !data) {
    return withError(fallbackAttempt, error?.message ?? "Could not save quiz attempt.");
  }

  if (input.answers.length > 0) {
    await supabase.from("question_attempts").insert(
      input.answers.map((answer) => ({
        quiz_attempt_id: data.id,
        question_id: answer.questionId,
        selected_answer: answer.selectedAnswer,
        is_correct: answer.isCorrect,
      })),
    );
  }

  return withError(data as QuizAttempt);
}

export async function updateUserProgress(
  input: UpdateUserProgressInput,
): Promise<ApiResponse<UserProgress>> {
  const fallbackProgress: UserProgress = {
    id: 1,
    session_id: input.sessionId,
    ...input.progress,
  };

  if (!supabase) {
    return withError(fallbackProgress);
  }

  const { data, error } = await supabase
    .from("user_progress")
    .upsert(
      {
        session_id: input.sessionId,
        current_day: input.progress.current_day,
        xp: input.progress.xp,
        streak: input.progress.streak,
        last_quiz_score: input.progress.last_quiz_score,
        completed_days: input.progress.completed_days,
        weak_topics: input.progress.weak_topics,
        topic_scores: input.progress.topic_scores,
      },
      { onConflict: "session_id" },
    )
    .select("*")
    .single();

  return error
    ? withError(fallbackProgress, error.message)
    : withError((data as UserProgress) ?? fallbackProgress);
}

export async function getUserProgress(sessionId: string): Promise<ApiResponse<UserProgress>> {
  if (!supabase) {
    return withError(createInitialProgress(sessionId));
  }

  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (error || !data) {
    return withError(createInitialProgress(sessionId), error?.message ?? null);
  }

  return withError(data as UserProgress);
}

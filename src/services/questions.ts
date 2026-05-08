import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { resolveQuestionGroup, type QuestionGroup } from "@/lib/questionGroups";
import type { Question, QuestionOption } from "@/types/course";

export async function getQuestionsForDay(
  dayId: string,
  includeBonus = true,
  group?: QuestionGroup,
): Promise<Question[]> {
  const supabase = getSupabaseBrowserClient();
  const query = supabase
    .from("questions")
    .select("*")
    .eq("course_day_id", dayId)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as Question[]).filter((question) => {
    const resolvedGroup = resolveQuestionGroup(question);

    if (!includeBonus && resolvedGroup === "bonus") {
      return false;
    }

    if (group && resolvedGroup !== group) {
      return false;
    }

    return true;
  });
}

export async function getQuestionOptions(questionId: string): Promise<QuestionOption[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("question_options")
    .select("*")
    .eq("question_id", questionId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as QuestionOption[];
}

export async function getQuestionsWithOptionsForDay(
  dayId: string,
  includeBonus = true,
  group?: QuestionGroup,
): Promise<Question[]> {
  const questions = await getQuestionsForDay(dayId, includeBonus, group);

  return Promise.all(
    questions.map(async (question) => ({
      ...question,
      options: await getQuestionOptions(question.id),
    })),
  );
}

export interface SaveUserAnswerInput {
  userId: string;
  questionId: string;
  selectedOptionId?: string | null;
  openAnswer?: string | null;
  isCorrect: boolean;
  pointsEarned: number;
  timeSpentSeconds?: number;
}

export async function saveUserAnswer(input: SaveUserAnswerInput) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("user_answers")
    .insert({
      user_id: input.userId,
      question_id: input.questionId,
      selected_option_id: input.selectedOptionId ?? null,
      open_answer: input.openAnswer ?? null,
      is_correct: input.isCorrect,
      points_earned: input.pointsEarned,
      time_spent_seconds: input.timeSpentSeconds ?? 0,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listUserAnswersForDay(userId: string, dayId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data: questions, error: questionError } = await supabase
    .from("questions")
    .select("id")
    .eq("course_day_id", dayId);

  if (questionError) {
    throw new Error(questionError.message);
  }

  const questionIds = (questions ?? []).map((question) => question.id);
  if (questionIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("user_answers")
    .select("*")
    .eq("user_id", userId)
    .in("question_id", questionIds)
    .order("answered_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

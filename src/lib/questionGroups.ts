export type QuestionGroup = "practice" | "quiz" | "bonus";

interface QuestionGroupLike {
  question_group?: string | null;
  is_bonus?: boolean | null;
}

export function isQuestionGroup(value: string | null | undefined): value is QuestionGroup {
  return value === "practice" || value === "quiz" || value === "bonus";
}

export function resolveQuestionGroup(question: QuestionGroupLike): QuestionGroup {
  if (isQuestionGroup(question.question_group)) {
    return question.question_group;
  }

  return question.is_bonus ? "bonus" : "practice";
}

export function normalizeQuestionGroup(question: QuestionGroupLike): QuestionGroup {
  if (question.is_bonus) {
    return "bonus";
  }

  return resolveQuestionGroup(question);
}

export function getQuestionGroupFlags(question: QuestionGroupLike) {
  const questionGroup = normalizeQuestionGroup(question);

  return {
    question_group: questionGroup,
    is_bonus: questionGroup === "bonus",
  };
}

export type QuestionGroup = "practice" | "quiz" | "bonus";

interface QuestionGroupLike {
  question_group?: string | null;
  is_bonus?: boolean | null;
}

interface SortableQuestionGroupLike extends QuestionGroupLike {
  sort_order?: number | null;
}

export const MINI_TEST_PRACTICE_START_INDEX = 14;
export const MINI_TEST_PRACTICE_END_INDEX = 29;

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

function sortQuestionsByOrder<T extends SortableQuestionGroupLike>(questions: T[]) {
  return [...questions].sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0));
}

export function getExplicitQuizQuestions<T extends SortableQuestionGroupLike>(questions: T[]) {
  return sortQuestionsByOrder(
    questions.filter((question) => resolveQuestionGroup(question) === "quiz"),
  );
}

export function getAllPracticeQuestions<T extends SortableQuestionGroupLike>(questions: T[]) {
  return sortQuestionsByOrder(
    questions.filter((question) => resolveQuestionGroup(question) === "practice"),
  );
}

export function getMiniTestQuestions<T extends SortableQuestionGroupLike>(questions: T[]) {
  const explicitQuizQuestions = getExplicitQuizQuestions(questions);
  if (explicitQuizQuestions.length > 0) {
    return explicitQuizQuestions;
  }

  const practiceQuestions = getAllPracticeQuestions(questions);
  return practiceQuestions.slice(MINI_TEST_PRACTICE_START_INDEX, MINI_TEST_PRACTICE_END_INDEX);
}

export function getPracticeQuestions<T extends SortableQuestionGroupLike>(questions: T[]) {
  const explicitQuizQuestions = getExplicitQuizQuestions(questions);
  const practiceQuestions = getAllPracticeQuestions(questions);

  if (explicitQuizQuestions.length > 0) {
    return practiceQuestions;
  }

  return [
    ...practiceQuestions.slice(0, MINI_TEST_PRACTICE_START_INDEX),
    ...practiceQuestions.slice(MINI_TEST_PRACTICE_END_INDEX),
  ];
}

export function getBonusQuestions<T extends SortableQuestionGroupLike>(questions: T[]) {
  return sortQuestionsByOrder(
    questions.filter((question) => resolveQuestionGroup(question) === "bonus"),
  );
}

export function hasMiniTestQuestions<T extends SortableQuestionGroupLike>(questions: T[]) {
  return getMiniTestQuestions(questions).length > 0;
}

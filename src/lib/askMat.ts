import { normalizeExplanationText } from "@/lib/explanations";
import type { Question } from "@/types/course";

interface AskMatOption {
  option_text: string;
  is_correct: boolean;
}

export type AskMatMode = "practice" | "quiz" | "bonus";

interface FormatAskMatExplanationOptions {
  mode: AskMatMode;
  question: Question;
  correctAnswer: string | null;
  options: AskMatOption[];
}

function splitExplanationSentences(text: string) {
  if (!text.trim()) {
    return [];
  }

  return normalizeExplanationText(text)
    .split(/(?<=[.!?])\s+(?=[A-ZА-Я(])/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function getCorrectOptionLabel(options: AskMatOption[], correctAnswer: string | null) {
  const correctIndex = options.findIndex((option) => option.is_correct);
  if (correctIndex >= 0) {
    return String.fromCharCode(65 + correctIndex);
  }

  if (!correctAnswer) {
    return null;
  }

  const matchedIndex = options.findIndex((option) => option.option_text.trim() === correctAnswer.trim());
  return matchedIndex >= 0 ? String.fromCharCode(65 + matchedIndex) : null;
}

function buildDefaultAskMatExplanation(question: Question) {
  return question.explanation?.trim()
    ? normalizeExplanationText(question.explanation)
    : "Преговори условието и опитай отново стъпка по стъпка.";
}

function buildBonusAskMatExplanation(question: Question, correctAnswer: string | null, options: AskMatOption[]) {
  const prompt = normalizeExplanationText(question.prompt);
  const explanation = question.explanation?.trim() ? normalizeExplanationText(question.explanation) : "";
  const explanationSentences = splitExplanationSentences(explanation);
  const planLine = explanationSentences[0] ?? "Подреждаме данните от условието и избираме най-подходящия изпитен метод.";
  const stepLines =
    explanationSentences.length > 0
      ? explanationSentences.map((sentence, index) => `${index + 1}. ${sentence}`)
      : [
          "1. Прочитаме внимателно условието и отделяме важните данни.",
          "2. Избираме подходящото действие или модел за решаване.",
          "3. Пресмятаме и сверяваме получения резултат с условието.",
        ];
  const optionLabel = getCorrectOptionLabel(options, correctAnswer);
  const answerLine = correctAnswer
    ? optionLabel
      ? `Финалният отговор е ${correctAnswer}. Верният вариант е ${optionLabel}.`
      : `Финалният отговор е ${correctAnswer}.`
    : "Финалният отговор е този, който съвпада с направените пресмятания и условието.";
  const commonMistake =
    question.question_type === "open_answer"
      ? "Да се запише междинен резултат като краен отговор, без да се довърши задачата."
      : "Да се избере вариант по усет, без да се направи пълна проверка на пресмятанията.";

  return [
    "Какво се търси?",
    `Трябва да намерим верния отговор на задачата: ${prompt}`,
    "",
    "Какво знаем?",
    `От условието използваме всички дадени зависимости, числа и величини: ${prompt}`,
    "",
    "План:",
    planLine,
    "",
    "Решение стъпка по стъпка:",
    ...stepLines,
    "",
    "Проверка:",
    "Сверяваме получения резултат с условието и проверяваме дали е логичен и съвместим с всички дадени данни.",
    "",
    "Отговор:",
    answerLine,
    "",
    "Честа грешка:",
    commonMistake,
  ].join("\n");
}

export function formatAskMatExplanation({
  mode,
  question,
  correctAnswer,
  options,
}: FormatAskMatExplanationOptions) {
  if (mode === "bonus") {
    return buildBonusAskMatExplanation(question, correctAnswer, options);
  }

  return buildDefaultAskMatExplanation(question);
}

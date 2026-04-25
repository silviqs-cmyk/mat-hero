import { dayTaskData } from "@/lib/dayTaskData";
import { demoDays } from "@/lib/demoData";
import type { Question, QuizMode } from "@/types";

function getQuestionId(dayId: number, mode: QuizMode, index: number) {
  const modeOffset = mode === "main" ? 1000 : 2000;
  return dayId * 10000 + modeOffset + index + 1;
}

function getDifficulty(index: number, total: number): Question["difficulty"] {
  if (total <= 3) {
    return index === total - 1 ? "hard" : "medium";
  }

  if (index < Math.ceil(total / 3)) {
    return "easy";
  }

  if (index >= total - Math.ceil(total / 3)) {
    return "hard";
  }

  return "medium";
}

export function getPracticeQuestionsForDay(dayId: number, mode: QuizMode): Question[] {
  const topic = demoDays.find((day) => day.id === dayId)?.topic ?? `Ден ${dayId}`;
  const tasks = dayTaskData[dayId]?.[mode] ?? [];

  return tasks.map((task, index) => {
    const answers = task.answers.map((text, answerIndex) => ({
      id: String.fromCharCode(65 + answerIndex),
      text,
    }));
    const correctIndex = Number(task.correctAnswerKey.replace("answer_", "")) - 1;
    const correctAnswer = answers[correctIndex]?.text ?? answers[0]?.text ?? "";

    return {
      id: getQuestionId(dayId, mode, index),
      day_id: dayId,
      topic,
      difficulty: getDifficulty(index, tasks.length),
      question_text: task.question,
      options: answers,
      correct_answer: correctAnswer,
      explanation_steps: [task.explanation],
    };
  });
}

export function getPracticeQuestionById(questionId: number): Question | null {
  for (const dayKey of Object.keys(dayTaskData)) {
    const dayId = Number(dayKey);

    for (const mode of ["main", "extra"] as const) {
      const questions = getPracticeQuestionsForDay(dayId, mode);
      const question = questions.find((item) => item.id === questionId);

      if (question) {
        return question;
      }
    }
  }

  return null;
}

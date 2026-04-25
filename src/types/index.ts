export type TopicName = string;

export type AnimationType =
  | "percentage-bars"
  | "fraction-stack"
  | "geometry-pulse";

export type Difficulty = "easy" | "medium" | "hard";

export interface Day {
  id: number;
  title: string;
  topic: TopicName;
  is_active: boolean;
  order_index: number;
}

export interface Lesson {
  id: number;
  day_id: number;
  title: string;
  short_theory: string;
  example: string;
  animation_type: AnimationType;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  day_id: number;
  topic: TopicName;
  difficulty: Difficulty;
  question_text: string;
  options: QuestionOption[];
  correct_answer: string;
  explanation_steps: string[];
}

export interface UserProgress {
  id: number;
  session_id: string;
  current_day: number;
  xp: number;
  streak: number;
  last_quiz_score: number;
  completed_days: number[];
  weak_topics: TopicName[];
  topic_scores: Record<TopicName, number>;
}

export interface QuizAttempt {
  id: number;
  session_id: string;
  day_id: number;
  score: number;
  total_questions: number;
  created_at: string;
}

export interface QuestionAttempt {
  id: number;
  quiz_attempt_id: number;
  question_id: number;
  selected_answer: string;
  is_correct: boolean;
  created_at: string;
}

export interface QuizAnswerPayload {
  questionId: number;
  selectedAnswer: string;
  isCorrect: boolean;
}

export interface QuizResultSummary {
  dayId: number;
  score: number;
  totalQuestions: number;
  recommendations: string[];
  weakTopics: TopicName[];
  correctQuestionIds: number[];
  incorrectQuestionIds: number[];
}

export interface SaveQuizAttemptInput {
  sessionId: string;
  dayId: number;
  score: number;
  totalQuestions: number;
  answers: QuizAnswerPayload[];
}

export interface UpdateUserProgressInput {
  sessionId: string;
  progress: Omit<UserProgress, "id" | "session_id">;
}

export interface ApiResponse<T> {
  data: T;
  error: string | null;
}

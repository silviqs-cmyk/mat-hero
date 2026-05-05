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
  extended_theory?: string[];
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

export interface PracticeTask {
  question: string;
  answers: string[];
  correctAnswerKey: string;
  explanation: string;
}

export interface DailyTaskSet {
  main: PracticeTask[];
  extra: PracticeTask[];
}

export type QuizMode = "main" | "extra";

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
  mode: QuizMode;
  score: number;
  totalQuestions: number;
  recommendations: string[];
  weakTopics: TopicName[];
  correctQuestionIds: number[];
  incorrectQuestionIds: number[];
}

export interface AuthUserProfile {
  id: string | null;
  email: string | null;
  displayName: string;
  gradeLabel: string | null;
  isGuest: boolean;
  isReady: boolean;
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

export type DayPlanStepTone = "purple" | "cyan" | "green" | "gold";
export type DayPlanStepType = "lesson" | "practice" | "quiz" | "bonus";

export interface DayTimelineItem {
  id: string;
  dayNumber: number;
  title: string;
  subtitle: string;
  isActive?: boolean;
  href?: string;
}

export interface DayPlanStep {
  id: string;
  type: DayPlanStepType;
  eyebrow: string;
  title: string;
  ctaLabel: string;
  tone: DayPlanStepTone;
  count: number | null;
  href?: string;
}

export interface LessonContentBlock {
  title: string;
  content: string;
  tone: "cyan" | "purple";
}

export interface LessonContentModel {
  id: string;
  title: string;
  badge: string;
  videoDuration: string;
  primaryCtaHref: string;
  secondaryCtaHref?: string;
  blocks: LessonContentBlock[];
}

export interface ShortVideo {
  id: EntityId;
  editor_key: string;
  course_day_id?: EntityId | null;
  lesson_id?: EntityId | null;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  provider: string;
  duration_seconds: number;
  order_index: number;
  is_published: boolean;
}

export interface GoalProgressModel {
  title: string;
  target: string;
  progress: number;
}

export interface HeroBuddyModel {
  title: string;
  message: string;
  rewardLabel: string;
}

export interface DayTopicModel {
  id: string;
  title: string;
  summary: string;
}

export interface CourseDayScreenData {
  id: string;
  dayNumber: number;
  totalDays: number;
  title: string;
  subtitle: string;
  progress: number;
  streak: number;
  xp: number;
  notificationCount: number;
  studentName: string;
  studentGrade: string;
  planBadge: string;
  planTitle: string;
  topics: DayTopicModel[];
  timeline: DayTimelineItem[];
  lesson: LessonContentModel;
  planSteps: DayPlanStep[];
  heroBuddy: HeroBuddyModel;
  outcomes: string[];
  goal: GoalProgressModel;
}

export type EntityId = number | string;

export type AdminTaskType = "multiple_choice" | "open_answer" | "true_false";

export type LessonSectionKind = "theory" | "example" | "tip" | "summary";

export type TaskPlacement = "main" | "extra" | "diagnostic";

export type DayActivityType = "theory" | "video" | "test";

export interface AdminTopic {
  id: EntityId;
  editor_key: string;
  course_id?: EntityId;
  title: string;
  summary: string;
  theory_outline: string;
  order_index: number;
}

export interface AdminDayTopic {
  id: EntityId;
  editor_key: string;
  day_id?: EntityId;
  topic_id: EntityId;
  topic_editor_key?: string;
  order_index: number;
}

export interface AdminTaskAnswer {
  id: EntityId;
  editor_key: string;
  task_id?: EntityId;
  text: string;
  is_correct: boolean;
  order_index: number;
}

export interface AdminTask {
  id: EntityId;
  editor_key: string;
  day_id?: EntityId;
  lesson_section_id?: EntityId | null;
  topic_id?: EntityId | null;
  title: string;
  prompt: string;
  task_type: AdminTaskType;
  placement: TaskPlacement;
  explanation: string;
  expected_answer: string;
  order_index: number;
  answers: AdminTaskAnswer[];
}

export interface LessonSection {
  id: EntityId;
  editor_key: string;
  lesson_id?: EntityId;
  title: string;
  content: string;
  kind: LessonSectionKind;
  order_index: number;
}

export interface AdminLesson {
  id: EntityId;
  editor_key: string;
  day_id?: EntityId;
  topic_id?: EntityId | null;
  title: string;
  short_theory: string;
  example: string;
  animation_type: AnimationType;
  order_index: number;
  sections: LessonSection[];
  videos?: ShortVideo[];
}

export interface AdminCourseDay {
  id: EntityId;
  editor_key: string;
  course_id?: EntityId;
  title: string;
  topic: string;
  summary: string;
  is_active: boolean;
  order_index: number;
  flow?: DayActivityType[];
  topics?: AdminDayTopic[];
  lessons: AdminLesson[];
  tasks: AdminTask[];
  short_videos?: ShortVideo[];
}

export interface AdminCourse {
  id: EntityId;
  editor_key: string;
  title: string;
  subtitle: string;
  description: string;
  grade_label: string;
  accent_color: string;
  is_published: boolean;
  order_index: number;
  topics?: AdminTopic[];
  days: AdminCourseDay[];
}

export interface AdminStudioGraph {
  courses: AdminCourse[];
}

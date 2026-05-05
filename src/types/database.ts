export type UUID = string;

export interface DatabaseProfile {
  id: UUID;
  full_name: string | null;
  email: string | null;
  role: "student" | "admin";
  grade: number;
  goal_score: number;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCourse {
  id: UUID;
  title: string;
  slug: string;
  description: string;
  subject: string;
  grade: number;
  duration_days: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCourseDay {
  id: UUID;
  course_id: UUID;
  day_number: number;
  title: string;
  subtitle: string;
  description: string;
  estimated_minutes: number;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseLesson {
  id: UUID;
  course_day_id: UUID;
  title: string;
  type: string;
  content: string;
  video_url: string | null;
  estimated_minutes: number;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseLessonSection {
  id: UUID;
  lesson_id: UUID;
  title: string;
  section_type: string;
  content: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseQuestion {
  id: UUID;
  course_day_id: UUID;
  lesson_id: UUID | null;
  question_type: "multiple_choice" | "open_answer" | "true_false";
  prompt: string;
  explanation: string;
  expected_answer: string | null;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  topic: string;
  is_bonus: boolean;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseQuestionOption {
  id: UUID;
  question_id: UUID;
  option_text: string;
  is_correct: boolean;
  sort_order: number;
  created_at: string;
}

export interface DatabaseUserProgress {
  id: UUID;
  user_id: UUID;
  course_id: UUID;
  current_day_number: number;
  completed_days: number[];
  total_xp: number;
  streak_days: number;
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserAnswer {
  id: UUID;
  user_id: UUID;
  question_id: UUID;
  selected_option_id: UUID | null;
  open_answer: string | null;
  is_correct: boolean;
  points_earned: number;
  time_spent_seconds: number;
  answered_at: string;
}

export interface DatabaseDayResult {
  id: UUID;
  user_id: UUID;
  course_day_id: UUID;
  score: number;
  total_questions: number;
  percentage: number;
  weak_topics: string[];
  completed_at: string;
  created_at: string;
}

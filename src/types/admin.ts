import type { Course, CourseDay, Lesson, LessonSection, Question, QuestionOption } from "@/types/course";
import type { DayResult, UserProfile, UserProgress } from "@/types/user";

export interface AdminCourseEditor extends Course {
  days?: CourseDay[];
}

export interface AdminDayEditor extends CourseDay {
  lessons?: Lesson[];
  questions?: Question[];
}

export interface AdminLessonEditor extends Lesson {
  sections?: LessonSection[];
}

export interface AdminQuestionEditor extends Question {
  options?: QuestionOption[];
}

export interface AdminUserOverview {
  profile: UserProfile;
  progress: UserProgress[];
  latestResults: DayResult[];
}

export interface AdminDashboardStats {
  totalCourses: number;
  publishedDays: number;
  totalStudents: number;
  averageResultPercentage: number;
}

export interface CourseInput {
  title: string;
  slug: string;
  description: string;
  subject: string;
  grade: number;
  duration_days: number;
  is_published: boolean;
}

export interface CourseDayInput {
  course_id: string;
  day_number: number;
  title: string;
  subtitle: string;
  description: string;
  estimated_minutes: number;
  is_published: boolean;
  sort_order: number;
}

export interface LessonInput {
  course_day_id: string;
  title: string;
  type: string;
  content: string;
  video_url: string | null;
  video_provider: "youtube" | "vimeo" | "external" | "uploaded" | "none";
  video_title: string;
  video_thumbnail_url: string;
  video_duration_seconds: number | null;
  video_status: "draft" | "published";
  video_storage_path: string | null;
  estimated_minutes: number;
  sort_order: number;
  is_published: boolean;
}

export interface LessonSectionInput {
  lesson_id: string;
  title: string;
  section_type: string;
  content: string;
  sort_order: number;
  is_published: boolean;
  video_url: string | null;
  video_provider: "youtube" | "vimeo" | "external" | "uploaded" | "none";
  video_status: "draft" | "published";
}

export interface QuestionOptionInput {
  id?: string;
  option_text: string;
  is_correct: boolean;
  sort_order: number;
}

export interface QuestionInput {
  course_day_id: string;
  lesson_id: string | null;
  question_type: "multiple_choice" | "open_answer" | "true_false";
  prompt: string;
  explanation: string;
  expected_answer: string | null;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  topic: string;
  source_year: number | null;
  is_bonus: boolean;
  question_group: "practice" | "quiz" | "bonus";
  sort_order: number;
  is_published: boolean;
  options?: QuestionOptionInput[];
}

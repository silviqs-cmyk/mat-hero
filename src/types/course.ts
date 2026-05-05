import type {
  DatabaseCourse,
  DatabaseCourseDay,
  DatabaseLesson,
  DatabaseLessonSection,
  DatabaseQuestion,
  DatabaseQuestionOption,
} from "@/types/database";

export type Course = DatabaseCourse;

export interface CourseDay extends DatabaseCourseDay {
  lessons?: Lesson[];
  questions?: Question[];
}

export interface Lesson extends DatabaseLesson {
  sections?: LessonSection[];
}

export type LessonSection = DatabaseLessonSection;

export type QuestionOption = DatabaseQuestionOption;

export interface Question extends DatabaseQuestion {
  options?: QuestionOption[];
}

export interface CourseWithDays extends Course {
  days: CourseDay[];
}

export interface DayContentBundle {
  course: Course;
  day: CourseDay;
  lessons: Lesson[];
  questions: Question[];
}

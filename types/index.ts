export interface Plan {
  id: string;
  name: string;
  course_limit: number;
  max_chapters: number;
  max_lessons_per_chapter: number;
  price_cents: number;
  stripe_price_id: string | null;
  description?: string;
  features?: string[];
}

export interface CourseForCard {
  id: string;
  title: string;
  prompt: string | null;
  progress: number;
  totalLessons: number;
  completedLessons: number;
}
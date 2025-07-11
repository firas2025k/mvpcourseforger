export interface Plan {
  id: string;
  name: string;
  course_limit: number;
  max_chapters: number;
  max_lessons_per_chapter: number;
  max_presentations: number | null; // NEW
  max_slides_per_presentation: number | null; // NEW
  credit_amount: number | null; // NEW
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


export interface QuizOption {
  text: string;
  isCorrect: boolean; // This might be how Gemini sends it, or we derive it
}

export interface Quiz {
  id: string;
  lesson_id: string;
  question: string;
  options: string[]; // Stored as JSON array of strings in Supabase
  correct_answer: string;
  // explanation?: string; // Optional: if Gemini provides it
}

export interface Lesson {
  id: string;
  chapter_id: string;
  title: string;
  content: string; // Rich text or markdown
  lesson_number: number;
  quizzes?: Quiz[]; // Quizzes will be attached here after fetching
}

export interface Chapter {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  lessons?: Lesson[]; // Lessons will be attached here
}

export interface Course {
  id: string;
  user_id: string;
  title: string;
  prompt: string | null;
  difficulty: string | null;
  generated_content: any; // The raw JSON from Gemini if needed
  created_at: string;
  updated_at: string;
  chapters?: Chapter[]; // Chapters will be attached here
}

// Props for the main course page component
export interface CoursePageProps {
  params: { courseId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Structure for the fully populated course data
export interface FullCourseData extends Course {
  chapters: (Chapter & {
    lessons: (Lesson & {
      quizzes: Quiz[];
    })[];
  })[];
}

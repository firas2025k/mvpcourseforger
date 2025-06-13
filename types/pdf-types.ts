// TypeScript interfaces for PDF export functionality
// Add this to your types/index.ts or create a new types/pdf.ts file

export interface PdfExportRequest {
    courseId: string;
  }
  
  export interface PdfExportResponse {
    success: boolean;
    message?: string;
    error?: string;
    filename?: string;
  }
  
  export interface CourseForPdf {
    id: string;
    title: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    prompt: string;
    chapters: ChapterForPdf[];
  }
  
  export interface ChapterForPdf {
    id: string;
    title: string;
    order_index: number;
    lessons: LessonForPdf[];
  }
  
  export interface LessonForPdf {
    id: string;
    title: string;
    content: string;
    order_index: number;
    quizzes?: QuizForPdf[];
  }
  
  export interface QuizForPdf {
    id: string;
    question: string;
    correct_answer: string;
    wrong_answers: string[];
  }
  
  export interface PdfGenerationOptions {
    format?: 'A4' | 'Letter' | 'Legal';
    includeQuizzes?: boolean;
    includeAnswers?: boolean;
    headerText?: string;
    footerText?: string;
    margins?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
  }
  
  export interface PdfExportError {
    code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'GENERATION_FAILED' | 'INVALID_REQUEST' | 'SERVER_ERROR';
    message: string;
    details?: string;
  }
  
  
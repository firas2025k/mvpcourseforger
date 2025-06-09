// Centralized type definitions

export interface Plan {
  id: string; // Your internal UUID for the plan
  name: string;
  course_limit: number;
  price_cents: number;
  stripe_price_id: string | null;
  description?: string; 
  features?: string[]; // Example: ['Feature 1', 'Feature 2']
}

// Add other shared types here as your application grows
// For example, Course, Chapter, Lesson types if not already defined elsewhere

export interface CourseForCard {
  id: string;
  title: string;
  prompt: string | null;
  // Progress related fields
  progress: number; // Percentage, e.g., 50 for 50%
  totalLessons: number;
  completedLessons: number;
}


// You can also re-export types from other files if needed
// export * from './otherTypesFile';

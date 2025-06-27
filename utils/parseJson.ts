export function parseStructuredJson(jsonString: string): any {
  console.log('parseStructuredJson called with:', typeof jsonString, jsonString?.length);
  
  if (!jsonString || typeof jsonString !== 'string') {
    console.error('Invalid input to parseStructuredJson:', jsonString);
    return createFallbackCourse('Invalid input provided');
  }

  try {
    // First, try to parse the JSON string as-is
    const parsed = JSON.parse(jsonString);
    console.log('JSON parsed successfully on first attempt');
    return parsed;
  } catch (error) {
    console.log('Initial JSON parse failed, attempting repair...', error);
    
    try {
      // Clean up common JSON formatting issues
      let repairedString = jsonString
        // Remove trailing commas before closing brackets/braces
        .replace(/,\s*]/g, "]")
        .replace(/,\s*}/g, "}")
        // Fix missing quotes around property names
        .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
        // Fix single quotes to double quotes
        .replace(/'/g, '"')
        // Remove any control characters that might break JSON
        .replace(/[\x00-\x1F\x7F]/g, '')
        // Fix escaped quotes that might be malformed
        .replace(/\\"/g, '\\"')
        // Remove any trailing commas at the end of the string
        .replace(/,\s*$/, '');

      // Try parsing the repaired string
      const parsed = JSON.parse(repairedString);
      console.log('JSON repair successful');
      return parsed;
      
    } catch (repairError) {
      console.log('Basic repair failed, attempting advanced repair...', repairError);
      
      try {
        // More aggressive repair attempts
        let advancedRepair = jsonString
          // Remove any non-JSON content before the first {
          .replace(/^[^{]*/, '')
          // Remove any non-JSON content after the last }
          .replace(/[^}]*$/, '')
          // Fix common malformed structures
          .replace(/"\s*:\s*"([^"]*)"([^,}\]]*)/g, '": "$1$2"')
          // Ensure proper array formatting
          .replace(/\[\s*([^[\]]*)\s*\]/g, (match, content) => {
            if (content.trim() === '') return '[]';
            // Split by comma and ensure each item is properly quoted if it's a string
            const items = content.split(',').map((item: string) => {
              const trimmed = item.trim();
              if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
                return trimmed;
              } else if (trimmed.match(/^[0-9]+$/)) {
                return trimmed;
              } else if (trimmed === 'true' || trimmed === 'false' || trimmed === 'null') {
                return trimmed;
              } else {
                return `"${trimmed.replace(/"/g, '\\"')}"`;
              }
            });
            return `[${items.join(', ')}]`;
          });

        const advancedParsed = JSON.parse(advancedRepair);
        console.log('Advanced JSON repair successful');
        return advancedParsed;
        
      } catch (advancedError) {
        console.error('All JSON repair attempts failed');
        console.error('Original error:', error);
        console.error('Repair error:', repairError);
        console.error('Advanced repair error:', advancedError);
        console.error('Original string (first 500 chars):', jsonString.substring(0, 500));
        
        // Return a fallback structure that matches expected course format
        return createFallbackCourse('JSON parsing failed after all repair attempts');
      }
    }
  }
}

function createFallbackCourse(errorMessage: string) {
  return {
    title: "Course Generation Error",
    difficulty: "beginner",
    chapters: [{
      title: "Error Information",
      lessons: [{
        title: "Course Generation Failed",
        content: `There was an error generating the course content: ${errorMessage}. Please try generating the course again with a different prompt or contact support if the issue persists.`,
        quiz: {
          questions: []
        }
      }]
    }]
  };
}

// Additional utility function to validate course structure
export function validateCourseStructure(courseData: any): boolean {
  console.log('Validating course structure:', courseData);
  
  if (!courseData || typeof courseData !== 'object') {
    console.error('Course data is not an object:', typeof courseData);
    return false;
  }
  
  // Check required top-level properties
  if (!courseData.title || !courseData.difficulty || !courseData.chapters) {
    console.error('Missing required top-level properties:', {
      hasTitle: !!courseData.title,
      hasDifficulty: !!courseData.difficulty,
      hasChapters: !!courseData.chapters
    });
    return false;
  }
  
  // Check if chapters is an array
  if (!Array.isArray(courseData.chapters)) {
    console.error('Chapters is not an array:', typeof courseData.chapters);
    return false;
  }
  
  // Validate each chapter
  for (const [index, chapter] of courseData.chapters.entries()) {
    if (!chapter.title || !chapter.lessons || !Array.isArray(chapter.lessons)) {
      console.error(`Chapter ${index} validation failed:`, {
        hasTitle: !!chapter.title,
        hasLessons: !!chapter.lessons,
        lessonsIsArray: Array.isArray(chapter.lessons)
      });
      return false;
    }
    
    // Validate each lesson
    for (const [lessonIndex, lesson] of chapter.lessons.entries()) {
      if (!lesson.title || !lesson.content) {
        console.error(`Lesson ${lessonIndex} in chapter ${index} validation failed:`, {
          hasTitle: !!lesson.title,
          hasContent: !!lesson.content,
          contentLength: lesson.content?.length || 0
        });
        return false;
      }
    }
  }
  
  console.log('Course structure validation passed');
  return true;
}

// Utility to clean and format lesson content
export function formatLessonContent(content: string): string {
  if (!content) {
    console.warn('formatLessonContent called with empty content');
    return 'No content provided for this lesson.';
  }
  
  console.log('Formatting lesson content, original length:', content.length);
  
  // Clean up any malformed content
  const formatted = content
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .trim();
    
  console.log('Formatted lesson content, new length:', formatted.length);
  
  return formatted || 'Content formatting resulted in empty string.';
}


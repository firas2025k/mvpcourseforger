import { NextRequest, NextResponse } from 'next/server';
import { model, generationConfig, safetySettings } from '@/lib/gemini';

// Define an interface for the expected request body
interface GenerateCourseRequestBody {
  prompt: string;
  chapters: number;
  lessons_per_chapter: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Define an interface for the expected JSON output from Gemini (based on course-gen-context.md)
interface QuizQuestion {
  question: string;
  choices: string[];
  answer: string;
}

interface Lesson {
  title: string;
  content: string;
  quiz: {
    questions: QuizQuestion[];
  };
}

interface Chapter {
  title: string;
  lessons: Lesson[];
}

interface CourseStructure {
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  chapters: Chapter[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as GenerateCourseRequestBody;
    const { prompt: userPrompt, chapters, lessons_per_chapter, difficulty } = body;

    if (!userPrompt || !chapters || !lessons_per_chapter || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Construct the prompt for Gemini based on course-gen-context.md
    const geminiPrompt = `
You are an AI course generator.
Based on the following input:

Prompt: ${userPrompt}

Chapters: ${chapters}

Lessons per chapter: ${lessons_per_chapter}

Difficulty: ${difficulty}

Please return a JSON object with the following structure:

{
  "title": "Course Title",
  "difficulty": "${difficulty}",
  "chapters": [
    {
      "title": "Chapter Title",
      "lessons": [
        {
          "title": "Lesson Title",
          "content": "Text content of the lesson...",
          "quiz": {
            "questions": [
              {
                "question": "Question text?",
                "choices": ["A", "B", "C", "D"],
                "answer": "Correct Answer"
              }
            ]
          }
        }
        // ... more lessons based on 'lessons_per_chapter'
      ]
    }
    // ... more chapters based on 'chapters'
  ]
}
Ensure the number of chapters and lessons per chapter matches the input.
Provide detailed content for each lesson and relevant quiz questions.
`;

    const chatSession = model.startChat({
      generationConfig, // Ensure this has responseMimeType: "application/json"
      safetySettings,
      history: [],
    });

    const result = await chatSession.sendMessage(geminiPrompt);
    const responseText = result.response.text();
    
    // Attempt to parse the JSON response from Gemini
    // Gemini might sometimes return plain text even if JSON is requested, or the JSON might be wrapped in markdown ```json ... ```
    let courseData: CourseStructure;
    try {
      // Clean potential markdown code block fences
      const cleanedResponseText = responseText.replace(/^```json\n|\n```$/g, '');
      courseData = JSON.parse(cleanedResponseText) as CourseStructure;
    } catch (parseError) {
      console.error('Error parsing Gemini JSON response:', parseError);
      console.error('Raw Gemini response text:', responseText); // Log the raw response for debugging
      return NextResponse.json({ error: 'Failed to parse course data from AI response. The response was not valid JSON.', rawResponse: responseText }, { status: 500 });
    }

    return NextResponse.json(courseData, { status: 200 });

  } catch (error) {
    console.error('Error in /api/generate-course:', error);
    let errorMessage = 'Failed to generate course content.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

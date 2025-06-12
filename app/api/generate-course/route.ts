import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Added for Supabase SSR client
import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Added for Supabase SSR client and CookieOptions
import { model, generationConfig, safetySettings } from '@/lib/gemini';

// Define an interface for the expected request body
interface GenerateCourseRequestBody {
  prompt: string;
  chapters: number;
  lessons_per_chapter: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Interfaces for AI-generated content structure
interface QuizQuestion {
  question: string;
  choices: string[];
  answer: string;
}

interface AiLesson {
  title: string;
  content: string;
  quiz: {
    questions: QuizQuestion[];
  };
}

interface AiChapter {
  title: string;
  lessons: AiLesson[];
}

// Interface for the direct JSON output expected from Gemini
// Based on the prompt, Gemini is asked to return title, difficulty, and chapters.
interface GeminiJsonOutput {
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced'; // Gemini should echo this back
  chapters: AiChapter[];
}

// Interface for the full payload returned by this API endpoint
// This includes original user inputs and the AI-generated course content.
interface GeneratedCoursePayload {
  originalPrompt: string;
  originalChapterCount: number;
  originalLessonsPerChapter: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced'; // This is the original user input
  aiGeneratedCourse: GeminiJsonOutput; // This is the structured content from Gemini
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookieStore = cookies();
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          const cookieStore = cookies();
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          const cookieStore = cookies();
          cookieStore.set(name, '', options);
        },
      },
    }
  );

  try {
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch user's course limit and current course count
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('course_limit')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile or profile not found:', profileError?.message);
      return NextResponse.json({ error: 'Could not retrieve user profile.' }, { status: 500 });
    }

    let effectiveCourseLimit = profile.course_limit;

    // Backend safeguard for Free Plan: if profile.course_limit is < 1, enforce a minimum of 1.
    // This assumes a user with profile.course_limit < 1 and no active paid subscription is on a Free tier that should get 1 course.
    // A more robust check might involve verifying no active paid subscription exists.
    if (effectiveCourseLimit < 1) {
      // TODO: Add a check here to confirm the user doesn't have an active paid subscription 
      // if you have plans where course_limit could legitimately be 0.
      // For now, we assume course_limit < 1 implies a Free tier needing this override.
      console.warn(`User ${user.id} has profile.course_limit: ${profile.course_limit} in DB. API applying effective limit of 1 for Free Plan check.`);
      effectiveCourseLimit = 1;
    }

    const { count: courseCount, error: countError } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      console.error('Error fetching course count:', countError.message);
      return NextResponse.json({ error: 'Could not retrieve course count.' }, { status: 500 });
    }

    // 3. Check limit against effectiveCourseLimit
    if (courseCount !== null && courseCount >= effectiveCourseLimit) {
      return NextResponse.json({ error: 'Course limit reached. Please upgrade your plan to create more courses.' }, { status: 403 });
    }

    // 4. Proceed with course generation if limit not reached
    const body = await request.json() as GenerateCourseRequestBody;
    const { prompt: userPrompt, chapters, lessons_per_chapter, difficulty } = body;

    if (!userPrompt || !chapters || !lessons_per_chapter || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Construct the prompt for Gemini based on course-gen-context.md
    const geminiPrompt = `
You are an AI course generator. Based on the input:

Prompt: ${userPrompt}
Chapters: ${chapters}
Lessons per chapter: ${lessons_per_chapter}
Difficulty: ${difficulty}

Return a JSON object with this structure:

{
  "title": "Course Title",
  "difficulty": "${difficulty}",
  "chapters": [
    {
      "title": "Chapter Title",
      "lessons": [
        {
          "title": "Lesson Title",
          "content": "Lesson content (2-3 paragraphs)...",
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
      ]
    }
  ]
}

Ensure:
- Exactly ${chapters} chapters and ${lessons_per_chapter} lessons per chapter.
- Lesson content is 2-3 paragraphs, suitable for ${difficulty} level.
- At least 1 quiz question per lesson with 4 choices.
- All strings are valid JSON (escape newlines as "\\n", quotes as "\\"", etc.).
- Output ONLY valid JSON, no markdown, comments, or extra text.
- Do not wrap output in quotes or backticks.
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
    
    let responsePayload: GeneratedCoursePayload;
    try {
      // Clean potential markdown code block fences
      const cleanedResponseText = responseText.replace(/^```json\n|\n```$/g, '');
      const aiGeneratedOutput = JSON.parse(cleanedResponseText) as GeminiJsonOutput;

      // Construct the final payload to return to the client
      responsePayload = {
        originalPrompt: userPrompt,
        originalChapterCount: chapters,
        originalLessonsPerChapter: lessons_per_chapter,
        difficulty: difficulty, // The original difficulty submitted by the user
        aiGeneratedCourse: aiGeneratedOutput // The full structure returned by Gemini
      };
      return NextResponse.json(responsePayload, { status: 200 }); // Return on success
    } catch (parseError) {
      console.error('Error parsing Gemini JSON response:', parseError);
      console.error('Raw Gemini response text:', responseText); // Log the raw response for debugging
      return NextResponse.json({ error: 'Failed to parse course data from AI response. The response was not valid JSON.', rawResponse: responseText }, { status: 500 });
    }
    // If execution reaches here, it means an error occurred before or after parsing, handled by the outer catch.

  } catch (error) {
    console.error('Error in /api/generate-course:', error);
    let errorMessage = 'Failed to generate course content.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

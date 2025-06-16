import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { model, generationConfig, safetySettings } from '@/lib/gemini';

// ----- INTERFACES -----

interface GenerateCourseRequestBody {
  prompt: string;
  chapters: number;
  lessons_per_chapter: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface AiLesson {
  title: string;
  content: string;
  quiz: {
    questions: {
      question: string;
      choices: string[];
      answer: string;
    }[];
  };
}

interface AiChapter {
  title:string;
  lessons: AiLesson[];
}

interface CourseOutline {
    courseTitle: string;
    chapters: {
        chapterTitle: string;
        lessonTitles: string[];
    }[];
}

interface LessonContent {
    content: string;
    quiz: {
        questions: {
            question: string;
            choices: string[];
            answer: string;
        }[];
    };
}


export async function POST(request: NextRequest) {
  // CORRECTED: Supabase client initialization for Route Handlers
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );

  try {
    // 1. Authenticate user & check course limits
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: User not authenticated.' }, { status: 401 });
    }
    
    // User and course limit checks
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
     if (effectiveCourseLimit < 1) {
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

    if (courseCount !== null && courseCount >= effectiveCourseLimit) {
      return NextResponse.json({ error: 'Course limit reached. Please upgrade your plan to create more courses.' }, { status: 403 });
    }


    const body = await request.json() as GenerateCourseRequestBody;
    const { prompt: userPrompt, chapters, lessons_per_chapter, difficulty } = body;

    if (!userPrompt || !chapters || !lessons_per_chapter || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // STAGE 1 - GENERATE COURSE OUTLINE
    const outlinePrompt = `
      You are an AI course planner. Based on the user's request, generate a course outline.
      User Request: "${userPrompt}", Difficulty: ${difficulty}
      Generate a JSON object with a course title, and exactly ${chapters} chapter titles.
      For each chapter, generate exactly ${lessons_per_chapter} unique and compelling lesson titles.
      Return ONLY a valid JSON object with this structure:
      { "courseTitle": "...", "chapters": [ { "chapterTitle": "...", "lessonTitles": ["...", "..."] } ] }
    `;

    const chatSession = model.startChat({ generationConfig, safetySettings });
    const outlineResult = await chatSession.sendMessage(outlinePrompt);
    const outlineText = outlineResult.response.text().replace(/^```json\n|\n```$/g, '');
    let courseOutline: CourseOutline;

    try {
        courseOutline = JSON.parse(outlineText);
    } catch (e) {
        console.error("Failed to parse course outline JSON:", e);
        console.error("Raw outline response from Gemini:", outlineText);
        return NextResponse.json({ error: "Failed to generate a valid course outline from AI." }, { status: 500 });
    }


    // STAGE 2 - GENERATE CONTENT FOR EACH LESSON (SEQUENTIALLY TO AVOID RATE LIMITS)
    const finalChapters: AiChapter[] = [];

    for (const chapterOutline of courseOutline.chapters) {
        const generatedLessons: AiLesson[] = [];
        // Using a for...of loop to process lessons one by one
        for (const lessonTitle of chapterOutline.lessonTitles) {
            const lessonPrompt = `
                You are an AI educator creating content for a single lesson.
                Course Topic: "${userPrompt}", Chapter: "${chapterOutline.chapterTitle}", Lesson: "${lessonTitle}", Difficulty: ${difficulty}.
                Generate a JSON object with this structure: { "content": "...", "quiz": { "questions": [ { "question": "...", "choices": ["...", "...", "...", "..."], "answer": "..." } ] } }
                Instructions:
                - The "content" must be detailed, 5-7 paragraphs long, and tailored for a ${difficulty} audience.
                - The "quiz" must have at least one question with 4 choices.
                - Output only the valid JSON object.
            `;
            
            // A small delay to be extra safe with rate limits. 1.5 seconds between requests.
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const lessonChat = model.startChat({ generationConfig, safetySettings });
            const result = await lessonChat.sendMessage(lessonPrompt);
            const lessonText = result.response.text()
            
            try {
              // --- START OF SANITIZED LESSON TEXT PARSING ---
              const sanitizedLessonText = lessonText
                  .replace(/^```json\n|\n```$/g, '') // Remove code block markers
                  .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
                  .replace(/\n/g, '\\n') // Escape newlines
                  .replace(/\t/g, '\\t'); // Escape tabs
              const lessonContent: LessonContent = JSON.parse(sanitizedLessonText);
              generatedLessons.push({ title: lessonTitle, ...lessonContent });
              // --- END OF SANITIZED LESSON TEXT PARSING ---
          } catch (error) {
              console.error(`Failed to parse content for lesson: "${lessonTitle}"`, error);
              console.error(`Raw lesson text: ${lessonText}`); // Log raw response for debugging
              generatedLessons.push({ title: lessonTitle, content: "Error: Failed to generate content for this lesson.", quiz: { questions: [] } });
          }
        }
        finalChapters.push({ title: chapterOutline.chapterTitle, lessons: generatedLessons });
    }

    // ASSEMBLE FINAL PAYLOAD
    const finalPayload = {
        originalPrompt: userPrompt,
        originalChapterCount: chapters,
        originalLessonsPerChapter: lessons_per_chapter,
        difficulty: difficulty,
        aiGeneratedCourse: { title: courseOutline.courseTitle, difficulty: difficulty, chapters: finalChapters }
    };
    
    return NextResponse.json(finalPayload, { status: 200 });

  } catch (error) {
    console.error('Error in /api/generate-course:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to generate course content: ${errorMessage}` }, { status: 500 });
  }
}

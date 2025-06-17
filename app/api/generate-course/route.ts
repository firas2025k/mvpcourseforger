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
  title: string;
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
          } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {}
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

    // Fetch user profile and plan details
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('course_limit')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError?.message);
      return NextResponse.json({ error: 'Could not retrieve user profile.' }, { status: 500 });
    }

    // Fetch plan details for max chapters and lessons
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (subscriptionError || !subscription) {
      console.error('Error fetching subscription:', subscriptionError?.message);
      return NextResponse.json({ error: 'Could not retrieve user subscription.' }, { status: 500 });
    }

    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('course_limit, max_chapters, max_lessons_per_chapter')
      .eq('id', subscription.plan_id)
      .single();

    if (planError || !plan) {
      console.error('Error fetching plan:', planError?.message);
      return NextResponse.json({ error: 'Could not retrieve plan details.' }, { status: 500 });
    }

    let effectiveCourseLimit = plan.course_limit;
    if (effectiveCourseLimit < 1) {
      console.warn(`User ${user.id} has course_limit: ${plan.course_limit}. Applying effective limit of 1.`);
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
      return NextResponse.json({ error: 'Course limit reached. Please upgrade your plan.' }, { status: 403 });
    }

    const body = await request.json() as GenerateCourseRequestBody;
    const { prompt: userPrompt, chapters, lessons_per_chapter, difficulty } = body;

    if (!userPrompt || !chapters || !lessons_per_chapter || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check plan-based chapter and lesson limits
    if (chapters > plan.max_chapters) {
      return NextResponse.json(
        { error: `Requested chapters (${chapters}) exceed plan limit (${plan.max_chapters}).` },
        { status: 403 }
      );
    }
    if (lessons_per_chapter > plan.max_lessons_per_chapter) {
      return NextResponse.json(
        { error: `Requested lessons per chapter (${lessons_per_chapter}) exceed plan limit (${plan.max_lessons_per_chapter}).` },
        { status: 403 }
      );
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

    // STAGE 2 - GENERATE CONTENT FOR EACH LESSON
    const finalChapters: AiChapter[] = [];

    for (const chapterOutline of courseOutline.chapters) {
      const generatedLessons: AiLesson[] = [];
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
        await new Promise(resolve => setTimeout(resolve, 1500));
        const lessonChat = model.startChat({ generationConfig, safetySettings });
        const result = await lessonChat.sendMessage(lessonPrompt);
        const lessonText = result.response.text();

        try {
          const sanitizedLessonText = lessonText
            .replace(/^```json\n|\n```$/g, '')
            .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t');
          const lessonContent: LessonContent = JSON.parse(sanitizedLessonText);
          generatedLessons.push({ title: lessonTitle, ...lessonContent });
        } catch (error) {
          console.error(`Failed to parse content for lesson: "${lessonTitle}"`, error);
          console.error(`Raw lesson text: ${lessonText}`);
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
// app/api/generate-course/route.ts
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

interface UserPlanLimits {
  max_chapters: number;
  max_lessons_per_chapter: number;
}

// ----- PLAN LIMIT FUNCTIONS -----

/**
 * Fetches the user's plan limits from the database
 * @param supabase Supabase client
 * @param userId User ID
 * @returns Promise<UserPlanLimits | null> User's plan limits or null if not found
 */
async function getUserPlanLimits(supabase: any, userId: string): Promise<UserPlanLimits | null> {
  try {
    // First, get the user's active subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select(`
        plan_id,
        plans!inner (
          max_chapters,
          max_lessons_per_chapter
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (subscriptionError || !subscription) {
      console.log('No active subscription found for user:', userId);
      // Return default limits for users without active subscription
      return {
        max_chapters: 3,
        max_lessons_per_chapter: 3
      };
    }

    return {
      max_chapters: subscription.plans.max_chapters,
      max_lessons_per_chapter: subscription.plans.max_lessons_per_chapter
    };
  } catch (error) {
    console.error('Error fetching user plan limits:', error);
    // Return default limits on error
    return {
      max_chapters: 3,
      max_lessons_per_chapter: 3
    };
  }
}

// ----- CREDIT CALCULATION FUNCTIONS -----

/**
 * Calculates the credit cost for generating a course based on chapters and lessons
 * @param chapters Number of chapters
 * @param lessonsPerChapter Number of lessons per chapter
 * @returns Credit cost for the course generation
 */
function calculateCourseCreditCost(chapters: number, lessonsPerChapter: number): number {
  const lessonCost = chapters * lessonsPerChapter; // 1 credit per lesson
  const chapterCost = chapters; // 1 credit per chapter
  const totalCost = lessonCost + chapterCost;
  return Math.max(totalCost, 3); // Minimum cost of 3 credits
}

/**
 * Deducts credits from user's balance and records the transaction
 * @param supabase Supabase client
 * @param userId User ID
 * @param creditCost Number of credits to deduct
 * @param relatedEntityId Course ID or placeholder for transaction reference
 * @param description Transaction description
 * @returns Promise<boolean> Success status
 */
async function deductCreditsAndRecordTransaction(
  supabase: any,
  userId: string,
  creditCost: number,
  relatedEntityId: string,
  description: string
): Promise<boolean> {
  try {
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (fetchError || !profile) {
      console.error('Error fetching user profile for credit deduction:', fetchError);
      return false;
    }

    const currentCredits = profile.credits || 0;
    const newBalance = currentCredits - creditCost;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: newBalance })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating credit balance:', updateError);
      return false;
    }

    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        type: 'consumption',
        amount: -creditCost,
        related_entity_id: relatedEntityId,
        description: description,
      });

    if (transactionError) {
      console.error('Error recording credit transaction:', transactionError);
    }

    console.log(`Successfully deducted ${creditCost} credits from user ${userId}. New balance: ${newBalance}`);
    return true;
  } catch (error) {
    console.error('Error in credit deduction process:', error);
    return false;
  }
}

/**
 * Robust JSON parser that handles various edge cases from AI responses
 * @param text Raw text from AI response
 * @param context Context for error logging
 * @returns Parsed JSON object or null if parsing fails
 */
function parseAIResponse(text: string, context: string): any {
  try {
    let cleanText = text.replace(/^```json\s*\n?|\n?```\s*$/g, '').trim();
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
    }
    console.log(`Attempting to parse ${context}:`, cleanText.substring(0, 200) + '...');
    return JSON.parse(cleanText);
  } catch (error) {
    console.error(`Failed to parse ${context}:`, error);
    console.error(`Raw text (first 500 chars):`, text.substring(0, 500));
    return null;
  }
}

/**
 * Makes a Gemini API call with retry logic for 503 errors
 * @param prompt The prompt to send to Gemini
 * @param context Context for logging
 * @param maxRetries Maximum number of retries
 * @returns Promise<string> The response text
 */
async function makeGeminiAPICall(prompt: string, context: string, maxRetries: number = 3): Promise<string> {
  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`${context} - Attempt ${attempt}/${maxRetries}`);
      const chatSession = model.startChat({ generationConfig, safetySettings });
      const result = await chatSession.sendMessage(prompt);
      const responseText = result.response.text();
      console.log(`${context} - Success on attempt ${attempt}`);
      return responseText;
    } catch (error: any) {
      lastError = error;
      console.error(`${context} - Attempt ${attempt} failed:`, error.message);
      if (error.message && error.message.includes('503')) {
        console.log(`${context} - 503 error detected, retrying in ${attempt * 2} seconds...`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          continue;
        }
      }
      break;
    }
  }
  throw new Error(`${context} failed after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`);
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
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: User not authenticated.' }, { status: 401 });
    }

    // 2. Parse and validate request body
    const body = await request.json() as GenerateCourseRequestBody;
    const { prompt: userPrompt, chapters, lessons_per_chapter, difficulty } = body;

    if (!userPrompt || !chapters || !lessons_per_chapter || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. Get user's plan limits
    const planLimits = await getUserPlanLimits(supabase, user.id);
    if (!planLimits) {
      return NextResponse.json({ error: 'Could not retrieve user plan limits.' }, { status: 500 });
    }

    // 4. Validate input ranges against user's plan limits
    if (chapters < 1 || chapters > planLimits.max_chapters) {
      return NextResponse.json({ 
        error: `Invalid number of chapters. Your plan allows 1-${planLimits.max_chapters} chapters.`,
        max_chapters: planLimits.max_chapters
      }, { status: 400 });
    }

    if (lessons_per_chapter < 1 || lessons_per_chapter > planLimits.max_lessons_per_chapter) {
      return NextResponse.json({ 
        error: `Invalid number of lessons per chapter. Your plan allows 1-${planLimits.max_lessons_per_chapter} lessons per chapter.`,
        max_lessons_per_chapter: planLimits.max_lessons_per_chapter
      }, { status: 400 });
    }

    // 5. Calculate credit cost
    const creditCost = calculateCourseCreditCost(chapters, lessons_per_chapter);

    // 6. Check user's credit balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError?.message);
      return NextResponse.json({ error: 'Could not retrieve user profile.' }, { status: 500 });
    }

    const currentCredits = profile.credits || 0;

    if (currentCredits < creditCost) {
      return NextResponse.json({ 
        error: `Insufficient credits. This course requires ${creditCost} credits, but you have ${currentCredits} credits available. Please purchase more credits to continue.`,
        required_credits: creditCost,
        available_credits: currentCredits
      }, { status: 402 });
    }

    // 7. Deduct credits BEFORE generation
    const creditDeductionSuccess = await deductCreditsAndRecordTransaction(
      supabase,
      user.id,
      creditCost,
      'pending',
      `Course generation: ${userPrompt} (${chapters} chapters, ${lessons_per_chapter} lessons each)`
    );

    if (!creditDeductionSuccess) {
      return NextResponse.json({ error: 'Failed to process credit payment.' }, { status: 500 });
    }

    try {
      // 8. Generate course outline
      const outlinePrompt = `
        You are an AI course planner. Based on the user's request, generate a course outline.
        User Request: "${userPrompt}", Difficulty: ${difficulty}
        Generate a JSON object with a course title, and exactly ${chapters} chapter titles.
        For each chapter, generate exactly ${lessons_per_chapter} unique and compelling lesson titles.
        
        IMPORTANT: Return ONLY a valid JSON object with this exact structure:
        {
          "courseTitle": "Course Title Here",
          "chapters": [
            {
              "chapterTitle": "Chapter 1 Title",
              "lessonTitles": ["Lesson 1", "Lesson 2", "Lesson 3"]
            }
          ]
        }
      `;

      const outlineText = await makeGeminiAPICall(outlinePrompt, 'Course outline generation');
      const courseOutline = parseAIResponse(outlineText, 'course outline');

      if (!courseOutline || !courseOutline.courseTitle || !courseOutline.chapters) {
        throw new Error("Failed to generate a valid course outline from AI.");
      }

      // 9. Generate lesson content
      const finalChapters: AiChapter[] = [];

      for (let chapterIndex = 0; chapterIndex < courseOutline.chapters.length; chapterIndex++) {
        const chapterOutline = courseOutline.chapters[chapterIndex];
        const generatedLessons: AiLesson[] = [];

        for (let lessonIndex = 0; lessonIndex < chapterOutline.lessonTitles.length; lessonIndex++) {
          const lessonTitle = chapterOutline.lessonTitles[lessonIndex];
          const lessonPrompt = `
            You are an AI educator creating content for a single lesson.
            Course Topic: "${userPrompt}"
            Chapter: "${chapterOutline.chapterTitle}"
            Lesson: "${lessonTitle}"
            Difficulty: ${difficulty}
            
            Generate detailed lesson content with a quiz. Return ONLY a valid JSON object with this exact structure:
            {
              "content": "Detailed lesson content here (5-7 paragraphs for ${difficulty} level)",
              "quiz": {
                "questions": [
                  {
                    "question": "Question text here?",
                    "choices": ["Option A", "Option B", "Option C", "Option D"],
                    "answer": "Correct option text"
                  }
                ]
              }
            }
          `;

          if (lessonIndex > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

          try {
            const lessonText = await makeGeminiAPICall(lessonPrompt, `Lesson "${lessonTitle}"`);
            const lessonContent = parseAIResponse(lessonText, `lesson "${lessonTitle}"`);

            if (lessonContent && lessonContent.content) {
              generatedLessons.push({ 
                title: lessonTitle, 
                content: lessonContent.content,
                quiz: lessonContent.quiz || { questions: [] }
              });
            } else {
              generatedLessons.push({ 
                title: lessonTitle, 
                content: `This lesson covers ${lessonTitle} in the context of ${chapterOutline.chapterTitle}.`,
                quiz: { questions: [] }
              });
            }
          } catch (lessonError) {
            generatedLessons.push({ 
              title: lessonTitle, 
              content: `This lesson covers ${lessonTitle} in the context of ${chapterOutline.chapterTitle}.`,
              quiz: { questions: [] }
            });
          }
        }
        finalChapters.push({ title: chapterOutline.chapterTitle, lessons: generatedLessons });
      }

      // 10. Return course data for preview - including plan limits for frontend
      return NextResponse.json({
        success: true,
        courseId: null,
        courseTitle: courseOutline.courseTitle,
        creditCost: creditCost,
        chaptersGenerated: finalChapters.length,
        lessonsGenerated: finalChapters.reduce((total, chapter) => total + chapter.lessons.length, 0),
        redirectUrl: `/dashboard/courses/preview`,
        aiGeneratedCourse: {
          title: courseOutline.courseTitle,
          difficulty: difficulty,
          chapters: finalChapters,
        },
        originalPrompt: userPrompt,
        originalChapterCount: chapters,
        originalLessonsPerChapter: lessons_per_chapter,
        planLimits: planLimits, // Include plan limits in response
      }, { status: 200 });

    } catch (generationError) {
      // Refund credits
      const refundSuccess = await deductCreditsAndRecordTransaction(
        supabase,
        user.id,
        -creditCost,
        'failed',
        `Refund for failed course generation: ${userPrompt}`
      );

      if (refundSuccess) {
        console.log(`Refunded ${creditCost} credits to user ${user.id}`);
      }

      return NextResponse.json({ 
        error: `Failed to generate course content: ${generationError instanceof Error ? generationError.message : 'Unknown error'}. Your credits have been refunded.` 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in /api/generate-course:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to generate course content: ${errorMessage}` }, { status: 500 });
  }
}

// NEW ENDPOINT: Get user plan limits
export async function GET(request: NextRequest) {
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
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: User not authenticated.' }, { status: 401 });
    }

    // Get user's plan limits
    const planLimits = await getUserPlanLimits(supabase, user.id);
    if (!planLimits) {
      return NextResponse.json({ error: 'Could not retrieve user plan limits.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      planLimits: planLimits
    }, { status: 200 });

  } catch (error) {
    console.error('Error in GET /api/generate-course:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to retrieve plan limits: ${errorMessage}` }, { status: 500 });
  }
}


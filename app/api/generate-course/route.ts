import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import {
  makeMultiModelAPICall,
  parseMultiModelAIResponse,
} from "@/lib/multi-model";

// ----- INTERFACES -----

interface GenerateCourseRequestBody {
  prompt: string;
  chapters: number;
  lessons_per_chapter: number;
  difficulty: "beginner" | "intermediate" | "advanced";
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
async function getUserPlanLimits(
  supabase: any,
  userId: string
): Promise<UserPlanLimits | null> {
  try {
    // First, get the user's active subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select(
        `
        plan_id,
        plans!inner (
          max_chapters,
          max_lessons_per_chapter
        )
      `
      )
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (subscriptionError || !subscription) {
      console.log("No active subscription found for user:", userId);
      // Return default limits for users without active subscription
      return {
        max_chapters: 3,
        max_lessons_per_chapter: 3,
      };
    }

    return {
      max_chapters: subscription.plans.max_chapters,
      max_lessons_per_chapter: subscription.plans.max_lessons_per_chapter,
    };
  } catch (error) {
    console.error("Error fetching user plan limits:", error);
    // Return default limits on error
    return {
      max_chapters: 3,
      max_lessons_per_chapter: 3,
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
function calculateCourseCreditCost(
  chapters: number,
  lessonsPerChapter: number
): number {
  const lessonCost = lessonsPerChapter * chapters * 3; // 3 credits per lesson
  const chapterCost = chapters * 5; // 5 credits per chapter
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
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single();

    if (fetchError || !profile) {
      console.error(
        "Error fetching user profile for credit deduction:",
        fetchError
      );
      return false;
    }

    const currentCredits = profile.credits || 0;
    const newBalance = currentCredits - creditCost;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ credits: newBalance })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating credit balance:", updateError);
      return false;
    }

    const { error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: userId,
        type: "consumption",
        amount: -creditCost,
        related_entity_id: relatedEntityId,
        description: description,
      });

    if (transactionError) {
      console.error("Error recording credit transaction:", transactionError);
    }

    console.log(
      `Successfully deducted ${creditCost} credits from user ${userId}. New balance: ${newBalance}`
    );
    return true;
  } catch (error) {
    console.error("Error in credit deduction process:", error);
    return false;
  }
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
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {}
        },
      },
    }
  );

  try {
    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized: User not authenticated." },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = (await request.json()) as GenerateCourseRequestBody;
    const {
      prompt: userPrompt,
      chapters,
      lessons_per_chapter,
      difficulty,
    } = body;

    if (!userPrompt || !chapters || !lessons_per_chapter || !difficulty) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 3. Get user's plan limits
    const planLimits = await getUserPlanLimits(supabase, user.id);
    if (!planLimits) {
      return NextResponse.json(
        { error: "Could not retrieve user plan limits." },
        { status: 500 }
      );
    }

    // 4. Validate input ranges against user's plan limits
    if (chapters < 1 || chapters > planLimits.max_chapters) {
      return NextResponse.json(
        {
          error: `Invalid number of chapters. Your plan allows 1-${planLimits.max_chapters} chapters.`,
          max_chapters: planLimits.max_chapters,
        },
        { status: 400 }
      );
    }

    if (
      lessons_per_chapter < 1 ||
      lessons_per_chapter > planLimits.max_lessons_per_chapter
    ) {
      return NextResponse.json(
        {
          error: `Invalid number of lessons per chapter. Your plan allows 1-${planLimits.max_lessons_per_chapter} lessons per chapter.`,
          max_lessons_per_chapter: planLimits.max_lessons_per_chapter,
        },
        { status: 400 }
      );
    }

    // 5. Calculate credit cost
    const creditCost = calculateCourseCreditCost(chapters, lessons_per_chapter);

    // 6. Check user's credit balance
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError?.message);
      return NextResponse.json(
        { error: "Could not retrieve user profile." },
        { status: 500 }
      );
    }

    const currentCredits = profile.credits || 0;

    if (currentCredits < creditCost) {
      return NextResponse.json(
        {
          error: `Insufficient credits. This course requires ${creditCost} credits, but you have ${currentCredits} credits available. Please purchase more credits to continue.`,
          required_credits: creditCost,
          available_credits: currentCredits,
        },
        { status: 402 }
      );
    }

    // 7. Deduct credits BEFORE generation
    const creditDeductionSuccess = await deductCreditsAndRecordTransaction(
      supabase,
      user.id,
      creditCost,
      "pending",
      `Course generation: ${userPrompt} (${chapters} chapters, ${lessons_per_chapter} lessons each)`
    );

    if (!creditDeductionSuccess) {
      return NextResponse.json(
        { error: "Failed to process credit payment." },
        { status: 500 }
      );
    }

    let modelUsageStats = {
      gemini_calls: 0,
      mistral_calls: 0,
      total_calls: 0,
    };

    try {
      // 8. Generate course outline using multi-model approach
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

      const outlineResult = await makeMultiModelAPICall(
        outlinePrompt,
        "Course outline generation"
      );
      modelUsageStats.total_calls++;
      if (outlineResult.modelUsed === "gemini") {
        modelUsageStats.gemini_calls++;
      } else {
        modelUsageStats.mistral_calls++;
      }

      const courseOutline = parseMultiModelAIResponse(
        outlineResult.response,
        "course outline",
        outlineResult.modelUsed
      );

      if (
        !courseOutline ||
        !courseOutline.courseTitle ||
        !courseOutline.chapters
      ) {
        throw new Error("Failed to generate a valid course outline from AI.");
      }

      // 9. Generate lesson content using multi-model approach
      const finalChapters: AiChapter[] = [];

      for (
        let chapterIndex = 0;
        chapterIndex < courseOutline.chapters.length;
        chapterIndex++
      ) {
        const chapterOutline = courseOutline.chapters[chapterIndex];
        const generatedLessons: AiLesson[] = [];

        for (
          let lessonIndex = 0;
          lessonIndex < chapterOutline.lessonTitles.length;
          lessonIndex++
        ) {
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
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }

          try {
            const lessonResult = await makeMultiModelAPICall(
              lessonPrompt,
              `Lesson "${lessonTitle}"`
            );
            modelUsageStats.total_calls++;
            if (lessonResult.modelUsed === "gemini") {
              modelUsageStats.gemini_calls++;
            } else {
              modelUsageStats.mistral_calls++;
            }

            const lessonContent = parseMultiModelAIResponse(
              lessonResult.response,
              `lesson "${lessonTitle}"`,
              lessonResult.modelUsed
            );

            if (lessonContent && lessonContent.content) {
              generatedLessons.push({
                title: lessonTitle,
                content: lessonContent.content,
                quiz: lessonContent.quiz || { questions: [] },
              });
            } else {
              generatedLessons.push({
                title: lessonTitle,
                content: `This lesson covers ${lessonTitle} in the context of ${chapterOutline.chapterTitle}.`,
                quiz: { questions: [] },
              });
            }
          } catch (lessonError) {
            console.warn(
              `Failed to generate lesson "${lessonTitle}":`,
              lessonError
            );
            generatedLessons.push({
              title: lessonTitle,
              content: `This lesson covers ${lessonTitle} in the context of ${chapterOutline.chapterTitle}.`,
              quiz: { questions: [] },
            });
          }
        }
        finalChapters.push({
          title: chapterOutline.chapterTitle,
          lessons: generatedLessons,
        });
      }

      // 10. Return course data for preview - including plan limits and model usage stats
      console.log(
        `Course generation completed. Model usage: Gemini: ${modelUsageStats.gemini_calls}, Mistral: ${modelUsageStats.mistral_calls}, Total: ${modelUsageStats.total_calls}`
      );

      return NextResponse.json(
        {
          success: true,
          courseId: null,
          courseTitle: courseOutline.courseTitle,
          creditCost: creditCost,
          chaptersGenerated: finalChapters.length,
          lessonsGenerated: finalChapters.reduce(
            (total, chapter) => total + chapter.lessons.length,
            0
          ),
          redirectUrl: `/dashboard/courses/preview`,
          aiGeneratedCourse: {
            title: courseOutline.courseTitle,
            difficulty: difficulty,
            chapters: finalChapters,
          },
          originalPrompt: userPrompt,
          originalChapterCount: chapters,
          originalLessonsPerChapter: lessons_per_chapter,
          planLimits: planLimits,
          modelUsage: modelUsageStats, // Include model usage statistics
        },
        { status: 200 }
      );
    } catch (generationError) {
      // Refund credits
      const refundSuccess = await deductCreditsAndRecordTransaction(
        supabase,
        user.id,
        -creditCost,
        "failed",
        `Refund for failed course generation: ${userPrompt}`
      );

      if (refundSuccess) {
        console.log(`Refunded ${creditCost} credits to user ${user.id}`);
      }

      console.error(
        "Course generation failed with model usage stats:",
        modelUsageStats
      );

      return NextResponse.json(
        {
          error: `Failed to generate course content: ${
            generationError instanceof Error
              ? generationError.message
              : "Unknown error"
          }. Your credits have been refunded.`,
          modelUsage: modelUsageStats,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in /api/generate-course:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: `Failed to generate course content: ${errorMessage}` },
      { status: 500 }
    );
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
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {}
        },
      },
    }
  );

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized: User not authenticated." },
        { status: 401 }
      );
    }

    const planLimits = await getUserPlanLimits(supabase, user.id);
    if (!planLimits) {
      return NextResponse.json(
        { error: "Could not retrieve user plan limits." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        planLimits: planLimits,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/generate-course:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: `Failed to retrieve plan limits: ${errorMessage}` },
      { status: 500 }
    );
  }
}

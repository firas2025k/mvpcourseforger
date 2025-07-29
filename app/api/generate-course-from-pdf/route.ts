import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { model, generationConfig, safetySettings } from "@/lib/gemini";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

// Langchain imports
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents"; // Import Document type

// ----- INTERFACES -----

interface GenerateCourseFromPdfRequestBody {
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

interface ExtractedContent {
  text: string;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    pageCount: number;
  };
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

  let tempFilePath: string | null = null;

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

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const chapters = parseInt(formData.get("chapters") as string);
    const lessons_per_chapter = parseInt(
      formData.get("lessons_per_chapter") as string
    );
    const difficulty = formData.get("difficulty") as
      | "beginner"
      | "intermediate"
      | "advanced";

    if (!file || !chapters || !lessons_per_chapter || !difficulty) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF file." },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Please upload a PDF smaller than 10MB." },
        { status: 400 }
      );
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
      `Course generation from PDF: ${file.name} (${chapters} chapters, ${lessons_per_chapter} lessons each)`
    );

    if (!creditDeductionSuccess) {
      return NextResponse.json({ error: 'Failed to process credit payment.' }, { status: 500 });
    }

    // 8. Save uploaded file temporarily
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${randomUUID()}.pdf`;
    tempFilePath = join(tmpdir(), filename);
    await writeFile(tempFilePath, buffer);

    // 9. Extract content from PDF using Langchain
    let extractedContent: ExtractedContent;
    try {
      const loader = new PDFLoader(tempFilePath, {
        splitPages: false, // We want the full document content
      });

      const docs = await loader.load();

      if (!docs || docs.length === 0) {
        throw new Error("No content could be extracted from the PDF");
      }

      // Combine all pages into a single text
      const fullText = docs
        .map((doc: Document) => doc.pageContent)
        .join("\n\n");

      // Get metadata from the first document
      const metadata = docs[0].metadata || {};

      extractedContent = {
        text: fullText,
        metadata: {
          title: metadata.title || file.name.replace(".pdf", ""),
          author: metadata.author,
          subject: metadata.subject,
          pageCount: docs.length,
        },
      };

      // Clean and process the text
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 4000,
        chunkOverlap: 200,
      });

      const chunks = await textSplitter.splitText(extractedContent.text);

      // For course generation, we'll use the first few chunks or a summary
      // to avoid token limits while maintaining context
      const contentForGeneration = chunks.slice(0, 3).join("\n\n");
      extractedContent.text = contentForGeneration;
    } catch (error) {
      console.error("Error extracting PDF content:", error);
      // Refund credits if PDF extraction fails
      await deductCreditsAndRecordTransaction(
        supabase,
        user.id,
        -creditCost,
        'failed',
        `Refund for failed PDF course generation: ${file.name}`
      );
      return NextResponse.json(
        {
          error:
            "Failed to extract content from PDF. Please ensure the PDF contains readable text. Your credits have been refunded.",
        },
        { status: 400 }
      );
    }

    // 10. Generate course title and outline based on PDF content
    const outlinePrompt = `
      You are an AI course planner. Based on the extracted content from a PDF document, generate a course outline.\n      \n      Document Title: "${extractedContent.metadata.title}"\n      Document Content Preview: "${extractedContent.text.substring(
      0,
      2000
    )}..."\n      \n      Requested Parameters:\n      - Chapters: ${chapters}\n      - Lessons per chapter: ${lessons_per_chapter}\n      - Difficulty: ${difficulty}\n      \n      Generate a JSON object with a course title based on the document content, and exactly ${chapters} chapter titles.\n      For each chapter, generate exactly ${lessons_per_chapter} unique and compelling lesson titles that reflect the document's content.\n      \n      Return ONLY a valid JSON object with this structure:\n      { "courseTitle": "...", "chapters": [ { "chapterTitle": "...", "lessonTitles": ["...", "..."] } ] }\n    `;

    const chatSession = model.startChat({ generationConfig, safetySettings });
    let outlineText: string;
    try {
      const outlineResult = await chatSession.sendMessage(outlinePrompt);
      outlineText = outlineResult.response
        .text()
        .replace(/^```json\n|\n```$/g, "");
    } catch (geminiError) {
      console.error("Gemini API error during outline generation:", geminiError);
      // Refund credits if Gemini API call fails
      await deductCreditsAndRecordTransaction(
        supabase,
        user.id,
        -creditCost,
        'failed',
        `Refund for failed PDF course generation (outline): ${file.name}`
      );
      return NextResponse.json(
        { error: "Failed to generate course outline. Your credits have been refunded." },
        { status: 500 }
      );
    }

    let courseOutline: CourseOutline;

    try {
      courseOutline = JSON.parse(outlineText);
    } catch (e) {
      console.error("Failed to parse course outline JSON:", e);
      console.error("Raw outline response from Gemini:", outlineText);
      // Refund credits if JSON parsing fails
      await deductCreditsAndRecordTransaction(
        supabase,
        user.id,
        -creditCost,
        'failed',
        `Refund for failed PDF course generation (parse outline): ${file.name}`
      );
      return NextResponse.json(
        {
          error: "Failed to generate a valid course outline from PDF content. Your credits have been refunded.",
        },
        { status: 500 }
      );
    }

    // 11. Generate content for each lesson based on PDF content
    const finalChapters: AiChapter[] = [];

    for (const chapterOutline of courseOutline.chapters) {
      const generatedLessons: AiLesson[] = [];
      for (const lessonTitle of chapterOutline.lessonTitles) {
        const lessonPrompt = `\n          You are an AI educator creating content for a single lesson based on PDF document content.\n          \n          Document Title: "${extractedContent.metadata.title}"\n          Chapter: "${chapterOutline.chapterTitle}"\n          Lesson: "${lessonTitle}"\n          Difficulty: ${difficulty}\n          \n          Source Content: "${extractedContent.text}"\n          \n          Generate a JSON object with this structure: \n          { "content": "...", "quiz": { "questions": [ { "question": "...", "choices": ["...", "...", "...", "..."], "answer": "..." } ] } }\n          \n          Instructions:\n          - The "content" must be detailed, 5-7 paragraphs long, and tailored for a ${difficulty} audience.\n          - Base the content on the provided source material from the PDF.\n          - The "quiz" must have at least one question with 4 choices based on the lesson content.\n          - Output only the valid JSON object.\n        `;

        await new Promise((resolve) => setTimeout(resolve, 1500));
        let lessonText: string;
        try {
          const lessonChat = model.startChat({
            generationConfig,
            safetySettings,
          });
          const result = await lessonChat.sendMessage(lessonPrompt);
          lessonText = result.response.text();
        } catch (geminiError) {
          console.error("Gemini API error during lesson generation:", geminiError);
          generatedLessons.push({
            title: lessonTitle,
            content:
              "Error: Failed to generate content for this lesson due to an API error.",
            quiz: { questions: [] },
          });
          continue; // Continue to next lesson even if one fails
        }

        try {
          const sanitizedLessonText = lessonText
            .replace(/^```json\n|\n```$/g, "")
            .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
            .replace(/\n/g, "\\n")
            .replace(/\t/g, "\\t");
          const lessonContent: LessonContent = JSON.parse(sanitizedLessonText);
          generatedLessons.push({ title: lessonTitle, ...lessonContent });
        } catch (error) {
          console.error(
            `Failed to parse content for lesson: "${lessonTitle}"`,
            error
          );
          console.error(`Raw lesson text: ${lessonText}`);
          generatedLessons.push({
            title: lessonTitle,
            content:
              "Error: Failed to generate content for this lesson based on the PDF content.",
            quiz: { questions: [] },
          });
        }
      }
      finalChapters.push({
        title: chapterOutline.chapterTitle,
        lessons: generatedLessons,
      });
    }

    // 12. Assemble final payload
    const finalPayload = {
      success: true,
      courseId: null, // Will be set after saving to DB
      courseTitle: courseOutline.courseTitle,
      creditCost: creditCost, // Include credit cost in response
      chaptersGenerated: finalChapters.length,
      lessonsGenerated: finalChapters.reduce((total, chapter) => total + chapter.lessons.length, 0),
      redirectUrl: `/dashboard/courses/preview`,
      aiGeneratedCourse: {
        title: courseOutline.courseTitle,
        difficulty: difficulty,
        chapters: finalChapters,
      },
      originalPrompt: `Generated from PDF: ${extractedContent.metadata.title}`,
      originalChapterCount: chapters,
      originalLessonsPerChapter: lessons_per_chapter,
      planLimits: planLimits, // Include plan limits in response
    };

    return NextResponse.json(finalPayload, { status: 200 });
  } catch (error) {
    console.error("Error in /api/generate-course-from-pdf:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    // If an error occurs before credit deduction, no refund is needed.
    // If an error occurs after deduction but before successful generation, refund is handled in specific catch blocks.
    return NextResponse.json(
      { error: `Failed to generate course from PDF: ${errorMessage}` },
      { status: 500 }
    );
  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (cleanupError) {
        console.error("Error cleaning up temporary file:", cleanupError);
      }
    }
  }
}



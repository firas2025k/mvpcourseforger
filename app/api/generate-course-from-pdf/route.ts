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
    // 1. Authenticate user & check course limits
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

    // Fetch user profile and plan details (same as original)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("course_limit")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError?.message);
      return NextResponse.json(
        { error: "Could not retrieve user profile." },
        { status: 500 }
      );
    }

    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("plan_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (subscriptionError || !subscription) {
      console.error("Error fetching subscription:", subscriptionError?.message);
      return NextResponse.json(
        { error: "Could not retrieve user subscription." },
        { status: 500 }
      );
    }

    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("course_limit, max_chapters, max_lessons_per_chapter")
      .eq("id", subscription.plan_id)
      .single();

    if (planError || !plan) {
      console.error("Error fetching plan:", planError?.message);
      return NextResponse.json(
        { error: "Could not retrieve plan details." },
        { status: 500 }
      );
    }

    let effectiveCourseLimit = plan.course_limit;
    if (effectiveCourseLimit < 1) {
      console.warn(
        `User ${user.id} has course_limit: ${plan.course_limit}. Applying effective limit of 1.`
      );
      effectiveCourseLimit = 1;
    }

    const { count: courseCount, error: countError } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      console.error("Error fetching course count:", countError.message);
      return NextResponse.json(
        { error: "Could not retrieve course count." },
        { status: 500 }
      );
    }

    if (courseCount !== null && courseCount >= effectiveCourseLimit) {
      return NextResponse.json(
        { error: "Course limit reached. Please upgrade your plan." },
        { status: 403 }
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

    // Check plan-based chapter and lesson limits
    if (chapters > plan.max_chapters) {
      return NextResponse.json(
        {
          error: `Requested chapters (${chapters}) exceed plan limit (${plan.max_chapters}).`,
        },
        { status: 403 }
      );
    }
    if (lessons_per_chapter > plan.max_lessons_per_chapter) {
      return NextResponse.json(
        {
          error: `Requested lessons per chapter (${lessons_per_chapter}) exceed plan limit (${plan.max_lessons_per_chapter}).`,
        },
        { status: 403 }
      );
    }

    // 3. Save uploaded file temporarily
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${randomUUID()}.pdf`;
    tempFilePath = join(tmpdir(), filename);
    await writeFile(tempFilePath, buffer);

    // 4. Extract content from PDF using Langchain
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
      return NextResponse.json(
        {
          error:
            "Failed to extract content from PDF. Please ensure the PDF contains readable text.",
        },
        { status: 400 }
      );
    }

    // 5. Generate course title and outline based on PDF content
    const outlinePrompt = `
      You are an AI course planner. Based on the extracted content from a PDF document, generate a course outline.\n      \n      Document Title: "${
        extractedContent.metadata.title
      }"\n      Document Content Preview: "${extractedContent.text.substring(
      0,
      2000
    )}..."\n      \n      Requested Parameters:\n      - Chapters: ${chapters}\n      - Lessons per chapter: ${lessons_per_chapter}\n      - Difficulty: ${difficulty}\n      \n      Generate a JSON object with a course title based on the document content, and exactly ${chapters} chapter titles.\n      For each chapter, generate exactly ${lessons_per_chapter} unique and compelling lesson titles that reflect the document's content.\n      \n      Return ONLY a valid JSON object with this structure:\n      { "courseTitle": "...", "chapters": [ { "chapterTitle": "...", "lessonTitles": ["...", "..."] } ] }\n    `;

    const chatSession = model.startChat({ generationConfig, safetySettings });
    const outlineResult = await chatSession.sendMessage(outlinePrompt);
    const outlineText = outlineResult.response
      .text()
      .replace(/^```json\n|\n```$/g, "");
    let courseOutline: CourseOutline;

    try {
      courseOutline = JSON.parse(outlineText);
    } catch (e) {
      console.error("Failed to parse course outline JSON:", e);
      console.error("Raw outline response from Gemini:", outlineText);
      return NextResponse.json(
        {
          error: "Failed to generate a valid course outline from PDF content.",
        },
        { status: 500 }
      );
    }

    // 6. Generate content for each lesson based on PDF content
    const finalChapters: AiChapter[] = [];

    for (const chapterOutline of courseOutline.chapters) {
      const generatedLessons: AiLesson[] = [];
      for (const lessonTitle of chapterOutline.lessonTitles) {
        const lessonPrompt = `\n          You are an AI educator creating content for a single lesson based on PDF document content.\n          \n          Document Title: "${extractedContent.metadata.title}"\n          Chapter: "${chapterOutline.chapterTitle}"\n          Lesson: "${lessonTitle}"\n          Difficulty: ${difficulty}\n          \n          Source Content: "${extractedContent.text}"\n          \n          Generate a JSON object with this structure: \n          { "content": "...", "quiz": { "questions": [ { "question": "...", "choices": ["...", "...", "...", "..."], "answer": "..." } ] } }\n          \n          Instructions:\n          - The "content" must be detailed, 5-7 paragraphs long, and tailored for a ${difficulty} audience.\n          - Base the content on the provided source material from the PDF.\n          - The "quiz" must have at least one question with 4 choices based on the lesson content.\n          - Output only the valid JSON object.\n        `;

        await new Promise((resolve) => setTimeout(resolve, 1500));
        const lessonChat = model.startChat({
          generationConfig,
          safetySettings,
        });
        const result = await lessonChat.sendMessage(lessonPrompt);
        const lessonText = result.response.text();

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

    // 7. Assemble final payload
    const finalPayload = {
      originalPrompt: `Generated from PDF: ${extractedContent.metadata.title}`,
      originalChapterCount: chapters,
      originalLessonsPerChapter: lessons_per_chapter,
      difficulty: difficulty,
      sourceDocument: {
        filename: file.name,
        title: extractedContent.metadata.title,
        author: extractedContent.metadata.author,
        pageCount: extractedContent.metadata.pageCount,
      },
      aiGeneratedCourse: {
        title: courseOutline.courseTitle,
        difficulty: difficulty,
        chapters: finalChapters,
      },
    };

    return NextResponse.json(finalPayload, { status: 200 });
  } catch (error) {
    console.error("Error in /api/generate-course-from-pdf:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
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

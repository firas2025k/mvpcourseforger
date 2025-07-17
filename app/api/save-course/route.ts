// app/api/save-course/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Interfaces (aligned with generate-course and preview page)
interface QuizQuestion {
  question: string;
  choices: string[];
  answer: string;
}

interface AiLesson {
  title: string;
  content: string;
  quiz?: {
    questions: QuizQuestion[];
  };
}

interface AiChapter {
  title: string;
  lessons: AiLesson[];
}

interface GeminiJsonOutput {
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  chapters: AiChapter[];
}

interface GeneratedCoursePayload {
  originalPrompt?: string;
  originalChapterCount?: number;
  originalLessonsPerChapter?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  sourceDocument?: {
    filename: string;
    title?: string;
    author?: string;
    pageCount: number;
  };
  aiGeneratedCourse?: GeminiJsonOutput;
  creditCost?: number;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('Error fetching user or no user:', userError);
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  // Fetch profile to get course_limit and courses_created_count
  const { data: profileData, error: profileFetchError } = await supabase
    .from('profiles')
    .select('course_limit, courses_created_count')
    .eq('id', user.id)
    .single();

  if (profileFetchError || !profileData) {
    console.error('Error fetching profile:', profileFetchError?.message);
    return NextResponse.json({ error: 'Could not retrieve user profile.' }, { status: 500 });
  }

  let currentCourseLimit = profileData.course_limit;
  const coursesCreatedCount = profileData.courses_created_count;

  // Check for an active subscription to override course_limit
  const { data: activeSubscription, error: subscriptionFetchError } = await supabase
    .from('subscriptions')
    .select('plans(course_limit)')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (subscriptionFetchError) {
    console.warn('Could not check for active subscription, proceeding with profile limit:', subscriptionFetchError?.message);
  }

  let onFreePlan = true;
  if (activeSubscription && activeSubscription.plans) {
    const plan = Array.isArray(activeSubscription.plans)
      ? activeSubscription.plans[0]
      : activeSubscription.plans;
    if (plan && typeof plan.course_limit === 'number' && plan.course_limit > currentCourseLimit) {
      currentCourseLimit = plan.course_limit;
      onFreePlan = false;
    }
  }

  if (onFreePlan && currentCourseLimit < 1) {
    console.warn(`User ${user.id} (Free Plan) has course_limit ${currentCourseLimit}. Setting to 1.`);
    currentCourseLimit = 1;
  }

  if (coursesCreatedCount >= currentCourseLimit) {
    console.log(`User ${user.id} has reached course creation limit. Created: ${coursesCreatedCount}, Limit: ${currentCourseLimit}.`);
    return NextResponse.json(
      { error: 'You have reached your course creation limit for your current plan. Please upgrade your plan or manage existing courses.' },
      { status: 403 }
    );
  }

  let courseData: GeneratedCoursePayload;
  try {
    courseData = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const {
    originalPrompt = '',
    originalChapterCount = 0,
    originalLessonsPerChapter = 0,
    difficulty = 'beginner',
    aiGeneratedCourse,
    creditCost = 0,
    sourceDocument,
  } = courseData;

  if (!aiGeneratedCourse || !aiGeneratedCourse.title || !aiGeneratedCourse.chapters) {
    return NextResponse.json({ error: 'Missing required course data fields' }, { status: 400 });
  }

  try {
    // Insert into 'courses' table
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        user_id: user.id,
        title: aiGeneratedCourse.title,
        prompt: originalPrompt,
        difficulty: aiGeneratedCourse.difficulty || difficulty,
        chapter_count: originalChapterCount,
        lessons_per_chapter: originalLessonsPerChapter,
        credit_cost: creditCost,
        is_published: true,
      })
      .select()
      .single();

    if (courseError) throw courseError;
    if (!course) throw new Error('Failed to create course, no data returned.');

    const courseId = course.id;

    // Insert chapters
    for (const [chapterIndex, chapterData] of aiGeneratedCourse.chapters.entries()) {
      const { data: chapter, error: chapterError } = await supabase
        .from('chapters')
        .insert({
          course_id: courseId,
          title: chapterData.title,
          order_index: chapterIndex,
        })
        .select()
        .single();

      if (chapterError) throw chapterError;
      if (!chapter) throw new Error('Failed to create chapter, no data returned.');
      const chapterId = chapter.id;

      // Insert lessons
      for (const [lessonIndex, lessonData] of chapterData.lessons.entries()) {
        const { data: lesson, error: lessonError } = await supabase
          .from('lessons')
          .insert({
            chapter_id: chapterId,
            title: lessonData.title,
            content: lessonData.content || '',
            type: 'text',
            order_index: lessonIndex,
          })
          .select()
          .single();

        if (lessonError) throw lessonError;
        if (!lesson) throw new Error('Failed to create lesson, no data returned.');
        const lessonId = lesson.id;

        // Insert quiz questions
        if (lessonData.quiz && lessonData.quiz.questions.length > 0) {
          for (const questionData of lessonData.quiz.questions) {
            const wrongAnswers = questionData.choices.filter(choice => choice !== questionData.answer);
            const { error: quizQuestionError } = await supabase
              .from('quizzes')
              .insert({
                lesson_id: lessonId,
                question: questionData.question,
                correct_answer: questionData.answer,
                wrong_answers: wrongAnswers,
              });

            if (quizQuestionError) {
              console.error('Error inserting quiz question:', quizQuestionError);
              throw quizQuestionError;
            }
          }
        }
      }
    }

    // Increment courses_created_count
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ courses_created_count: coursesCreatedCount + 1 })
      .eq('id', user.id);

    if (updateProfileError) {
      console.error(`Failed to increment courses_created_count for user ${user.id}: ${updateProfileError.message}`);
    }

    return NextResponse.json({ success: true, courseId }, { status: 201 });

  } catch (error: any) {
    console.error('Error saving course to database:', error);
    return NextResponse.json({ error: 'Failed to save course to database.', details: error.message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // Adjusted path

// Interfaces from the preview page/generate-course API (should be in a shared types file ideally)
interface QuizQuestion {
  question: string;
  choices: string[];
  answer: string;
}

interface AiLesson {
  title: string;
  content: string;
  quiz?: { // Quiz is optional
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
  originalPrompt: string;
  originalChapterCount: number;
  originalLessonsPerChapter: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  aiGeneratedCourse: GeminiJsonOutput;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Error fetching user or no user:', userError);
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  // --- BEGIN COURSE LIMIT CHECK --- 
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

  // Check for an active subscription to potentially override the profile's course_limit
  const { data: activeSubscription, error: subscriptionFetchError } = await supabase
    .from('subscriptions')
    .select('plans(course_limit)') // Assumes 'plans' table is related and has 'course_limit'
    .eq('user_id', user.id)
    .eq('is_active', true) // Or your equivalent 'active' status field
    .maybeSingle();

  if (subscriptionFetchError) {
    // Log warning but proceed with profile limit, as db error shouldn't block if profile is fine
    console.warn('Could not check for active subscription, proceeding with profile limit:', subscriptionFetchError.message);
  }

  let onFreePlan = true; // Assume free plan initially

  if (activeSubscription && activeSubscription.plans) {
    const planDetailsArray = activeSubscription.plans;
    // Check if it's an array and has at least one element
    if (Array.isArray(planDetailsArray) && planDetailsArray.length > 0) {
      const plan = planDetailsArray[0];
      if (plan && typeof plan.course_limit === 'number' && plan.course_limit > currentCourseLimit) {
        currentCourseLimit = plan.course_limit;
        onFreePlan = false; // User has an active paid plan that sets the limit
      }
    } else if (!Array.isArray(planDetailsArray)) {
      // Fallback: If it's somehow an object (which is what one might expect for a to-one relation)
      const plan = planDetailsArray as { course_limit?: any }; // Type assertion for direct access
      if (plan && typeof plan.course_limit === 'number' && plan.course_limit > currentCourseLimit) {
        currentCourseLimit = plan.course_limit;
        onFreePlan = false; // User has an active paid plan that sets the limit
      }
    }
  }

  // Safeguard: If user is on Free Plan (no overriding active paid subscription) and profile limit is < 1, set to 1.
  if (onFreePlan && currentCourseLimit < 1) {
    console.warn(`User ${user.id} (Free Plan context) has profile.course_limit or effective limit of ${currentCourseLimit} in DB. API applying effective limit of 1.`);
    currentCourseLimit = 1;
  }
  
  // Check if the user has reached their effective course creation limit
  if (coursesCreatedCount >= currentCourseLimit) {
    console.log(`User ${user.id} has reached course creation limit. Created (lifetime): ${coursesCreatedCount}, Effective Limit: ${currentCourseLimit}.`);
    return NextResponse.json(
      { error: 'You have reached your course creation limit for your current plan. To create more courses, please upgrade your plan or manage your existing courses.' },
      { status: 403 } // Forbidden
    );
  }
  // --- END COURSE LIMIT CHECK --- 

  let courseData: GeneratedCoursePayload;
  try {
    courseData = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { 
    originalPrompt,
    originalChapterCount,
    originalLessonsPerChapter,
    difficulty,
    aiGeneratedCourse 
  } = courseData;

  if (!aiGeneratedCourse || !aiGeneratedCourse.title || !aiGeneratedCourse.chapters) {
    return NextResponse.json({ error: 'Missing required course data fields' }, { status: 400 });
  }

  try {
    // 1. Insert into 'courses' table
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        user_id: user.id,
        title: aiGeneratedCourse.title, // Using AI generated title
        prompt: originalPrompt,
        difficulty: difficulty, // Using original difficulty from form
        chapter_count: originalChapterCount,
        lessons_per_chapter: originalLessonsPerChapter,
        // image_url and description can be added later if needed
      })
      .select()
      .single();

    if (courseError) throw courseError;
    if (!course) throw new Error('Failed to create course, no data returned.');

    const courseId = course.id;

    // 2. Loop through chapters and insert into 'chapters' table
    for (const [chapterIndex, chapterData] of aiGeneratedCourse.chapters.entries()) {
      const { data: chapter, error: chapterError } = await supabase
        .from('chapters')
        .insert({
          course_id: courseId,
          title: chapterData.title,
          order_index: chapterIndex + 1, // Assuming 1-based indexing for order
        })
        .select()
        .single();

      if (chapterError) throw chapterError;
      if (!chapter) throw new Error('Failed to create chapter, no data returned.');
      const chapterId = chapter.id;

      // 3. Loop through lessons and insert into 'lessons' table
      for (const [lessonIndex, lessonData] of chapterData.lessons.entries()) {
        const { data: lesson, error: lessonError } = await supabase
          .from('lessons')
          .insert({
            chapter_id: chapterId,
            // course_id: courseId, // Removed: lessons table does not have course_id, linked via chapter_id
            title: lessonData.title,
            content: lessonData.content,
            order_index: lessonIndex + 1,
            // video_url, resources can be added later
          })
          .select()
          .single();
        
        if (lessonError) throw lessonError;
        if (!lesson) throw new Error('Failed to create lesson, no data returned.');
        const lessonId = lesson.id;

        // 4. If lesson has a quiz, insert questions directly into 'quizzes' table
        //    The 'quizzes' table schema stores individual questions.
        if (lessonData.quiz && lessonData.quiz.questions.length > 0) {
          for (const questionData of lessonData.quiz.questions) {
            const wrongAnswers = questionData.choices.filter(choice => choice !== questionData.answer);
            
            const { error: quizQuestionError } = await supabase
              .from('quizzes') // Directly inserting into public.quizzes as it holds questions
              .insert({
                lesson_id: lessonId,
                question: questionData.question, // Renamed from question_text to match schema
                correct_answer: questionData.answer,
                wrong_answers: wrongAnswers, // Derived from choices
                // 'choices' field from Gemini output is not directly stored if schema only has wrong_answers
              });

            if (quizQuestionError) {
              console.error('Error inserting quiz question:', JSON.stringify(quizQuestionError, null, 2));
              console.error('Question data:', JSON.stringify(questionData, null, 2));
              throw quizQuestionError;
            }
          }
        }
      }
    }

    // If all insertions are successful, increment courses_created_count on the profile
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ courses_created_count: coursesCreatedCount + 1 })
      .eq('id', user.id);

    if (updateProfileError) {
      // This is problematic. Course is saved, but count not updated.
      // Ideally, this is a transaction. For now, log critical error.
      console.error(`CRITICAL: Failed to increment courses_created_count for user ${user.id} after course creation. Error: ${updateProfileError.message}`);
      // Don't fail the request at this point as course is already saved, but this needs monitoring/manual correction.
    }

    return NextResponse.json({ message: 'Course saved successfully', courseId: courseId }, { status: 201 });

  } catch (error: any) {
    console.error('Error saving course to database:', error);
    return NextResponse.json({ error: 'Failed to save course to database.', details: error.message }, { status: 500 });
  }
}

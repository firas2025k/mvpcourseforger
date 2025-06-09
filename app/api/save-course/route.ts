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

    return NextResponse.json({ message: 'Course saved successfully', courseId: courseId }, { status: 201 });

  } catch (error: any) {
    console.error('Error saving course to database:', error);
    return NextResponse.json({ error: 'Failed to save course to database.', details: error.message }, { status: 500 });
  }
}

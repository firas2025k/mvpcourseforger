import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

interface LessonInChapter {
  id: string;
  title: string;
  content: string | null;
  order_index: number;
}

interface ChapterWithLessons {
  id: string;
  title: string;
  order_index: number;
  lessons: LessonInChapter[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const cookieStore = await cookies(); // Diagnostic: await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // cookieStore is now from the outer scope
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // cookieStore is now from the outer scope
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          // cookieStore is now from the outer scope
          cookieStore.set(name, '', options);
        },
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  const courseId = params.courseId;

  if (!courseId) {
    return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
  }

  try {
    // Fetch course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .eq('user_id', user.id) // Ensure the user owns the course
      .single();

    if (courseError || !course) {
      console.error('Error fetching course or course not found/not owned:', courseError?.message);
      return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 });
    }

    // Fetch chapters for the course, including their lessons
    const { data: chaptersData, error: chaptersError } = await supabase
      .from('chapters')
      .select(`
        id,
        title,
        order_index,
        lessons (
          id,
          title,
          content,
          order_index
        )
      `)
      .eq('course_id', courseId)
      .order('order_index', { ascending: true }) // Changed from chapter_number
      .order('order_index', { referencedTable: 'lessons', ascending: true }) as { data: ChapterWithLessons[] | null; error: any };

    if (chaptersError) {
      console.error('Error fetching chapters:', chaptersError.message);
      return NextResponse.json({ error: 'Failed to fetch course chapters' }, { status: 500 });
    }

    // Ensure chapters and their nested lessons are properly structured, handling potential nulls
    const chapters = chaptersData ? chaptersData.map(ch => ({
      ...ch,
      lessons: ch.lessons || []
    })) : [];

    const courseWithDetails = {
      ...course,
      chapters
    };

    return NextResponse.json(courseWithDetails);

  } catch (error: any) {
    console.error('Error in course-details endpoint:', error.message);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
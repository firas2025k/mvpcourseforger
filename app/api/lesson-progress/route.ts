import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookieStore = await cookies(); // For reading incoming cookies
  const tempHttpResponse = new NextResponse(null, {}); // Temporary response to hold outgoing cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          tempHttpResponse.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          tempHttpResponse.cookies.delete({ name, ...options });
        },
      },
    }
  );
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');

  if (!courseId) {
    return NextResponse.json({ error: 'Course ID is required' }, { status: 400, headers: tempHttpResponse.headers });
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401, headers: tempHttpResponse.headers });
    }

    // Fetch lesson progress for the user and course
    // Using !inner() to ensure rows are only returned if the join condition is met
    const { data, error } = await supabase
      .from('progress')
      .select(`
        lesson_id,
        is_completed,
        lessons!inner ( id, chapter_id, chapters!inner (id, course_id) )
      `)
      .eq('user_id', user.id)
      .eq('lessons.chapters.course_id', courseId); // Filter on the joined table

    if (error) {
      console.error('Error fetching lesson progress:', error);
      return NextResponse.json({ error: error.message }, { status: 500, headers: tempHttpResponse.headers });
    }

    const progressMap: Record<string, boolean> = {};
    if (data) {
      data.forEach((p: any) => {
        // The !inner join ensures that p.lessons and p.lessons.chapters exist and match the courseId
        progressMap[p.lesson_id] = p.is_completed;
      });
    }
    
    return NextResponse.json(progressMap, { headers: tempHttpResponse.headers });

  } catch (e: any) {
    console.error('Unexpected error fetching lesson progress:', e);
    return NextResponse.json({ error: e.message || 'An unexpected error occurred' }, { status: 500, headers: tempHttpResponse.headers });
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies(); // For reading incoming cookies
  const tempHttpResponse = new NextResponse(null, {}); // Temporary response to hold outgoing cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          tempHttpResponse.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          tempHttpResponse.cookies.delete({ name, ...options });
        },
      },
    }
  );
  const { lessonId, isCompleted } = await request.json(); // courseId removed as it's not directly used in POST logic beyond user context

  if (!lessonId) {
    return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400, headers: tempHttpResponse.headers });
  }
  if (typeof isCompleted !== 'boolean') {
    return NextResponse.json({ error: 'isCompleted flag (boolean) is required' }, { status: 400, headers: tempHttpResponse.headers });
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401, headers: tempHttpResponse.headers });
    }

    const { data: existingProgress, error: fetchError } = await supabase
      .from('progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    // PGRST116: 'Searched item not found in table', not an error in this context
    if (fetchError && fetchError.code !== 'PGRST116') { 
      console.error('Error fetching existing progress:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (existingProgress) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('progress')
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', existingProgress.id);

      if (updateError) {
        console.error('Error updating lesson progress:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    } else if (isCompleted) {
      // Insert new record only if marking as complete and no existing record
      const { error: insertError } = await supabase
        .from('progress')
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          is_completed: true,
          completed_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error inserting lesson progress:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    } 
    // If not existing and isCompleted is false, we do nothing, as there's no record to mark incomplete.

    return NextResponse.json({ success: true, lessonId, isCompleted }, { headers: tempHttpResponse.headers });

  } catch (e: any) {
    console.error('Unexpected error updating lesson progress:', e);
    return NextResponse.json({ error: e.message || 'An unexpected error occurred' }, { status: 500, headers: tempHttpResponse.headers });
  }
}
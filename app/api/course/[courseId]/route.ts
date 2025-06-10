import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const courseId = params.courseId;
  const cookieStore = await cookies();
  const tempHttpResponse = new NextResponse(null, {});

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

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401, headers: tempHttpResponse.headers });
    }

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400, headers: tempHttpResponse.headers });
    }

    // Verify the user owns the course before deleting
    const { data: courseData, error: courseFetchError } = await supabase
      .from('courses')
      .select('id, user_id')
      .eq('id', courseId)
      .eq('user_id', user.id)
      .single();

    if (courseFetchError || !courseData) {
      return NextResponse.json(
        { error: 'Course not found or user does not have permission to delete it.' },
        { status: 404, headers: tempHttpResponse.headers }
      );
    }

    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (deleteError) {
      console.error('Error deleting course:', deleteError);
      return NextResponse.json({ error: `Failed to delete course: ${deleteError.message}` }, { status: 500, headers: tempHttpResponse.headers });
    }

    return NextResponse.json({ message: 'Course deleted successfully' }, { status: 200, headers: tempHttpResponse.headers });

  } catch (e: any) {
    console.error('Unexpected error deleting course:', e);
    return NextResponse.json({ error: e.message || 'An unexpected error occurred' }, { status: 500, headers: tempHttpResponse.headers });
  }
}
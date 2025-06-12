// app/api/complete-course/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { courseId } = await request.json()

    if (!courseId) {
      return new NextResponse(JSON.stringify({ error: 'Missing courseId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Update the enrollments table
    const { error } = await supabase
      .from('enrollments')
      .update({ is_completed: true })
      .eq('user_id', user.id)
      .eq('course_id', courseId)

    if (error) {
      console.error('Error updating enrollments table:', error)
      return new NextResponse(
        JSON.stringify({ error: 'Failed to update course completion' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return new NextResponse(JSON.stringify({ message: 'Course completed successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error processing request:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: NextRequest) {
  try {
    const { lessonId, content } = await request.json();

    if (!lessonId || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Missing required fields: lessonId and content' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify that the user owns the lesson (through course ownership)
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select(`
        id,
        chapter_id,
        chapters!inner (
          id,
          course_id,
          courses!inner (
            id,
            user_id
          )
        )
      `)
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Check if user owns the course
    const courseUserId = lesson.chapters.courses.user_id;
    if (courseUserId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this lesson' },
        { status: 403 }
      );
    }

    // Update the lesson content
    const { error: updateError } = await supabase
      .from('lessons')
      .update({ content })
      .eq('id', lessonId);

    if (updateError) {
      console.error('Error updating lesson content:', updateError);
      return NextResponse.json(
        { error: 'Failed to update lesson content' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Lesson content updated successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


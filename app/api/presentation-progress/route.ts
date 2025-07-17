// app/api/presentation-progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: NextRequest) {
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
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {}
        },
      },
    }
  );

  try {
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: User not authenticated.' }, { status: 401 });
    }

    // 2. Get presentationId from query params
    const { searchParams } = new URL(request.url);
    const presentationId = searchParams.get('presentationId');

    if (!presentationId) {
      return NextResponse.json({ error: 'Presentation ID is required.' }, { status: 400 });
    }

    // 3. Verify presentation ownership and get slides
    const { data: presentation, error: presentationError } = await supabase
      .from('presentations')
      .select(`
        id,
        slides (id)
      `)
      .eq('id', presentationId)
      .eq('user_id', user.id)
      .single();

    if (presentationError || !presentation) {
      return NextResponse.json({ error: 'Presentation not found or access denied.' }, { status: 404 });
    }

    // 4. Get presentation progress for the user
    const slideIds = presentation.slides?.map((slide: any) => slide.id) || [];
    
    if (slideIds.length === 0) {
      return NextResponse.json({}, { status: 200 });
    }

    const { data: progress, error: progressError } = await supabase
      .from('presentation_progress')
      .select('slide_id, is_viewed')
      .eq('user_id', user.id)
      .in('slide_id', slideIds);

    if (progressError) {
      console.error('Error fetching presentation progress:', progressError.message);
      return NextResponse.json({ error: 'Failed to fetch presentation progress.' }, { status: 500 });
    }

    // 5. Convert to simple object format
    const progressData: Record<string, boolean> = {};
    (progress || []).forEach((p: any) => {
      progressData[p.slide_id] = p.is_viewed;
    });

    return NextResponse.json(progressData, { status: 200 });

  } catch (error) {
    console.error('Error in /api/presentation-progress:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to fetch presentation progress: ${errorMessage}` }, { status: 500 });
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
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {}
        },
      },
    }
  );

  try {
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: User not authenticated.' }, { status: 401 });
    }

    // 2. Parse request body
    const { slideId, isViewed, presentationId } = await request.json();

    if (!slideId || typeof isViewed !== 'boolean' || !presentationId) {
      return NextResponse.json({ error: 'slideId, isViewed, and presentationId are required.' }, { status: 400 });
    }

    // 3. Verify slide belongs to user's presentation
    const { data: slide, error: slideError } = await supabase
      .from('slides')
      .select(`
        id,
        presentation_id,
        presentations!inner (
          user_id
        )
      `)
      .eq('id', slideId)
      .eq('presentation_id', presentationId)
      .eq('presentations.user_id', user.id)
      .single();

    if (slideError || !slide) {
      return NextResponse.json({ error: 'Slide not found or access denied.' }, { status: 404 });
    }

    // 4. Update or insert presentation progress
    const { error: upsertError } = await supabase
      .from('presentation_progress')
      .upsert({
        user_id: user.id,
        slide_id: slideId,
        is_viewed: isViewed,
        viewed_at: isViewed ? new Date().toISOString() : null
      }, {
        onConflict: 'user_id,slide_id'
      });

    if (upsertError) {
      console.error('Error updating presentation progress:', upsertError.message);
      return NextResponse.json({ error: 'Failed to update presentation progress.' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Error in POST /api/presentation-progress:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to update presentation progress: ${errorMessage}` }, { status: 500 });
  }
}


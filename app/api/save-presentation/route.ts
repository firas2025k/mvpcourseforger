// app/api/save-presentation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

interface SavePresentationRequestBody {
  title: string;
  prompt: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  theme: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  slides: {
    title: string;
    content: string;
    type: 'title' | 'content' | 'image' | 'chart' | 'conclusion';
    layout: 'default' | 'title-only' | 'two-column' | 'image-left' | 'image-right' | 'full-image';
    speaker_notes?: string;
    order_index: number;
  }[];
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

    const body = await request.json() as SavePresentationRequestBody;
    const { title, prompt, difficulty, theme, background_color, text_color, accent_color, slides } = body;

    if (!title || !slides || slides.length === 0) {
      return NextResponse.json({ error: 'Missing required fields: title and slides are required.' }, { status: 400 });
    }

    // 2. Check presentation limits
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (subscriptionError || !subscription) {
      console.error('Error fetching subscription:', subscriptionError?.message);
      return NextResponse.json({ error: 'Could not retrieve user subscription.' }, { status: 500 });
    }

    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('max_presentations, max_slides_per_presentation')
      .eq('id', subscription.plan_id)
      .single();

    if (planError || !plan) {
      console.error('Error fetching plan:', planError?.message);
      return NextResponse.json({ error: 'Could not retrieve plan details.' }, { status: 500 });
    }

    // Check presentation count limit
    const { count: presentationCount, error: countError } = await supabase
      .from('presentations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      console.error('Error fetching presentation count:', countError.message);
      return NextResponse.json({ error: 'Could not retrieve presentation count.' }, { status: 500 });
    }

    if (presentationCount !== null && presentationCount >= plan.max_presentations) {
      return NextResponse.json({ error: 'Presentation limit reached. Please upgrade your plan.' }, { status: 403 });
    }

    // Check slide count limit
    if (slides.length > plan.max_slides_per_presentation) {
      return NextResponse.json(
        { error: `Slide count (${slides.length}) exceeds plan limit (${plan.max_slides_per_presentation}).` },
        { status: 403 }
      );
    }

    // 3. Insert presentation
    const { data: presentation, error: presentationError } = await supabase
      .from('presentations')
      .insert({
        user_id: user.id,
        title: title,
        prompt: prompt,
        difficulty: difficulty,
        slide_count: slides.length,
        theme: theme,
        background_color: background_color,
        text_color: text_color,
        accent_color: accent_color,
        source_type: 'prompt'
      })
      .select()
      .single();

    if (presentationError || !presentation) {
      console.error('Error creating presentation:', presentationError?.message);
      return NextResponse.json({ error: 'Failed to create presentation.' }, { status: 500 });
    }

    // 4. Insert slides
    const slidesToInsert = slides.map(slide => ({
      presentation_id: presentation.id,
      title: slide.title,
      content: slide.content,
      type: slide.type,
      layout: slide.layout,
      speaker_notes: slide.speaker_notes || '',
      order_index: slide.order_index,
      animation_type: 'fade'
    }));

    const { data: insertedSlides, error: slidesError } = await supabase
      .from('slides')
      .insert(slidesToInsert)
      .select();

    if (slidesError) {
      console.error('Error creating slides:', slidesError.message);
      // Rollback: delete the presentation if slides failed to insert
      await supabase.from('presentations').delete().eq('id', presentation.id);
      return NextResponse.json({ error: 'Failed to create slides.' }, { status: 500 });
    }

    // 5. Update user's presentation count
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ presentations_created_count: (presentationCount || 0) + 1 })
      .eq('id', user.id);

    if (updateError) {
      console.warn('Failed to update presentation count in profile:', updateError.message);
      // Don't fail the request for this non-critical update
    }

    // 6. Return the complete presentation with slides
    const savedPresentation = {
      ...presentation,
      slides: insertedSlides
    };

    return NextResponse.json({
      message: 'Presentation saved successfully!',
      presentation: savedPresentation
    }, { status: 201 });

  } catch (error) {
    console.error('Error in /api/save-presentation:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to save presentation: ${errorMessage}` }, { status: 500 });
  }
}


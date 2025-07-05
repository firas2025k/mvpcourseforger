// app/api/generate-presentation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { model, generationConfig, safetySettings } from '@/lib/gemini';

// ----- INTERFACES -----

interface GeneratePresentationRequestBody {
  prompt: string;
  slides: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  theme?: string;
  background_color?: string;
  text_color?: string;
  accent_color?: string;
}

interface AiSlide {
  title: string;
  content: string;
  type: 'title' | 'content' | 'image' | 'chart' | 'conclusion';
  layout: 'default' | 'title-only' | 'two-column' | 'image-left' | 'image-right' | 'full-image';
  speaker_notes?: string;
}

interface PresentationOutline {
  presentationTitle: string;
  slides: {
    slideTitle: string;
    slideType: 'title' | 'content' | 'image' | 'chart' | 'conclusion';
    slideLayout: 'default' | 'title-only' | 'two-column' | 'image-left' | 'image-right' | 'full-image';
  }[];
}

interface SlideContent {
  content: string;
  speaker_notes?: string;
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
    // 1. Authenticate user & check presentation limits
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: User not authenticated.' }, { status: 401 });
    }

    // Fetch user profile and plan details
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('presentation_limit')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError?.message);
      return NextResponse.json({ error: 'Could not retrieve user profile.' }, { status: 500 });
    }

    // Fetch plan details for max presentations and slides
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

    let effectivePresentationLimit = plan.max_presentations;
    if (effectivePresentationLimit < 1) {
      console.warn(`User ${user.id} has presentation limit: ${plan.max_presentations}. Applying effective limit of 1.`);
      effectivePresentationLimit = 1;
    }

    const { count: presentationCount, error: countError } = await supabase
      .from('presentations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      console.error('Error fetching presentation count:', countError.message);
      return NextResponse.json({ error: 'Could not retrieve presentation count.' }, { status: 500 });
    }

    if (presentationCount !== null && presentationCount >= effectivePresentationLimit) {
      return NextResponse.json({ error: 'Presentation limit reached. Please upgrade your plan.' }, { status: 403 });
    }

    const body = await request.json() as GeneratePresentationRequestBody;
    const { 
      prompt: userPrompt, 
      slides, 
      difficulty, 
      theme = 'default',
      background_color = '#ffffff',
      text_color = '#000000',
      accent_color = '#3b82f6'
    } = body;

    if (!userPrompt || !slides || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check plan-based slide limits
    if (slides > plan.max_slides_per_presentation) {
      return NextResponse.json(
        { error: `Requested slides (${slides}) exceed plan limit (${plan.max_slides_per_presentation}).` },
        { status: 403 }
      );
    }

    // STAGE 1 - GENERATE PRESENTATION OUTLINE
    const outlinePrompt = `
      You are an AI presentation planner. Based on the user's request, generate a presentation outline.
      User Request: "${userPrompt}", Difficulty: ${difficulty}
      Generate a JSON object with a presentation title and exactly ${slides} slide outlines.
      
      For each slide, determine the most appropriate type and layout:
      - Types: "title", "content", "image", "chart", "conclusion"
      - Layouts: "default", "title-only", "two-column", "image-left", "image-right", "full-image"
      
      The first slide should typically be "title" type with "title-only" layout.
      The last slide should typically be "conclusion" type.
      Content slides should use appropriate layouts based on the content.
      
      Return ONLY a valid JSON object with this structure:
      {
        "presentationTitle": "...",
        "slides": [
          {
            "slideTitle": "...",
            "slideType": "title|content|image|chart|conclusion",
            "slideLayout": "default|title-only|two-column|image-left|image-right|full-image"
          }
        ]
      }
    `;

    const chatSession = model.startChat({ generationConfig, safetySettings });
    const outlineResult = await chatSession.sendMessage(outlinePrompt);
    const outlineText = outlineResult.response.text().replace(/^```json\n|\n```$/g, '');
    let presentationOutline: PresentationOutline;

    try {
      presentationOutline = JSON.parse(outlineText);
    } catch (e) {
      console.error("Failed to parse presentation outline JSON:", e);
      console.error("Raw outline response from Gemini:", outlineText);
      return NextResponse.json({ error: "Failed to generate a valid presentation outline from AI." }, { status: 500 });
    }

    // STAGE 2 - GENERATE CONTENT FOR EACH SLIDE
    const finalSlides: AiSlide[] = [];

    for (const slideOutline of presentationOutline.slides) {
      const slidePrompt = `
        You are an AI presentation content creator.
        Presentation Topic: "${userPrompt}"
        Slide Title: "${slideOutline.slideTitle}"
        Slide Type: "${slideOutline.slideType}"
        Slide Layout: "${slideOutline.slideLayout}"
        Difficulty: ${difficulty}
        
        Generate a JSON object with this structure:
        {
          "content": "...",
          "speaker_notes": "..."
        }
        
        Instructions:
        - For "title" slides: Create a compelling title and subtitle
        - For "content" slides: Create detailed, engaging content appropriate for ${difficulty} audience
        - For "image" slides: Describe what image should be shown and provide supporting text
        - For "chart" slides: Describe the data visualization and provide explanatory text
        - For "conclusion" slides: Summarize key points and provide a strong closing
        - Content should be formatted in markdown for better presentation
        - Speaker notes should provide additional context and talking points
        - Keep content concise but informative for slide presentation format
        
        Output only the valid JSON object.
      `;

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const slideChat = model.startChat({ generationConfig, safetySettings });
      const result = await slideChat.sendMessage(slidePrompt);
      const slideText = result.response.text();

      try {
        const sanitizedSlideText = slideText
          .replace(/^```json\n|\n```$/g, '')
          .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
          .replace(/\n/g, '\\n')
          .replace(/\t/g, '\\t');
        
        const slideContent: SlideContent = JSON.parse(sanitizedSlideText);
        
        finalSlides.push({
          title: slideOutline.slideTitle,
          content: slideContent.content,
          type: slideOutline.slideType,
          layout: slideOutline.slideLayout,
          speaker_notes: slideContent.speaker_notes
        });
      } catch (error) {
        console.error(`Failed to parse content for slide: "${slideOutline.slideTitle}"`, error);
        console.error(`Raw slide text: ${slideText}`);
        
        finalSlides.push({
          title: slideOutline.slideTitle,
          content: "Error: Failed to generate content for this slide.",
          type: slideOutline.slideType,
          layout: slideOutline.slideLayout,
          speaker_notes: "No speaker notes available due to generation error."
        });
      }
    }

    // ASSEMBLE FINAL PAYLOAD
    const finalPayload = {
      originalPrompt: userPrompt,
      originalSlideCount: slides,
      difficulty: difficulty,
      theme: theme,
      aiGeneratedPresentation: {
        title: presentationOutline.presentationTitle,
        difficulty: difficulty,
        theme: theme,
        background_color: background_color,
        text_color: text_color,
        accent_color: accent_color,
        slides: finalSlides
      }
    };

    return NextResponse.json(finalPayload, { status: 200 });

  } catch (error) {
    console.error('Error in /api/generate-presentation:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to generate presentation content: ${errorMessage}` }, { status: 500 });
  }
}


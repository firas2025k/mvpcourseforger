// app/api/generate-presentation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { model, generationConfig, safetySettings } from '@/lib/gemini';
import { createPixabayService } from '@/lib/pixabay';

interface GeneratePresentationRequestBody {
  prompt: string;
  slides: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  theme?: string;
  background_color?: string;
  text_color?: string;
  accent_color?: string;
  include_images?: boolean; // New option for image integration
}

interface AiSlide {
  title: string;
  content: string;
  type: 'title' | 'content' | 'image' | 'chart' | 'conclusion';
  layout: 'default' | 'title-only' | 'two-column' | 'image-left' | 'image-right' | 'full-image';
  speaker_notes?: string;
  image_keywords?: string[]; // Keywords for image search
  image_url?: string; // Selected image URL
  image_alt?: string; // Alt text for image
}

interface GeneratedPresentation {
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  theme: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  slides: AiSlide[];
}

// ----- CREDIT CALCULATION FUNCTIONS -----

/**
 * Calculates the credit cost for generating a presentation based on slide count and image inclusion
 * @param slideCount Number of slides
 * @param includeImages Whether images are included
 * @returns Credit cost for the presentation generation
 */
function calculatePresentationCreditCost(slideCount: number, includeImages: boolean = false): number {
  // Base cost structure:
  // - 1 credit for presentations with 1-5 slides
  // - 2 credits for presentations with 6-15 slides
  // - 3 credits for presentations with 16-30 slides
  // - 4 credits for presentations with 31+ slides
  // + 1 additional credit if images are included
  
  let baseCost = 1;
  if (slideCount <= 5) baseCost = 1;
  else if (slideCount <= 15) baseCost = 2;
  else if (slideCount <= 30) baseCost = 3;
  else baseCost = 4;
  
  // Add image cost
  const imageCost = includeImages ? 1 : 0;
  
  return baseCost + imageCost;
}

/**
 * Deducts credits from user's balance and records the transaction
 */
async function deductCreditsAndRecordTransaction(
  supabase: any,
  userId: string,
  creditCost: number,
  presentationId: string,
  description: string
): Promise<boolean> {
  try {
    // Get current credit balance
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (fetchError || !profile) {
      console.error('Error fetching user profile for credit deduction:', fetchError);
      return false;
    }

    const currentCredits = profile.credits || 0;
    const newBalance = currentCredits - creditCost;

    // Update credit balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: newBalance })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating credit balance:', updateError);
      return false;
    }

    // Record transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        type: 'consumption',
        amount: -creditCost,
        related_entity_id: presentationId,
        description: description
      });

    if (transactionError) {
      console.error('Error recording credit transaction:', transactionError);
    }

    console.log(`Successfully deducted ${creditCost} credits from user ${userId}. New balance: ${newBalance}`);
    return true;
  } catch (error) {
    console.error('Error in credit deduction process:', error);
    return false;
  }
}

/**
 * Robust JSON parser that handles various edge cases from AI responses
 */
function parseAIResponse(text: string, context: string): any {
  try {
    let cleanText = text.replace(/^```json\s*\n?|\n?```\s*$/g, '').trim();
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
    }
    console.log(`Attempting to parse ${context}:`, cleanText.substring(0, 200) + '...');
    return JSON.parse(cleanText);
  } catch (error) {
    console.error(`Failed to parse ${context}:`, error);
    console.error(`Raw text (first 500 chars):`, text.substring(0, 500));
    return null;
  }
}

/**
 * Makes a Gemini API call with retry logic for 503 errors
 */
async function makeGeminiAPICall(prompt: string, context: string, maxRetries: number = 3): Promise<string> {
  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`${context} - Attempt ${attempt}/${maxRetries}`);
      const chatSession = model.startChat({ generationConfig, safetySettings });
      const result = await chatSession.sendMessage(prompt);
      const responseText = result.response.text();
      console.log(`${context} - Success on attempt ${attempt}`);
      return responseText;
    } catch (error: any) {
      lastError = error;
      console.error(`${context} - Attempt ${attempt} failed:`, error.message);
      if (error.message && error.message.includes('503')) {
        console.log(`${context} - 503 error detected, retrying in ${attempt * 2} seconds...`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          continue;
        }
      }
      break;
    }
  }
  throw new Error(`${context} failed after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Check if Pixabay API is available
 */
function isPixabayAvailable(): boolean {
  return !!process.env.PIXABAY_API_KEY;
}

/**
 * Search for images for presentation slides with improved error handling
 */
async function searchImagesForSlides(slides: AiSlide[], includeImages: boolean): Promise<{ slides: AiSlide[], imagesFound: number, imageErrors: string[] }> {
  const result = {
    slides: [...slides],
    imagesFound: 0,
    imageErrors: [] as string[]
  };

  // Skip image search if not requested
  if (!includeImages) {
    console.log('Image search skipped - not requested by user');
    return result;
  }

  // Check if Pixabay API is available
  if (!isPixabayAvailable()) {
    const error = 'Pixabay API key not configured. Images will not be included.';
    console.error(error);
    result.imageErrors.push(error);
    return result;
  }

  try {
    const pixabayService = createPixabayService();
    console.log('Pixabay service created successfully');

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      
      // Search for images for all slides that have keywords when images are enabled
      if (slide.image_keywords && slide.image_keywords.length > 0) {
        
        try {
          console.log(`Searching image for slide ${i + 1}: "${slide.title}" with keywords: ${slide.image_keywords.join(', ')}`);
          
          // Search for the best image using the first keyword
          const searchResults = await pixabayService.searchImages({
            q: slide.image_keywords[0],
            image_type: 'photo',
            safesearch: true,
            per_page: 5,
            min_width: 640,
            min_height: 480
          });

          if (searchResults.hits.length > 0) {
            const bestImage = searchResults.hits[0]; // Take the first (most relevant) result
            result.slides[i].image_url = pixabayService.getImageUrl(bestImage, 'large');
            result.slides[i].image_alt = `Image related to ${slide.image_keywords.join(', ')}`;
            result.imagesFound++;
            console.log(`✅ Image found for slide ${i + 1}: ${result.slides[i].image_url}`);
          } else {
            console.log(`⚠️ No images found for slide ${i + 1} with keyword: ${slide.image_keywords[0]}`);
            result.imageErrors.push(`No images found for "${slide.title}" with keyword: ${slide.image_keywords[0]}`);
          }

          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (imageError: any) {
          const errorMsg = `Error searching image for slide "${slide.title}": ${imageError.message}`;
          console.error(errorMsg);
          result.imageErrors.push(errorMsg);
          // Continue with other slides
        }
      } else {
        console.log(`Skipping image search for slide ${i + 1}: "${slide.title}" (no keywords or incompatible layout)`);
      }
    }

    console.log(`Image search completed. Found ${result.imagesFound} images out of ${slides.length} slides.`);
    return result;
  } catch (error: any) {
    const errorMsg = `Error in image search process: ${error.message}`;
    console.error(errorMsg);
    result.imageErrors.push(errorMsg);
    return result;
  }
}

export async function POST(request: NextRequest) {
  // Initialize Supabase client
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

    // 2. Parse and validate request body
    const body = await request.json() as GeneratePresentationRequestBody;
    const { 
      prompt: userPrompt, 
      slides, 
      difficulty,
      theme = 'default',
      background_color = '#ffffff',
      text_color = '#000000',
      accent_color = '#3b82f6',
      include_images = false
    } = body;

    if (!userPrompt || !slides || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. Validate input ranges
    if (slides < 3 || slides > 50) {
      return NextResponse.json({ error: 'Number of slides must be between 3 and 50' }, { status: 400 });
    }

    // 4. Check image service availability and adjust cost accordingly
    const pixabayAvailable = isPixabayAvailable();
    const actuallyIncludeImages = include_images && pixabayAvailable;
    
    if (include_images && !pixabayAvailable) {
      console.warn('User requested images but Pixabay API key is not configured. Proceeding without images.');
    }

    // 5. Calculate credit cost (only charge for images if service is available)
    const creditCost = calculatePresentationCreditCost(slides, actuallyIncludeImages);

    // 6. Check user's credit balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError?.message);
      return NextResponse.json({ error: 'Could not retrieve user profile.' }, { status: 500 });
    }

    const currentCredits = profile.credits || 0;

    if (currentCredits < creditCost) {
      return NextResponse.json({ 
        error: `Insufficient credits. This presentation requires ${creditCost} credits${actuallyIncludeImages ? ' (including images)' : ''}, but you have ${currentCredits} credits available. Please purchase more credits to continue.`,
        required_credits: creditCost,
        available_credits: currentCredits
      }, { status: 402 });
    }

    // 7. Create presentation record in database
    const { data: presentationData, error: presentationError } = await supabase
      .from('presentations')
      .insert({
        user_id: user.id,
        title: 'Generated Presentation',
        prompt: userPrompt,
        difficulty: difficulty,
        slide_count: slides,
        credit_cost: creditCost,
        source_type: 'prompt',
        theme: theme,
        background_color: background_color,
        text_color: text_color,
        accent_color: accent_color,
        is_published: false,
        includes_images: actuallyIncludeImages
      })
      .select('id')
      .single();

    if (presentationError || !presentationData) {
      console.error('Error creating presentation record:', presentationError);
      return NextResponse.json({ 
        error: 'Failed to create presentation record.' 
      }, { status: 500 });
    }

    const presentationId = presentationData.id;

    // 8. Deduct credits BEFORE starting expensive AI generation
    const creditDeductionSuccess = await deductCreditsAndRecordTransaction(
      supabase,
      user.id,
      creditCost,
      presentationId,
      `Presentation generation: ${slides} slides${actuallyIncludeImages ? ' with images' : ''} from prompt`
    );

    if (!creditDeductionSuccess) {
      await supabase.from('presentations').delete().eq('id', presentationId);
      return NextResponse.json({ 
        error: 'Failed to process credit payment.' 
      }, { status: 500 });
    }

    // 9. Create enhanced presentation generation prompt
    const imageInstructions = actuallyIncludeImages ? `
    
CRITICAL: EVERY slide MUST include an "image_keywords" array with 1-3 relevant search terms for image search.
This is MANDATORY for all slides when images are enabled.

Use appropriate layouts for image slides:
- "image-left" or "image-right" for slides with supporting images
- "full-image" for slides where the image is the main focus
- Use "image" type for slides that are primarily visual

Example with images (EVERY slide must have image_keywords):
{
  "title": "Climate Change Effects",
  "content": "Rising sea levels\\n• Coastal flooding increases\\n• Island nations at risk",
  "type": "content",
  "layout": "image-right",
  "image_keywords": ["climate change", "rising sea levels", "coastal flooding"],
  "speaker_notes": "Discuss the visual impact shown in the image"
}

For title slides, use keywords related to the main topic.
For conclusion slides, use keywords related to the summary or results.
For content slides, use keywords related to the specific content.` : '';

    const prompt = `You are an expert presentation designer. Based on the following prompt, create a comprehensive presentation with exactly ${slides} slides.

Requirements:
- Topic: "${userPrompt}"
- Difficulty level: ${difficulty}
- Target audience: ${difficulty} level learners
- Create a clear, logical flow from introduction to conclusion
- Each slide should have concise, engaging content
- Include relevant speaker notes for each slide
- Use appropriate slide types and layouts
- Make content visually appealing and well-structured${imageInstructions}

Generate a JSON response with the following exact structure:
{
  "title": "Clear, engaging presentation title based on the prompt",
  "slides": [
    {
      "title": "Slide title",
      "content": "Slide content with bullet points or key information. Use \\n for line breaks and • for bullet points.",
      "type": "title",
      "layout": "title-only",
      "speaker_notes": "Detailed speaker notes to help presenter explain this slide"${actuallyIncludeImages ? ',\n      "image_keywords": ["keyword1", "keyword2", "keyword3"]' : ''}
    },
    {
      "title": "Slide title",
      "content": "Main content with key points\\n• First key point\\n• Second key point\\n• Third key point",
      "type": "content",
      "layout": "default",
      "speaker_notes": "Speaker notes explaining the content in detail"${actuallyIncludeImages ? ',\n      "image_keywords": ["relevant", "keywords", "here"]' : ''}
    }
  ]
}

Slide types to use:
- "title" for introduction/title slides
- "content" for main content slides
- "image" for image-focused slides (${actuallyIncludeImages ? 'when images are enabled' : 'avoid when images are disabled'})
- "conclusion" for summary/conclusion slides

Layout options:
- "title-only" for title slides
- "default" for standard content
- "two-column" for comparative content${actuallyIncludeImages ? `
- "image-left" for content with supporting image on left
- "image-right" for content with supporting image on right
- "full-image" for slides where image is the main focus` : ''}

Make sure the first slide is a title slide and the last slide is a conclusion slide.
Generate exactly ${slides} slides with engaging, informative content.${actuallyIncludeImages ? '\nREMEMBER: EVERY slide MUST include image_keywords array with relevant search terms for image search.' : ''}`;

    // 10. Generate presentation content using Gemini
    let responseText: string;
    try {
      responseText = await makeGeminiAPICall(prompt, 'Presentation generation');
    } catch (generationError) {
      console.error('Error during presentation generation:', generationError);
      
      // Refund credits if generation fails
      await deductCreditsAndRecordTransaction(
        supabase,
        user.id,
        -creditCost,
        presentationId,
        `Refund for failed presentation generation: ${userPrompt}`
      );

      await supabase.from('presentations').delete().eq('id', presentationId);
      
      return NextResponse.json({ 
        error: 'Failed to generate presentation content. Your credits have been refunded.' 
      }, { status: 500 });
    }

    // 11. Parse the JSON response
    let presentationDataParsed;
    try {
      presentationDataParsed = parseAIResponse(responseText, 'presentation generation');
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      
      await deductCreditsAndRecordTransaction(
        supabase,
        user.id,
        -creditCost,
        presentationId,
        `Refund for failed presentation parsing: ${userPrompt}`
      );
      await supabase.from('presentations').delete().eq('id', presentationId);
      
      return NextResponse.json(
        { error: 'Failed to generate valid presentation content. Credits have been refunded.' },
        { status: 500 }
      );
    }

    if (!presentationDataParsed || !presentationDataParsed.slides) {
      await deductCreditsAndRecordTransaction(
        supabase,
        user.id,
        -creditCost,
        presentationId,
        `Refund for invalid presentation data: ${userPrompt}`
      );
      await supabase.from('presentations').delete().eq('id', presentationId);
      
      return NextResponse.json(
        { error: 'Failed to generate valid presentation content. Credits have been refunded.' },
        { status: 500 }
      );
    }

    // 12. Update presentation title in database
    const presentationTitle = presentationDataParsed.title || 'Generated Presentation';
    await supabase
      .from('presentations')
      .update({ title: presentationTitle })
      .eq('id', presentationId);

    // 13. Process slides and add images if requested
    let processedSlides = presentationDataParsed.slides?.map((slide: any, index: number) => {
      const processedSlide = {
        title: slide.title || `Slide ${index + 1}`,
        content: slide.content || 'No content available',
        type: slide.type || 'content',
        layout: slide.layout || 'default',
        speaker_notes: slide.speaker_notes || '',
        image_keywords: slide.image_keywords || []
      };
      
      // If images are enabled but no keywords provided, generate them from content
      if (actuallyIncludeImages && (!processedSlide.image_keywords || processedSlide.image_keywords.length === 0)) {
        const pixabayService = createPixabayService();
        processedSlide.image_keywords = pixabayService.extractImageKeywords(
          processedSlide.title,
          processedSlide.content,
          processedSlide.type as 'title' | 'content' | 'image' | 'chart' | 'conclusion'
        );
        console.log(`Generated keywords for slide ${index + 1}: ${processedSlide.image_keywords.join(', ')}`);
      }
      
      return processedSlide;
    }) || [];

    // 14. Search for images if requested and available
    let imageSearchResult = { slides: processedSlides, imagesFound: 0, imageErrors: [] as string[] };
    if (actuallyIncludeImages) {
      try {
        console.log('Starting image search for slides...');
        imageSearchResult = await searchImagesForSlides(processedSlides, true);
        processedSlides = imageSearchResult.slides;
        console.log(`Image search completed. Found ${imageSearchResult.imagesFound} images.`);
      } catch (imageError) {
        console.error('Error searching for images:', imageError);
        imageSearchResult.imageErrors.push(`Image search failed: ${imageError}`);
      }
    }

    // 15. Ensure we have the requested number of slides
    if (processedSlides.length < slides) {
      const additionalSlides = slides - processedSlides.length;
      for (let i = 0; i < additionalSlides; i++) {
        processedSlides.push({
          title: `Additional Content ${i + 1}`,
          content: `Additional content related to: ${userPrompt}`,
          type: 'content',
          layout: 'default',
          speaker_notes: 'Additional speaker notes for this content.',
          image_keywords: []
        });
      }
    } else if (processedSlides.length > slides) {
      processedSlides = processedSlides.slice(0, slides);
    }

    // 16. Structure the final response
    const aiGeneratedPresentation: GeneratedPresentation = {
      title: presentationTitle,
      difficulty: difficulty,
      theme,
      background_color,
      text_color,
      accent_color,
      slides: processedSlides
    };

    // 17. Prepare response with detailed image information
    const response = {
      success: true,
      creditCost: creditCost,
      presentationId: presentationId,
      slidesGenerated: aiGeneratedPresentation.slides.length,
      imagesIncluded: actuallyIncludeImages,
      imagesFound: imageSearchResult.imagesFound,
      imageErrors: imageSearchResult.imageErrors,
      pixabayAvailable: pixabayAvailable,
      redirectUrl: `/dashboard/presentations/preview`,
      aiGeneratedPresentation,
      originalPrompt: userPrompt,
      originalSlideCount: slides,
      difficulty: difficulty
    };

    // Add warnings if images were requested but not available
    if (include_images && !pixabayAvailable) {
      response.imageErrors.push('Pixabay API key not configured. Please set PIXABAY_API_KEY environment variable to enable images.');
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error generating presentation:', error);
    
    let errorMessage = 'Failed to generate presentation';
    
    if (error instanceof Error) {
      if (error.message.includes('Failed to generate content with Gemini')) {
        errorMessage = 'Failed to generate content with Gemini API. Please check your API key and try again.';
      } else if (error.message.includes('GEMINI_API_KEY')) {
        errorMessage = 'Gemini API key is not configured. Please check your environment variables.';
      } else if (error.message.includes('PIXABAY_API_KEY')) {
        errorMessage = 'Image search service is not configured. Presentation generated without images.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate presentation.' },
    { status: 405 }
  );
}



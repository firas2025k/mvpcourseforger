// app/api/generate-presentation-from-pdf/route.ts (Credit-based version)
import { NextRequest, NextResponse } from 'next/server';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { generateContentWithGemini } from '@/lib/gemini';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

interface GeneratedSlide {
  title: string;
  content: string;
  type: "title" | "content" | "image" | "chart" | "conclusion";
  layout: "default" | "title-only" | "two-column" | "image-left" | "image-right" | "full-image";
  speaker_notes?: string;
}

interface GeneratedPresentation {
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  theme: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  slides: GeneratedSlide[];
}

// ----- CREDIT CALCULATION FUNCTIONS -----

/**
 * Calculates the credit cost for generating a presentation based on slide count
 * @param slideCount Number of slides
 * @returns Credit cost for the presentation generation
 */
function calculatePresentationCreditCost(slideCount: number): number {
  // Base cost structure:
  // - 1 credit for presentations with 1-5 slides
  // - 2 credits for presentations with 6-15 slides
  // - 3 credits for presentations with 16-30 slides
  // - 4 credits for presentations with 31+ slides
  
  if (slideCount <= 5) return 1;
  if (slideCount <= 15) return 2;
  if (slideCount <= 30) return 3;
  return 4;
}

/**
 * Deducts credits from user's balance and records the transaction
 * @param supabase Supabase client
 * @param userId User ID
 * @param creditCost Number of credits to deduct
 * @param presentationId Presentation ID for transaction reference
 * @param description Transaction description
 * @returns Promise<boolean> Success status
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
        amount: -creditCost, // Negative amount for consumption
        related_entity_id: presentationId,
        description: description
      });

    if (transactionError) {
      console.error('Error recording credit transaction:', transactionError);
      // Don't return false here as the credits were already deducted
    }

    console.log(`Successfully deducted ${creditCost} credits from user ${userId}. New balance: ${newBalance}`);
    return true;
  } catch (error) {
    console.error('Error in credit deduction process:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;
  
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

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const slides = parseInt(formData.get('slides') as string) || 10;
    const difficulty = formData.get('difficulty') as string || 'intermediate';
    const theme = formData.get('theme') as string || 'default';
    const background_color = formData.get('background_color') as string;
    const text_color = formData.get('text_color') as string;
    const accent_color = formData.get('accent_color') as string;

    // 3. Validate inputs
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No PDF file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    if (slides < 3 || slides > 50) {
      return NextResponse.json(
        { success: false, error: 'Number of slides must be between 3 and 50' },
        { status: 400 }
      );
    }

    // 4. Calculate credit cost for this presentation generation
    const creditCost = calculatePresentationCreditCost(slides);

    // 5. Check user's credit balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError?.message);
      return NextResponse.json({ 
        success: false, 
        error: 'Could not retrieve user profile.' 
      }, { status: 500 });
    }

    const currentCredits = profile.credits || 0;

    if (currentCredits < creditCost) {
      return NextResponse.json({ 
        success: false,
        error: `Insufficient credits. This presentation requires ${creditCost} credits, but you have ${currentCredits} credits available. Please purchase more credits to continue.`,
        required_credits: creditCost,
        available_credits: currentCredits
      }, { status: 402 }); // 402 Payment Required
    }

    // 6. Save uploaded file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    tempFilePath = join(tmpdir(), `pdf-${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`);
    await writeFile(tempFilePath, buffer);

    // 7. Load PDF using Langchain
    const loader = new PDFLoader(tempFilePath);
    const docs = await loader.load();

    if (docs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Could not extract text from PDF' },
        { status: 400 }
      );
    }

    // 8. Split text into manageable chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 200,
    });
    const splitDocs = await textSplitter.splitDocuments(docs);

    // Combine chunks for processing (limit to avoid token limits)
    const maxChunks = 10; // Limit to avoid token limits
    const selectedChunks = splitDocs.slice(0, maxChunks);
    const combinedContent = selectedChunks.map(doc => doc.pageContent).join('\n\n');

    // 9. Create presentation record in database (before generation to get presentation ID)
    const { data: presentationData, error: presentationError } = await supabase
      .from('presentations')
      .insert({
        user_id: user.id,
        title: 'Generated from PDF', // Will be updated after AI generation
        prompt: `PDF-based presentation with ${slides} slides`,
        difficulty: difficulty,
        slide_count: slides,
        credit_cost: creditCost,
        source_type: 'pdf',
        source_document_name: file.name,
        theme: theme,
        background_color: background_color,
        text_color: text_color,
        accent_color: accent_color,
        is_published: false
      })
      .select('id')
      .single();

    if (presentationError || !presentationData) {
      console.error('Error creating presentation record:', presentationError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create presentation record.' 
      }, { status: 500 });
    }

    const presentationId = presentationData.id;

    // 10. Deduct credits BEFORE starting expensive AI generation
    const creditDeductionSuccess = await deductCreditsAndRecordTransaction(
      supabase,
      user.id,
      creditCost,
      presentationId,
      `PDF presentation generation: ${slides} slides from ${file.name}`
    );

    if (!creditDeductionSuccess) {
      // Delete the presentation record if credit deduction failed
      await supabase.from('presentations').delete().eq('id', presentationId);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to process credit payment.' 
      }, { status: 500 });
    }

    // 11. Create presentation generation prompt
    const prompt = `You are an expert presentation designer. Based on the following PDF content, create a comprehensive presentation with exactly ${slides} slides.

Requirements:
- Difficulty level: ${difficulty}
- Target audience: ${difficulty} level learners
- Create a clear, logical flow from introduction to conclusion
- Each slide should have concise, engaging content
- Include relevant speaker notes for each slide
- Use appropriate slide types and layouts

PDF Content:
${combinedContent.substring(0, 8000)}

Generate a JSON response with the following exact structure:
{
  "title": "Clear, engaging presentation title based on the PDF content",
  "slides": [
    {
      "title": "Slide title",
      "content": "Slide content with bullet points or key information. Use \\n for line breaks and • for bullet points.",
      "type": "title",
      "layout": "title-only",
      "speaker_notes": "Detailed speaker notes to help presenter explain this slide"
    },
    {
      "title": "Slide title",
      "content": "Main content with key points\\n• First key point\\n• Second key point\\n• Third key point",
      "type": "content",
      "layout": "default",
      "speaker_notes": "Speaker notes explaining the content in detail"
    }
  ]
}

Slide types to use:
- "title" for introduction/title slides
- "content" for main content slides
- "conclusion" for summary/conclusion slides

Layout options:
- "title-only" for title slides
- "default" for standard content
- "two-column" for comparative content

Make sure the first slide is a title slide and the last slide is a conclusion slide.
Generate exactly ${slides} slides.`;

    // 12. Generate presentation content using Gemini
    let responseText: string;
    try {
      responseText = await generateContentWithGemini(prompt, 3);
    } catch (generationError) {
      console.error('Error during presentation generation:', generationError);
      
      // Refund credits if generation fails
      const refundSuccess = await deductCreditsAndRecordTransaction(
        supabase,
        user.id,
        -creditCost, // Negative deduction = refund
        presentationId,
        `Refund for failed PDF presentation generation: ${file.name}`
      );

      if (refundSuccess) {
        console.log(`Refunded ${creditCost} credits to user ${user.id} due to generation failure`);
      }

      // Delete the presentation record
      await supabase.from('presentations').delete().eq('id', presentationId);
      
      return NextResponse.json({ 
        success: false,
        error: 'Failed to generate presentation content. Your credits have been refunded.' 
      }, { status: 500 });
    }

    // 13. Parse the JSON response
    let presentationDataParsed;
    try {
      presentationDataParsed = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      
      // Try to extract JSON from the response if it's wrapped in other text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          presentationDataParsed = JSON.parse(jsonMatch[0]);
        } catch (secondParseError) {
          // Refund credits and delete presentation record
          await deductCreditsAndRecordTransaction(
            supabase,
            user.id,
            -creditCost,
            presentationId,
            `Refund for failed PDF presentation parsing: ${file.name}`
          );
          await supabase.from('presentations').delete().eq('id', presentationId);
          
          return NextResponse.json(
            { success: false, error: 'Failed to generate valid presentation content. Credits have been refunded.' },
            { status: 500 }
          );
        }
      } else {
        // Refund credits and delete presentation record
        await deductCreditsAndRecordTransaction(
          supabase,
          user.id,
          -creditCost,
          presentationId,
          `Refund for failed PDF presentation parsing: ${file.name}`
        );
        await supabase.from('presentations').delete().eq('id', presentationId);
        
        return NextResponse.json(
          { success: false, error: 'Failed to generate valid presentation content. Credits have been refunded.' },
          { status: 500 }
        );
      }
    }

    // 14. Update presentation title in database
    const presentationTitle = presentationDataParsed.title || 'Generated Presentation';
    await supabase
      .from('presentations')
      .update({ title: presentationTitle })
      .eq('id', presentationId);

    // 15. Validate and structure the response
    const aiGeneratedPresentation: GeneratedPresentation = {
      title: presentationTitle,
      difficulty: difficulty as "beginner" | "intermediate" | "advanced",
      theme,
      background_color,
      text_color,
      accent_color,
      slides: presentationDataParsed.slides?.map((slide: any, index: number) => ({
        title: slide.title || `Slide ${index + 1}`,
        content: slide.content || 'No content available',
        type: slide.type || 'content',
        layout: slide.layout || 'default',
        speaker_notes: slide.speaker_notes || ''
      })) || []
    };

    // 16. Ensure we have the requested number of slides
    if (aiGeneratedPresentation.slides.length < slides) {
      // Add additional content slides if needed
      const additionalSlides = slides - aiGeneratedPresentation.slides.length;
      for (let i = 0; i < additionalSlides; i++) {
        aiGeneratedPresentation.slides.push({
          title: `Additional Content ${i + 1}`,
          content: 'Additional content based on the PDF document.',
          type: 'content',
          layout: 'default',
          speaker_notes: 'Additional speaker notes for this content.'
        });
      }
    } else if (aiGeneratedPresentation.slides.length > slides) {
      // Trim excess slides if generated more than requested
      aiGeneratedPresentation.slides = aiGeneratedPresentation.slides.slice(0, slides);
    }

    return NextResponse.json({
      success: true,
      creditCost: creditCost,
      presentationId: presentationId,
      aiGeneratedPresentation
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to process PDF and generate presentation';
    
    if (error instanceof Error) {
      if (error.message.includes('Failed to generate content with Gemini')) {
        errorMessage = 'Failed to generate content with Gemini API. Please check your API key and try again.';
      } else if (error.message.includes('GEMINI_API_KEY')) {
        errorMessage = 'Gemini API key is not configured. Please check your environment variables.';
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
  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (cleanupError) {
        console.error('Failed to cleanup temporary file:', cleanupError);
      }
    }
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload PDF.' },
    { status: 405 }
  );
}


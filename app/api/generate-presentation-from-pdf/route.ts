// app/api/generate-presentation-from-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { generateContentWithGemini } from '@/lib/gemini';

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

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;
  
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const slides = parseInt(formData.get('slides') as string) || 10;
    const difficulty = formData.get('difficulty') as string || 'intermediate';
    const theme = formData.get('theme') as string || 'default';
    const background_color = formData.get('background_color') as string;
    const text_color = formData.get('text_color') as string;
    const accent_color = formData.get('accent_color') as string;

    // Validate inputs
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

    // Save uploaded file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    tempFilePath = join(tmpdir(), `pdf-${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`);
    await writeFile(tempFilePath, buffer);

    // Load PDF using Langchain
    const loader = new PDFLoader(tempFilePath);
    const docs = await loader.load();

    if (docs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Could not extract text from PDF' },
        { status: 400 }
      );
    }

    // Split text into manageable chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 200,
    });
    const splitDocs = await textSplitter.splitDocuments(docs);

    // Combine chunks for processing (limit to avoid token limits)
    const maxChunks = 10; // Limit to avoid token limits
    const selectedChunks = splitDocs.slice(0, maxChunks);
    const combinedContent = selectedChunks.map(doc => doc.pageContent).join('\n\n');

    // Create presentation generation prompt
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

    // Generate presentation content using your existing Gemini library
    const responseText = await generateContentWithGemini(prompt, 3);

    // Parse the JSON response
    let presentationData;
    try {
      presentationData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      
      // Try to extract JSON from the response if it's wrapped in other text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          presentationData = JSON.parse(jsonMatch[0]);
        } catch (secondParseError) {
          return NextResponse.json(
            { success: false, error: 'Failed to generate valid presentation content' },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: 'Failed to generate valid presentation content' },
          { status: 500 }
        );
      }
    }

    // Validate and structure the response
    const aiGeneratedPresentation: GeneratedPresentation = {
      title: presentationData.title || 'Generated Presentation',
      difficulty: difficulty as "beginner" | "intermediate" | "advanced",
      theme,
      background_color,
      text_color,
      accent_color,
      slides: presentationData.slides?.map((slide: any, index: number) => ({
        title: slide.title || `Slide ${index + 1}`,
        content: slide.content || 'No content available',
        type: slide.type || 'content',
        layout: slide.layout || 'default',
        speaker_notes: slide.speaker_notes || ''
      })) || []
    };

    // Ensure we have the requested number of slides
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


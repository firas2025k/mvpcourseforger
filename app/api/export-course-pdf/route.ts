import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import puppeteer from 'puppeteer';

// Types for the PDF export functionality
interface CourseData {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prompt: string;
  chapters: ChapterData[];
}

interface ChapterData {
  id: string;
  title: string;
  order_index: number;
  lessons: LessonData[];
}

interface LessonData {
  id: string;
  title: string;
  content: string;
  order_index: number;
  quizzes?: QuizData[];
}

interface QuizData {
  id: string;
  question: string;
  correct_answer: string;
  wrong_answers: string[];
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Authenticate user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('Error fetching user or no user:', userError);
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  let requestData: { courseId: string };
  try {
    requestData = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { courseId } = requestData;

  if (!courseId) {
    return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
  }

  console.log(`[PDF Export] Starting PDF generation for course ${courseId} by user ${user.id}`);

  let browser;
  try {
    // Fetch course data from Supabase
    console.log(`[PDF Export] Fetching course data for course ${courseId}`);
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        difficulty,
        prompt,
        chapters (
          id,
          title,
          order_index,
          lessons (
            id,
            title,
            content,
            order_index,
            quizzes (
              id,
              question,
              correct_answer,
              wrong_answers
            )
          )
        )
      `)
      .eq('id', courseId)
      .eq('user_id', user.id) // Ensure user owns the course
      .single();

    if (courseError) {
      console.error('[PDF Export] Error fetching course:', courseError);
      return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 });
    }

    if (!courseData) {
      console.error('[PDF Export] No course data returned');
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    console.log(`[PDF Export] Course data fetched successfully:`, {
      title: courseData.title,
      chaptersCount: courseData.chapters?.length || 0,
      lessonsCount: courseData.chapters?.reduce((total, chapter) => total + (chapter.lessons?.length || 0), 0) || 0
    });

    // Sort chapters and lessons by order_index
    const sortedCourse: CourseData = {
      ...courseData,
      chapters: (courseData.chapters || [])
        .sort((a, b) => a.order_index - b.order_index)
        .map(chapter => ({
          ...chapter,
          lessons: (chapter.lessons || []).sort((a, b) => a.order_index - b.order_index)
        }))
    };

    console.log(`[PDF Export] Course data sorted, launching Puppeteer...`);

    // Launch Puppeteer with debugging options
    browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 800 });

    console.log(`[PDF Export] Puppeteer launched, generating HTML content...`);

    // Generate HTML content for the course
    const htmlContent = generateCourseHTML(sortedCourse);
    
    console.log(`[PDF Export] HTML content generated (${htmlContent.length} characters), setting page content...`);
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    console.log(`[PDF Export] Page content set, taking screenshot for debugging...`);

    // Take a screenshot for debugging
    const screenshotBuffer = await page.screenshot({ 
      fullPage: true, 
      type: 'png' 
    });
    
    console.log(`[PDF Export] Screenshot taken (${screenshotBuffer.length} bytes), generating PDF...`);

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; margin: 0 auto; color: #666; width: 100%; text-align: center;">
          ${sortedCourse.title}
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; margin: 0 auto; color: #666; width: 100%; text-align: center;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
    });

    console.log(`[PDF Export] PDF generated successfully (${pdfBuffer.length} bytes)`);

    // Set response headers for PDF download
    const fileName = `${sortedCourse.title.replace(/[^a-zA-Z0-9]/g, '_')}_course.pdf`;
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error: any) {
    console.error('[PDF Export] PDF generation error:', error);
    console.error('[PDF Export] Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to generate PDF', 
      details: error.message 
    }, { status: 500 });
  } finally {
    if (browser) {
      console.log(`[PDF Export] Closing browser...`);
      await browser.close();
    }
  }
}

function generateCourseHTML(course: CourseData): string {
  console.log(`[PDF Export] Generating HTML for course: ${course.title}`);
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${course.title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
        }
        
        .course-header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #3b82f6;
        }
        
        .course-title {
          font-size: 2.5em;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 10px;
        }
        
        .course-meta {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 15px;
          font-size: 0.9em;
          color: #6b7280;
        }
        
        .difficulty-badge {
          background-color: #f3f4f6;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 500;
        }
        
        .difficulty-beginner { background-color: #dcfce7; color: #166534; }
        .difficulty-intermediate { background-color: #fef3c7; color: #92400e; }
        .difficulty-advanced { background-color: #fecaca; color: #991b1b; }
        
        .course-prompt {
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin: 30px 0;
          border-left: 4px solid #3b82f6;
        }
        
        .course-prompt h3 {
          margin-top: 0;
          color: #1e40af;
        }
        
        .chapter {
          margin: 40px 0;
          page-break-inside: avoid;
        }
        
        .chapter-title {
          font-size: 1.8em;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .lesson {
          margin: 30px 0;
          padding-left: 20px;
        }
        
        .lesson-title {
          font-size: 1.3em;
          font-weight: 600;
          color: #374151;
          margin-bottom: 15px;
        }
        
        .lesson-content {
          margin-bottom: 20px;
          text-align: justify;
        }
        
        .lesson-content p {
          margin-bottom: 12px;
        }
        
        .quiz-section {
          background-color: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
          border: 1px solid #e5e7eb;
        }
        
        .quiz-title {
          font-size: 1.1em;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 15px;
        }
        
        .quiz-question {
          margin-bottom: 20px;
        }
        
        .question-text {
          font-weight: 500;
          margin-bottom: 8px;
          color: #374151;
        }
        
        .answer-options {
          margin-left: 20px;
        }
        
        .answer-option {
          margin: 5px 0;
          padding: 5px 0;
        }
        
        .correct-answer {
          color: #059669;
          font-weight: 500;
        }
        
        .wrong-answer {
          color: #6b7280;
        }
        
        .page-break {
          page-break-before: always;
        }
        
        .debug-info {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          padding: 10px;
          margin: 10px 0;
          border-radius: 4px;
          font-size: 0.8em;
          color: #991b1b;
        }
        
        @media print {
          body { margin: 0; }
          .course-header { page-break-after: avoid; }
          .chapter { page-break-inside: avoid; }
          .debug-info { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="debug-info">
        Debug Info: Course ID: ${course.id}, Chapters: ${course.chapters.length}, 
        Total Lessons: ${course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)}
      </div>
      
      <div class="course-header">
        <h1 class="course-title">${course.title}</h1>
        <div class="course-meta">
          <span class="difficulty-badge difficulty-${course.difficulty}">
            ${course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
          </span>
          <span>${course.chapters.length} Chapter${course.chapters.length !== 1 ? 's' : ''}</span>
          <span>${course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)} Lesson${course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0) !== 1 ? 's' : ''}</span>
        </div>
      </div>
      
      <div class="course-prompt">
        <h3>Course Overview</h3>
        <p>${course.prompt || 'No course description available.'}</p>
      </div>
      
      ${course.chapters.length === 0 ? 
        '<div class="debug-info">No chapters found for this course.</div>' :
        course.chapters.map((chapter, chapterIndex) => `
          <div class="chapter ${chapterIndex > 0 ? 'page-break' : ''}">
            <h2 class="chapter-title">Chapter ${chapter.order_index}: ${chapter.title}</h2>
            
            ${chapter.lessons.length === 0 ? 
              '<div class="debug-info">No lessons found for this chapter.</div>' :
              chapter.lessons.map(lesson => `
                <div class="lesson">
                  <h3 class="lesson-title">${lesson.title}</h3>
                  <div class="lesson-content">
                    ${lesson.content ? 
                      lesson.content.split('\n').map(paragraph => 
                        paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ''
                      ).join('') :
                      '<p><em>No content available for this lesson.</em></p>'
                    }
                  </div>
                  
                  ${lesson.quizzes && lesson.quizzes.length > 0 ? `
                    <div class="quiz-section">
                      <h4 class="quiz-title">📝 Knowledge Check</h4>
                      ${lesson.quizzes.map((quiz, quizIndex) => `
                        <div class="quiz-question">
                          <div class="question-text">
                            <strong>Question ${quizIndex + 1}:</strong> ${quiz.question}
                          </div>
                          <div class="answer-options">
                            <div class="answer-option correct-answer">
                              ✓ ${quiz.correct_answer}
                            </div>
                            ${quiz.wrong_answers.map(wrongAnswer => `
                              <div class="answer-option wrong-answer">
                                ✗ ${wrongAnswer}
                              </div>
                            `).join('')}
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')
            }
          </div>
        `).join('')
      }
      
      <div style="margin-top: 50px; text-align: center; color: #6b7280; font-size: 0.9em;">
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <p>This course was created using AI-powered content generation</p>
      </div>
    </body>
    </html>
  `;
  
  console.log(`[PDF Export] HTML generated (${html.length} characters)`);
  return html;
}


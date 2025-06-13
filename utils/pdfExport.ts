// utils/pdfExport.ts - CRITICAL FINAL FIX (COPY THIS ENTIRELY)

interface Lesson {
    id: string;
    title: string;
    content: string;
    order_index: number;
  }
  
  interface Chapter {
    id: string;
    title: string;
    order_index: number;
    lessons: Lesson[];
  }
  
  interface CourseDetail {
    id: string;
    title: string;
    description?: string | null;
    prompt?: string | null;
    chapters: Chapter[];
  }
  
  export interface ExportToPdfOptions {
    courseId: string;
    courseTitle: string;
    onStart?: () => void;
    onSuccess?: () => void;
    onError?: (error: string) => void;
    onComplete?: () => void;
  }
  
  export const exportCourseToPdf = async (options: ExportToPdfOptions): Promise<void> => {
    const { courseId, courseTitle, onStart, onSuccess, onError, onComplete } = options;
    
    onStart?.();
    let container: HTMLDivElement | null = null; // Declare container outside try for finally block
    
    try {
      // Fetch course details
      const response = await fetch(`/api/course-details/${courseId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch course details for PDF export.');
      }
      const courseDetails: CourseDetail = await response.json();
  
      // Check if we have data
      if (!courseDetails.chapters || courseDetails.chapters.length === 0) {
        throw new Error('No chapters found');
      }
  
      // Build HTML content with inline styles (critical for PDF generation)
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${courseDetails.title}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              color: black !important;
            }
            
            body { 
              font-family: Arial, sans-serif !important;
              font-size: 14px !important;
              line-height: 1.6 !important;
              color: black !important;
              background: white !important;
              /* *** IMPORTANT ***: This line MUST be REMOVED or commented out. */
              /* padding: 20px !important; */ 
              max-width: 100% !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .course-title {
              font-size: 24px !important;
              font-weight: bold !important;
              color: black !important;
              margin-bottom: 30px !important;
              text-align: center !important;
              page-break-after: avoid !important;
              display: block !important;
            }
            
            .chapter-title {
              font-size: 18px !important;
              font-weight: bold !important;
              color: black !important;
              margin: 25px 0 15px 0 !important;
              page-break-after: avoid !important;
              border-bottom: 2px solid black !important;
              padding-bottom: 8px !important;
              display: block !important;
            }
            
            .lesson-title {
              font-size: 16px !important;
              font-weight: bold !important;
              color: black !important;
              margin: 20px 0 10px 0 !important;
              page-break-after: avoid !important;
              display: block !important;
            }
            
            .lesson-content {
              font-size: 14px !important;
              line-height: 1.6 !important;
              margin-bottom: 20px !important;
              color: black !important;
              display: block !important;
            }
            
            .lesson-content p {
              margin-bottom: 10px !important;
              color: black !important;
              display: block !important;
            }
            
            h1, h2, h3, p, div {
              color: black !important;
            }
          </style>
        </head>
        <body>
      `;
      
      // Title
      htmlContent += `<h1 class="course-title" style="color: black !important; font-size: 24px !important; font-weight: bold !important;">${courseDetails.title}</h1>`;
  
      // Add content for each chapter
      courseDetails.chapters
        .sort((a, b) => a.order_index - b.order_index)
        .forEach((chapter) => {
          htmlContent += `<h2 class="chapter-title" style="color: black !important; font-size: 18px !important; font-weight: bold !important;">Chapter ${chapter.order_index}: ${chapter.title}</h2>`;
          
          if (chapter.lessons && chapter.lessons.length > 0) {
            chapter.lessons
              .sort((a, b) => a.order_index - b.order_index)
              .forEach((lesson) => {
                htmlContent += `<h3 class="lesson-title" style="color: black !important; font-size: 16px !important; font-weight: bold !important;">Lesson ${lesson.order_index}: ${lesson.title}</h3>`;
                
                if (lesson.content && lesson.content.trim()) {
                  // Process content - convert newlines to paragraphs
                  const processedContent = lesson.content
                    .split('\n\n')
                    .map(paragraph => paragraph.trim())
                    .filter(paragraph => paragraph.length > 0)
                    .map(paragraph => `<p style="color: black !important; font-size: 14px !important; margin-bottom: 10px !important;">${paragraph.replace(/\n/g, '<br>')}</p>`)
                    .join('');
                  
                  htmlContent += `<div class="lesson-content" style="color: black !important; font-size: 14px !important;">${processedContent}</div>`;
                } else {
                  htmlContent += `<div class="lesson-content" style="color: black !important;"><p style="color: black !important;"><em>No content available</em></p></div>`;
                }
              });
          } else {
            htmlContent += `<div class="lesson-content" style="color: black !important;"><p style="color: black !important;"><em>No lessons in this chapter</em></p></div>`;
          }
        });
  
      htmlContent += '</body></html>';
  
      console.log('=== FINAL HTML DEBUG ===');
      console.log('HTML length:', htmlContent.length);
      console.log('Contains body tag:', htmlContent.includes('<body>'));
      console.log('Contains content:', htmlContent.includes('class="lesson-content"'));
      console.log('Sample HTML content:', htmlContent.substring(1000, 1500));
  
      // Create a temporary container
      container = document.createElement('div');
      container.innerHTML = htmlContent;
      
      // Make sure it's properly sized and OFF-SCREEN for rendering by html2canvas
      container.style.position = 'absolute'; // *** IMPORTANT ***: Set to absolute.
      container.style.top = '-9999px'; // *** IMPORTANT ***: Position far off-screen.
      container.style.left = '-9999px'; // *** IMPORTANT ***: Position far off-screen.
      container.style.width = '210mm'; // Keep this fixed width for A4 content wrapping
      container.style.minHeight = '0'; // Allow height to be determined by content
      container.style.backgroundColor = 'white';
      container.style.color = 'black';
      container.style.zIndex = '-1'; // Ensure it's behind everything
      // *** IMPORTANT ***: REMOVE or comment out THIS LINE. It prevents html2canvas capture.
      // container.style.visibility = 'hidden'; 
      container.style.opacity = '0'; // *** IMPORTANT ***: Use opacity for hiding (sufficient for html2canvas).
      container.style.overflow = 'visible'; // Ensure all content is rendered, not clipped
      
      document.body.appendChild(container);
  
      // Wait longer for styles to apply and content to render
      await new Promise(resolve => setTimeout(resolve, 1500)); // Increased delay to 1500ms for robustness
  
      console.log('Container dimensions:', {
        width: container.offsetWidth,
        height: container.offsetHeight,
        children: container.children.length,
        textContent: container.textContent?.substring(0, 100) + '...'
      });
  
      // Check if content is actually visible (should now be true)
      const firstParagraph = container.querySelector('p');
      if (firstParagraph) {
        const computedStyle = window.getComputedStyle(firstParagraph);
        console.log('First paragraph computed style:', {
          color: computedStyle.color,
          fontSize: computedStyle.fontSize,
          display: computedStyle.display,
          // This should now show 'visible' or 'block' because `visibility: hidden` is removed.
          visibility: computedStyle.visibility 
        });
      }
  
      // Import html2pdf
      const html2pdf = (await import('html2pdf.js')).default;
      
      // PDF options - simplified and more reliable
      const safeTitle = courseDetails.title.replace(/[^a-z0-9_\-\s]/gi, '_').replace(/\s+/g, '_');
      
      const opt = {
        /* --- CRITICAL CHANGE: Manage margins here (0.5 inches all around) --- */
        margin: [0.5, 0.5, 0.5, 0.5], // top, left, bottom, right
        filename: `${safeTitle}.pdf`,
        image: { 
          type: 'jpeg', 
          quality: 0.98 
        },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: true,
          backgroundColor: '#ffffff',
          /* *** IMPORTANT ***: These lines MUST be REMOVED or commented out. */
          // foregroundColor: '#000000',
          // width: container.offsetWidth,
          // height: container.offsetHeight
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait'
        }
      };
  
      console.log('Starting PDF generation with options:', opt);
      
      // Generate PDF - let html2pdf handle the canvas internally
      await html2pdf()
        .from(container)
        .set(opt)
        .save(); // Use .save() to trigger download
      
      console.log('PDF generation completed successfully');
      
      onSuccess?.();
  
    } catch (error) {
      console.error('Error in PDF export:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (onError) {
        onError(errorMessage);
      } else {
        alert(`Failed to export PDF: ${errorMessage}`);
      }
    } finally {
      // Clean up the temporary container
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }
      onComplete?.();
    }
  };
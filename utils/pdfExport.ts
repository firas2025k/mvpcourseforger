// Updated pdfExport.ts utility for server-side PDF generation
import { toast } from 'sonner'; // Assuming you're using sonner for notifications

export interface PdfExportOptions {
  courseId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const handleSavePdf = async ({ 
  courseId, 
  onSuccess, 
  onError 
}: PdfExportOptions) => {
  try {
    // Show loading state
    const loadingToast = toast.loading('Generating PDF...', {
      description: 'This may take a few moments'
    });

    // Make API call to generate PDF
    const response = await fetch('/api/export-course-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courseId }),
    });

    // Dismiss loading toast
    toast.dismiss(loadingToast);

    if (!response.ok) {
      // Handle different error status codes
      let errorMessage = 'Failed to generate PDF';
      
      if (response.status === 401) {
        errorMessage = 'You must be logged in to export courses';
      } else if (response.status === 404) {
        errorMessage = 'Course not found or you do not have access to it';
      } else if (response.status === 500) {
        errorMessage = 'Server error occurred while generating PDF';
      } else {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If we can't parse the error response, use the default message
        }
      }
      
      throw new Error(errorMessage);
    }

    // Get the PDF blob from the response
    const pdfBlob = await response.blob();
    
    // Validate that we received a PDF
    if (pdfBlob.type !== 'application/pdf') {
      throw new Error('Invalid response format - expected PDF');
    }

    // Create download link
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    
    // Extract filename from Content-Disposition header if available
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `course-${courseId}.pdf`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Show success message
    toast.success('PDF downloaded successfully!', {
      description: `Course exported as ${filename}`
    });

    // Call success callback if provided
    onSuccess?.();

  } catch (error: any) {
    console.error('PDF export error:', error);
    
    const errorMessage = error.message || 'An unexpected error occurred';
    
    // Show error message
    toast.error('PDF Export Failed', {
      description: errorMessage
    });

    // Call error callback if provided
    onError?.(errorMessage);
  }
};

// Alternative function for simpler usage (backward compatibility)
export const exportCoursePdf = async (courseId: string) => {
  return handleSavePdf({ courseId });
};

// Utility function to check if PDF export is supported
export const isPdfExportSupported = (): boolean => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check if required APIs are available
  return !!(
    window.fetch && 
    window.URL && 
    window.URL.createObjectURL &&
    document.createElement
  );
};

// Utility function to estimate PDF generation time based on course size
export const estimatePdfGenerationTime = (chapterCount: number, lessonCount: number): string => {
  // Rough estimation based on content size
  const baseTime = 5; // Base 5 seconds
  const timePerChapter = 2; // 2 seconds per chapter
  const timePerLesson = 1; // 1 second per lesson
  
  const estimatedSeconds = baseTime + (chapterCount * timePerChapter) + (lessonCount * timePerLesson);
  
  if (estimatedSeconds < 10) {
    return 'a few seconds';
  } else if (estimatedSeconds < 30) {
    return 'about 15-30 seconds';
  } else if (estimatedSeconds < 60) {
    return 'about 30-60 seconds';
  } else {
    return 'about 1-2 minutes';
  }
};


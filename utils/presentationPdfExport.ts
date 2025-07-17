import { toast } from "sonner";

export interface PresentationPdfExportOptions {
  presentationId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const handleSavePresentationPdf = async ({
  presentationId,
  onSuccess,
  onError,
}: PresentationPdfExportOptions) => {
  try {
    const loadingToast = toast.loading("Generating PDF...", {
      description: "This may take a few moments",
    });
    const response = await fetch("/api/export-presentation-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ presentationId }),
    });
    toast.dismiss(loadingToast);
    if (!response.ok) {
      let errorMessage = "Failed to generate PDF";
      if (response.status === 401) {
        errorMessage = "You must be logged in to export presentations";
      } else if (response.status === 404) {
        errorMessage = "Presentation not found or you do not have access to it";
      } else if (response.status === 500) {
        errorMessage = "Server error occurred while generating PDF";
      } else {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {}
      }
      throw new Error(errorMessage);
    }
    const pdfBlob = await response.blob();
    if (pdfBlob.type !== "application/pdf") {
      throw new Error("Invalid response format - expected PDF");
    }
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = `presentation-${presentationId}.pdf`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success("PDF downloaded successfully!", {
      description: `Presentation exported as ${filename}`,
    });
    onSuccess?.();
  } catch (error: any) {
    console.error("PDF export error:", error);
    const errorMessage = error.message || "An unexpected error occurred";
    toast.error("PDF Export Failed", {
      description: errorMessage,
    });
    onError?.(errorMessage);
  }
};

export const exportPresentationPdf = async (presentationId: string) => {
  return handleSavePresentationPdf({ presentationId });
};

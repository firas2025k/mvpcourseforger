"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MarkdownSlideRenderer from "@/components/dashboard/presentations/MarkdownSlideRenderer";
import type { Slide } from "@/types/presentation";

interface PresentationData {
  id: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  slide_count: number;
  theme: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  created_at: string;
  slides: Slide[];
}

export default function PrintPresentationPage() {
  const params = useParams();
  const presentationId = params.presentationId as string;
  const [presentation, setPresentation] = useState<PresentationData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (presentationId) {
      fetchPresentation();
    }
    // eslint-disable-next-line
  }, [presentationId]);

  const fetchPresentation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/presentation-details/${presentationId}`
      );
      if (!response.ok) return;
      const data = await response.json();
      setPresentation(data.presentation);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !presentation) {
    return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;
  }

  return (
    <div>
      <style>{`
        @media print {
          .slide-print-page { page-break-after: always; }
        }
        .slide-print-page {
          min-height: 90vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: ${presentation.background_color};
          color: ${presentation.text_color};
          padding: 48px 0;
        }
      `}</style>
      <div style={{ textAlign: "center", margin: "32px 0" }}>
        <h1 style={{ fontSize: 40, fontWeight: 700 }}>{presentation.title}</h1>
        <div
          style={{
            fontSize: 18,
            color: presentation.accent_color,
            marginTop: 8,
          }}
        >
          {presentation.slide_count} Slides
        </div>
      </div>
      {presentation.slides.map((slide, idx) => (
        <div className="slide-print-page" key={slide.id}>
          <div style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
            <MarkdownSlideRenderer
              content={slide.content}
              textColor={presentation.text_color}
              accentColor={presentation.accent_color}
              imageUrl={slide.image_url}
              imageAlt={slide.image_alt}
              title={slide.title}
              layout={slide.layout}
            />
            {slide.speaker_notes && (
              <div
                style={{
                  marginTop: 32,
                  background: "#e0e7ef",
                  color: "#444",
                  borderRadius: 8,
                  padding: 16,
                  fontSize: 15,
                  maxWidth: 700,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                <b>Speaker Notes:</b> {slide.speaker_notes}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

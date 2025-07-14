// types/presentation.ts
// TypeScript types for the presentation feature

export interface Presentation {
  id: string;
  user_id: string;
  title: string;
  prompt?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  slide_count: number;
  is_published: boolean;
  is_archived: boolean;
  created_at: string;
  source_type: string;
  source_document_name?: string;
  source_document_metadata?: any;
  theme: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  credit_cost: number;
  includes_images: boolean;
  slides?: Slide[];
}

export interface Slide {
  id: string;
  presentation_id: string;
  title: string;
  content: string;
  type: 'title' | 'content' | 'image' | 'chart' | 'conclusion';
  layout: 'default' | 'title-only' | 'two-column' | 'image-left' | 'image-right' | 'full-image';
  background_image_url?: string;
  order_index: number;
  speaker_notes?: string;
  animation_type: string;
  created_at: string;
  image_url?: string;
  image_alt?: string;
  image_keywords?: string[];
  // Additional fields for presentation progress tracking
  is_viewed?: boolean;
  viewed_at?: string;
}

export interface PresentationProgress {
  id: string;
  user_id: string;
  slide_id: string;
  is_viewed: boolean;
  viewed_at?: string;
}

// API Request/Response types
export interface GeneratePresentationRequest {
  prompt: string;
  slides: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  theme?: string;
  background_color?: string;
  text_color?: string;
  accent_color?: string;
  includes_images?: boolean;
}

export interface AiSlide {
  title: string;
  content: string;
  type: 'title' | 'content' | 'image' | 'chart' | 'conclusion';
  layout: 'default' | 'title-only' | 'two-column' | 'image-left' | 'image-right' | 'full-image';
  speaker_notes?: string;
  image_url?: string;
  image_alt?: string;
  image_keywords?: string[];
}

export interface PresentationOutline {
  presentationTitle: string;
  slides: {
    slideTitle: string;
    slideType: 'title' | 'content' | 'image' | 'chart' | 'conclusion';
    slideLayout: 'default' | 'title-only' | 'two-column' | 'image-left' | 'image-right' | 'full-image';
  }[];
}

export interface SlideContent {
  content: string;
  speaker_notes?: string;
  image_url?: string;
  image_alt?: string;
  image_keywords?: string[];
}

export interface GeneratePresentationResponse {
  originalPrompt: string;
  originalSlideCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  theme: string;
  aiGeneratedPresentation: {
    title: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    theme: string;
    background_color: string;
    text_color: string;
    accent_color: string;
    slides: AiSlide[];
  };
}

export interface SavePresentationRequest {
  title: string;
  prompt: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  theme: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  includes_images?: boolean;
  slides: {
    title: string;
    content: string;
    type: 'title' | 'content' | 'image' | 'chart' | 'conclusion';
    layout: 'default' | 'title-only' | 'two-column' | 'image-left' | 'image-right' | 'full-image';
    speaker_notes?: string;
    order_index: number;
    image_url?: string;
    image_alt?: string;
    image_keywords?: string[];
  }[];
}

// Plan limits for presentations
export interface PlanLimits {
  max_presentations: number;
  max_slides_per_presentation: number;
}

// Presentation themes
export interface PresentationTheme {
  name: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  font_family: string;
}

export const PRESENTATION_THEMES: PresentationTheme[] = [
  {
    name: 'default',
    background_color: '#ffffff',
    text_color: '#000000',
    accent_color: '#3b82f6',
    font_family: 'Inter, sans-serif'
  },
  {
    name: 'dark',
    background_color: '#1f2937',
    text_color: '#ffffff',
    accent_color: '#60a5fa',
    font_family: 'Inter, sans-serif'
  },
  {
    name: 'corporate',
    background_color: '#f8fafc',
    text_color: '#1e293b',
    accent_color: '#0f172a',
    font_family: 'Inter, sans-serif'
  },
  {
    name: 'creative',
    background_color: '#fef3c7',
    text_color: '#92400e',
    accent_color: '#d97706',
    font_family: 'Inter, sans-serif'
  },
  {
    name: 'minimal',
    background_color: '#fafafa',
    text_color: '#262626',
    accent_color: '#525252',
    font_family: 'Inter, sans-serif'
  }
];

// Slide layouts configuration
export interface SlideLayoutConfig {
  name: string;
  description: string;
  preview: string;
}

export const SLIDE_LAYOUTS: SlideLayoutConfig[] = [
  {
    name: 'default',
    description: 'Standard layout with title and content',
    preview: 'Title at top, content below'
  },
  {
    name: 'title-only',
    description: 'Large title slide',
    preview: 'Centered large title'
  },
  {
    name: 'two-column',
    description: 'Content split into two columns',
    preview: 'Left and right content areas'
  },
  {
    name: 'image-left',
    description: 'Image on left, content on right',
    preview: 'Image | Content'
  },
  {
    name: 'image-right',
    description: 'Content on left, image on right',
    preview: 'Content | Image'
  },
  {
    name: 'full-image',
    description: 'Full background image with overlay text',
    preview: 'Background image with text overlay'
  }
];
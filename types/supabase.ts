export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chapters: {
        Row: {
          id: string
          course_id: string | null
          title: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          course_id?: string | null
          title: string
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string | null
          title?: string
          order_index?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      companions: {
        Row: {
          id: string
          author: string | null
          name: string
          subject: string | null
          topic: string | null
          description: string | null
          created_at: string
          duration: number | null
          style: string | null
          voice: string | null
        }
        Insert: {
          id?: string
          author?: string | null
          name: string
          subject?: string | null
          topic?: string | null
          description?: string | null
          created_at?: string
          duration?: number | null
          style?: string | null
          voice?: string | null
        }
        Update: {
          id?: string
          author?: string | null
          name?: string
          subject?: string | null
          topic?: string | null
          description?: string | null
          created_at?: string
          duration?: number | null
          style?: string | null
          voice?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companions_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      courses: {
        Row: {
          id: string
          user_id: string | null
          title: string
          prompt: string | null
          difficulty: ("beginner" | "intermediate" | "advanced") | null
          chapter_count: number | null
          lessons_per_chapter: number | null
          is_published: boolean
          is_archived: boolean
          created_at: string
          source_type: string | null
          source_document_name: string | null
          source_document_metadata: Json | null
          price_cents: number | null
          is_for_sale: boolean
          credit_cost: number
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          prompt?: string | null
          difficulty?: ("beginner" | "intermediate" | "advanced") | null
          chapter_count?: number | null
          lessons_per_chapter?: number | null
          is_published?: boolean
          is_archived?: boolean
          created_at?: string
          source_type?: string | null
          source_document_name?: string | null
          source_document_metadata?: Json | null
          price_cents?: number | null
          is_for_sale?: boolean
          credit_cost?: number
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          prompt?: string | null
          difficulty?: ("beginner" | "intermediate" | "advanced") | null
          chapter_count?: number | null
          lessons_per_chapter?: number | null
          is_published?: boolean
          is_archived?: boolean
          created_at?: string
          source_type?: string | null
          source_document_name?: string | null
          source_document_metadata?: Json | null
          price_cents?: number | null
          is_for_sale?: boolean
          credit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "courses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          type: "purchase" | "consumption" | "adjustment"
          amount: number
          related_entity_id: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: "purchase" | "consumption" | "adjustment"
          amount: number
          related_entity_id?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: "purchase" | "consumption" | "adjustment"
          amount?: number
          related_entity_id?: string | null
          description?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      enrollments: {
        Row: {
          id: string
          user_id: string | null
          course_id: string | null
          enrolled_at: string
          is_completed: boolean
        }
        Insert: {
          id?: string
          user_id?: string | null
          course_id?: string | null
          enrolled_at?: string
          is_completed?: boolean
        }
        Update: {
          id?: string
          user_id?: string | null
          course_id?: string | null
          enrolled_at?: string
          is_completed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      lessons: {
        Row: {
          id: string
          chapter_id: string | null
          title: string
          content: string | null
          type: ("text" | "quiz" | "video") | null
          video_url: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          chapter_id?: string | null
          title: string
          content?: string | null
          type?: ("text" | "quiz" | "video") | null
          video_url?: string | null
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          chapter_id?: string | null
          title?: string
          content?: string | null
          type?: ("text" | "quiz" | "video") | null
          video_url?: string | null
          order_index?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          }
        ]
      }
      plans: {
        Row: {
          id: string
          name: string
          course_limit: number
          price_cents: number
          stripe_price_id: string | null
          created_at: string
          description: string | null
          features: string[] | null
          max_chapters: number
          max_lessons_per_chapter: number
          max_presentations: number | null
          max_slides_per_presentation: number | null
          credit_amount: number
        }
        Insert: {
          id?: string
          name: string
          course_limit: number
          price_cents: number
          stripe_price_id?: string | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          max_chapters?: number
          max_lessons_per_chapter?: number
          max_presentations?: number | null
          max_slides_per_presentation?: number | null
          credit_amount?: number
        }
        Update: {
          id?: string
          name?: string
          course_limit?: number
          price_cents?: number
          stripe_price_id?: string | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          max_chapters?: number
          max_lessons_per_chapter?: number
          max_presentations?: number | null
          max_slides_per_presentation?: number | null
          credit_amount?: number
        }
        Relationships: []
      }
      presentation_progress: {
        Row: {
          id: string
          user_id: string | null
          slide_id: string | null
          is_viewed: boolean
          viewed_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          slide_id?: string | null
          is_viewed?: boolean
          viewed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          slide_id?: string | null
          is_viewed?: boolean
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presentation_progress_slide_id_fkey"
            columns: ["slide_id"]
            isOneToOne: false
            referencedRelation: "slides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presentation_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      presentations: {
        Row: {
          id: string
          user_id: string | null
          title: string
          prompt: string | null
          difficulty: ("beginner" | "intermediate" | "advanced") | null
          slide_count: number | null
          is_published: boolean
          is_archived: boolean
          created_at: string
          source_type: string | null
          source_document_name: string | null
          source_document_metadata: Json | null
          theme: string | null
          background_color: string | null
          text_color: string | null
          accent_color: string | null
          credit_cost: number
          includes_images: boolean
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          prompt?: string | null
          difficulty?: ("beginner" | "intermediate" | "advanced") | null
          slide_count?: number | null
          is_published?: boolean
          is_archived?: boolean
          created_at?: string
          source_type?: string | null
          source_document_name?: string | null
          source_document_metadata?: Json | null
          theme?: string | null
          background_color?: string | null
          text_color?: string | null
          accent_color?: string | null
          credit_cost?: number
          includes_images?: boolean
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          prompt?: string | null
          difficulty?: ("beginner" | "intermediate" | "advanced") | null
          slide_count?: number | null
          is_published?: boolean
          is_archived?: boolean
          created_at?: string
          source_type?: string | null
          source_document_name?: string | null
          source_document_metadata?: Json | null
          theme?: string | null
          background_color?: string | null
          text_color?: string | null
          accent_color?: string | null
          credit_cost?: number
          includes_images?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "presentations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          agreed_to_terms: boolean | null
          created_at: string
          course_limit: number | null
          courses_created_count: number | null
          presentation_limit: number | null
          presentations_created_count: number | null
          credits: number
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          agreed_to_terms?: boolean | null
          created_at?: string
          course_limit?: number | null
          courses_created_count?: number | null
          presentation_limit?: number | null
          presentations_created_count?: number | null
          credits?: number
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          agreed_to_terms?: boolean | null
          created_at?: string
          course_limit?: number | null
          courses_created_count?: number | null
          presentation_limit?: number | null
          presentations_created_count?: number | null
          credits?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      progress: {
        Row: {
          id: string
          user_id: string | null
          lesson_id: string | null
          is_completed: boolean | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          lesson_id?: string | null
          is_completed?: boolean | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          lesson_id?: string | null
          is_completed?: boolean | null
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      quizzes: {
        Row: {
          id: string
          lesson_id: string | null
          question: string
          correct_answer: string
          wrong_answers: string[]
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id?: string | null
          question: string
          correct_answer: string
          wrong_answers: string[]
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string | null
          question?: string
          correct_answer?: string
          wrong_answers?: string[]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          }
        ]
      }
      session_history: {
        Row: {
          id: string
          companion_id: string | null
          user_id: string | null
          created_at: string
          duration: number | null
        }
        Insert: {
          id?: string
          companion_id?: string | null
          user_id?: string | null
          created_at?: string
          duration?: number | null
        }
        Update: {
          id?: string
          companion_id?: string | null
          user_id?: string | null
          created_at?: string
          duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_history_companion_id_fkey"
            columns: ["companion_id"]
            isOneToOne: false
            referencedRelation: "companions"
            referencedColumns: ["id"]
          }
        ]
      }
      slides: {
        Row: {
          id: string
          presentation_id: string | null
          title: string
          content: string | null
          type: ("title" | "content" | "image" | "chart" | "conclusion") | null
          layout: ("default" | "title-only" | "two-column" | "image-left" | "image-right" | "full-image") | null
          background_image_url: string | null
          order_index: number
          speaker_notes: string | null
          animation_type: string | null
          created_at: string
          image_url: string | null
          image_alt: string | null
          image_keywords: string[] | null
        }
        Insert: {
          id?: string
          presentation_id?: string | null
          title: string
          content?: string | null
          type?: ("title" | "content" | "image" | "chart" | "conclusion") | null
          layout?: ("default" | "title-only" | "two-column" | "image-left" | "image-right" | "full-image") | null
          background_image_url?: string | null
          order_index: number
          speaker_notes?: string | null
          animation_type?: string | null
          created_at?: string
          image_url?: string | null
          image_alt?: string | null
          image_keywords?: string[] | null
        }
        Update: {
          id?: string
          presentation_id?: string | null
          title?: string
          content?: string | null
          type?: ("title" | "content" | "image" | "chart" | "conclusion") | null
          layout?: ("default" | "title-only" | "two-column" | "image-left" | "image-right" | "full-image") | null
          background_image_url?: string | null
          order_index?: number
          speaker_notes?: string | null
          animation_type?: string | null
          created_at?: string
          image_url?: string | null
          image_alt?: string | null
          image_keywords?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "slides_presentation_id_fkey"
            columns: ["presentation_id"]
            isOneToOne: false
            referencedRelation: "presentations"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string | null
          plan_id: string | null
          is_active: boolean | null
          start_date: string
          end_date: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          stripe_current_period_end: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          plan_id?: string | null
          is_active?: boolean | null
          start_date?: string
          end_date?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          stripe_current_period_end?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          plan_id?: string | null
          is_active?: boolean | null
          start_date?: string
          end_date?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          stripe_current_period_end?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper type for companion with all fields
export type Companion = Database['public']['Tables']['companions']['Row']

// Helper type for companion insert
export type CompanionInsert = Database['public']['Tables']['companions']['Insert']

// Helper type for companion update  
export type CompanionUpdate = Database['public']['Tables']['companions']['Update']
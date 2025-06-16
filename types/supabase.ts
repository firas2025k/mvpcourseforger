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
        }
        Relationships: []
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
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          agreed_to_terms?: boolean | null
          created_at?: string
          course_limit?: number | null
          courses_created_count?: number | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          agreed_to_terms?: boolean | null
          created_at?: string
          course_limit?: number | null
          courses_created_count?: number | null
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

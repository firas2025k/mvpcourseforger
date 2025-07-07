-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.chapters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid,
  title text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chapters_pkey PRIMARY KEY (id),
  CONSTRAINT chapters_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  title text NOT NULL,
  prompt text,
  difficulty text CHECK (difficulty = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])),
  chapter_count integer,
  lessons_per_chapter integer,
  is_published boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  source_type character varying DEFAULT 'prompt'::character varying,
  source_document_name character varying,
  source_document_metadata jsonb,
  price_cents integer,
  is_for_sale boolean DEFAULT false,
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  course_id uuid,
  enrolled_at timestamp with time zone DEFAULT now(),
  is_completed boolean DEFAULT false,
  CONSTRAINT enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chapter_id uuid,
  title text NOT NULL,
  content text,
  type text DEFAULT 'text'::text CHECK (type = ANY (ARRAY['text'::text, 'quiz'::text, 'video'::text])),
  video_url text,
  order_index integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lessons_pkey PRIMARY KEY (id),
  CONSTRAINT lessons_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapters(id)
);
CREATE TABLE public.plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  course_limit integer NOT NULL,
  price_cents integer NOT NULL,
  stripe_price_id text,
  created_at timestamp with time zone DEFAULT now(),
  description text,
  features ARRAY,
  max_chapters integer NOT NULL DEFAULT 3,
  max_lessons_per_chapter integer NOT NULL DEFAULT 3,
  max_presentations integer DEFAULT 1,
  max_slides_per_presentation integer DEFAULT 10,
  CONSTRAINT plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.presentation_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  slide_id uuid,
  is_viewed boolean DEFAULT false,
  viewed_at timestamp with time zone,
  CONSTRAINT presentation_progress_pkey PRIMARY KEY (id),
  CONSTRAINT presentation_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT presentation_progress_slide_id_fkey FOREIGN KEY (slide_id) REFERENCES public.slides(id)
);
CREATE TABLE public.presentations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  title text NOT NULL,
  prompt text,
  difficulty text CHECK (difficulty = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])),
  slide_count integer,
  is_published boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  source_type character varying DEFAULT 'prompt'::character varying,
  source_document_name character varying,
  source_document_metadata jsonb,
  theme text DEFAULT 'default'::text,
  background_color text DEFAULT '#ffffff'::text,
  text_color text DEFAULT '#000000'::text,
  accent_color text DEFAULT '#3b82f6'::text,
  CONSTRAINT presentations_pkey PRIMARY KEY (id),
  CONSTRAINT presentations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  avatar_url text,
  agreed_to_terms boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  course_limit integer DEFAULT 0,
  courses_created_count integer DEFAULT 0,
  presentation_limit integer DEFAULT 0,
  presentations_created_count integer DEFAULT 0,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  lesson_id uuid,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  CONSTRAINT progress_pkey PRIMARY KEY (id),
  CONSTRAINT progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
);
CREATE TABLE public.quizzes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lesson_id uuid,
  question text NOT NULL,
  correct_answer text NOT NULL,
  wrong_answers ARRAY NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quizzes_pkey PRIMARY KEY (id),
  CONSTRAINT quizzes_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
);
CREATE TABLE public.slides (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  presentation_id uuid,
  title text NOT NULL,
  content text,
  type text DEFAULT 'content'::text CHECK (type = ANY (ARRAY['title'::text, 'content'::text, 'image'::text, 'chart'::text, 'conclusion'::text])),
  layout text DEFAULT 'default'::text CHECK (layout = ANY (ARRAY['default'::text, 'title-only'::text, 'two-column'::text, 'image-left'::text, 'image-right'::text, 'full-image'::text])),
  background_image_url text,
  order_index integer NOT NULL,
  speaker_notes text,
  animation_type text DEFAULT 'fade'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT slides_pkey PRIMARY KEY (id),
  CONSTRAINT slides_presentation_id_fkey FOREIGN KEY (presentation_id) REFERENCES public.presentations(id)
);
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  plan_id uuid,
  is_active boolean DEFAULT true,
  start_date timestamp with time zone DEFAULT now(),
  end_date timestamp with time zone,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp with time zone DEFAULT now(),
  stripe_current_period_end timestamp with time zone,
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id)
);
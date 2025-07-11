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
  credit_cost integer NOT NULL DEFAULT 0,
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.credit_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['purchase'::text, 'consumption'::text, 'adjustment'::text])),
  amount integer NOT NULL,
  related_entity_id uuid,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT credit_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT credit_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
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
  credit_amount integer NOT NULL DEFAULT 0,
  CONSTRAINT plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.presentation_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  slide_id uuid,
  is_viewed boolean DEFAULT false,
  viewed_at timestamp with time zone,
  CONSTRAINT presentation_progress_pkey PRIMARY KEY (id),
  CONSTRAINT presentation_progress_slide_id_fkey FOREIGN KEY (slide_id) REFERENCES public.slides(id),
  CONSTRAINT presentation_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
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
  credit_cost integer NOT NULL DEFAULT 0,
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
  credits integer NOT NULL DEFAULT 0,
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
  CONSTRAINT progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id),
  CONSTRAINT progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
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
  CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id),
  CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
# plan table content
INSERT INTO "public"."plans" ("id", "name", "course_limit", "price_cents", "stripe_price_id", "created_at", "description", "features", "max_chapters", "max_lessons_per_chapter", "max_presentations", "max_slides_per_presentation", "credit_amount") VALUES ('1575ca58-ad94-4ecf-b7a8-5060c6043ec7', 'Basic', '5', '1000', 'price_1RUVl6FfX5n10EQsLjS0Rndk', '2025-06-09 12:50:54.306104+00', 'Ideal for individuals getting serious about course creation.', '{"Up to 5 courses","Enhanced course generation tools","Email support"}', '5', '4', '3', '15', '100'), ('1cbc123f-d9c6-4ec1-bc99-934b7e632159', 'Ultimate', '50', '5000', 'price_1RUVmHFfX5n10EQsFUMfbnWd', '2025-06-09 12:50:54.306104+00', 'The complete solution for power users and businesses.', '{"Up to 50 courses","All course generation tools","Dedicated support","Advanced analytics","Custom branding options"}', '20', '10', '25', '50', '500'), ('822c49b4-2312-4981-aa57-c63b283f984d', 'Free', '1', '0', null, '2025-06-09 12:50:54.306104+00', 'Get started and create your first course.', '{"Up to 1 course","Basic course generation","Access own courses"}', '3', '3', '1', '10', '20'), ('f0ecbb70-f3b8-4493-865b-1cf26c47de2a', 'Pro', '15', '2500', 'price_1RUVliFfX5n10EQsgYfOlAg1', '2025-06-09 12:50:54.306104+00', 'For professionals and teams creating multiple courses.', '{"Up to 15 courses","Advanced course generation tools","Priority email support","Basic analytics"}', '10', '5', '10', '25', '250');
# Functions
## handle_new_user
DECLARE
    default_plan_id UUID;
    default_plan_credits INTEGER;
BEGIN
    -- Add 'auth' schema to search_path
    SET search_path = 'pg_catalog', 'public', 'auth';
    
    -- Rest of the function remains the same...
    SELECT id, credit_amount INTO default_plan_id, default_plan_credits 
    FROM public.plans 
    WHERE name = 'Free' 
    LIMIT 1;
    
    IF default_plan_id IS NULL THEN
        RAISE EXCEPTION 'Free plan not found. Please seed plans table.';
    END IF;
    
    INSERT INTO public.profiles (
        id, 
        course_limit, 
        courses_created_count, 
        presentation_limit, 
        presentations_created_count, 
        agreed_to_terms,
        credits
    ) VALUES (
        NEW.id, 
        1, 0, 1, 0, FALSE,
        COALESCE(default_plan_credits, 0)
    );
    
    INSERT INTO public.subscriptions (user_id, plan_id, is_active)
    VALUES (NEW.id, default_plan_id, TRUE);
    
    IF default_plan_credits > 0 THEN
        INSERT INTO public.credit_transactions (user_id, type, amount, description)
        VALUES (NEW.id, 'purchase', default_plan_credits, 'Initial credits from Free plan');
    END IF;
    
    RETURN NEW;
END;
## handle_subscription_change

DECLARE
    plan_credit_amount INTEGER;
    free_plan_id UUID;
    free_plan_credit_amount INTEGER;
    free_plan_course_limit INTEGER;
    free_plan_presentation_limit INTEGER;
    current_user_credits INTEGER;
    is_plan_change BOOLEAN := FALSE;
    should_grant_credits BOOLEAN := FALSE;
BEGIN
    -- Set a secure search_path to prevent search_path hijacking
    SET search_path = 'pg_catalog', 'public', 'auth';
    
    RAISE NOTICE 'Trigger handle_subscription_change fired for user_id: %', NEW.user_id;
    RAISE NOTICE 'NEW.plan_id: %, NEW.is_active: %, OLD.is_active: %', NEW.plan_id, NEW.is_active, COALESCE(OLD.is_active, FALSE);

    -- Ensure a profile entry exists for the user
    INSERT INTO public.profiles (
        id, 
        credits, 
        course_limit, 
        courses_created_count, 
        presentation_limit, 
        presentations_created_count
    ) VALUES (
        NEW.user_id, 
        0, 
        0, 
        0, 
        0, 
        0
    ) ON CONFLICT (id) DO NOTHING;

    -- Get free plan details
    SELECT id, credit_amount, course_limit, max_presentations 
    INTO free_plan_id, free_plan_credit_amount, free_plan_course_limit, free_plan_presentation_limit
    FROM public.plans
    WHERE name = 'Free';

    -- Determine if this is a plan change
    IF TG_OP = 'UPDATE' AND OLD.plan_id IS DISTINCT FROM NEW.plan_id THEN
        is_plan_change := TRUE;
    END IF;

    -- Determine if credits should be granted
    IF TG_OP = 'INSERT' THEN
        should_grant_credits := TRUE;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Grant credits only for:
        -- 1. Subscription becoming active (inactive -> active)
        -- 2. Plan change
        IF (OLD.is_active = FALSE AND NEW.is_active = TRUE) OR is_plan_change THEN
            should_grant_credits := TRUE;
        END IF;
    END IF;

    IF NEW.is_active = TRUE THEN
        -- Subscription is active
        IF NEW.plan_id IS NOT NULL THEN
            -- Get credit_amount for the new plan
            SELECT credit_amount INTO plan_credit_amount
            FROM public.plans
            WHERE id = NEW.plan_id;

            RAISE NOTICE 'Plan credit amount: %', plan_credit_amount;

            -- Grant credits if conditions are met
            IF should_grant_credits AND plan_credit_amount > 0 THEN
                -- Get current credits
                SELECT credits INTO current_user_credits 
                FROM public.profiles 
                WHERE id = NEW.user_id;
                
                RAISE NOTICE 'Current user credits before update: %', current_user_credits;

                -- Add credits to the user's profile
                UPDATE public.profiles
                SET credits = COALESCE(current_user_credits, 0) + plan_credit_amount
                WHERE id = NEW.user_id;

                RAISE NOTICE 'Credits updated for user % to %', NEW.user_id, (SELECT credits FROM public.profiles WHERE id = NEW.user_id);

                -- Log the credit transaction
                INSERT INTO public.credit_transactions (user_id, type, amount, description, related_entity_id)
                VALUES (
                    NEW.user_id, 
                    'purchase', 
                    plan_credit_amount, 
                    'Credits granted for plan: ' || (SELECT name FROM public.plans WHERE id = NEW.plan_id), 
                    NEW.id
                );

                RAISE NOTICE 'Credit transaction logged.';
            END IF;

            -- Always update limits for active subscriptions
            UPDATE public.profiles
            SET 
                course_limit = (SELECT course_limit FROM public.plans WHERE id = NEW.plan_id),
                presentation_limit = (SELECT max_presentations FROM public.plans WHERE id = NEW.plan_id),
                courses_created_count = COALESCE(courses_created_count, 0),
                presentations_created_count = COALESCE(presentations_created_count, 0)
            WHERE id = NEW.user_id;

            RAISE NOTICE 'Limits updated for user % to plan %', NEW.user_id, NEW.plan_id;
        ELSE
            RAISE WARNING 'NEW.plan_id is NULL for active subscription. Cannot allocate credits or update limits.';
        END IF;
    ELSE
        -- Subscription is inactive - reset to free plan limits
        RAISE NOTICE 'Subscription for user % is inactive.', NEW.user_id;

        UPDATE public.profiles
        SET 
            course_limit = COALESCE(free_plan_course_limit, 0),
            presentation_limit = COALESCE(free_plan_presentation_limit, 0)
        WHERE id = NEW.user_id;

        RAISE NOTICE 'Limits reset to free plan for user %.', NEW.user_id;
    END IF;

    RETURN NEW;
END;


# stripe webhook response 
Response
HTTP status code
200 (OK)
{
  "received": true
}
Request
{
  "id": "evt_1Rixi1FfX5n10EQsIwkSWZYt",
  "object": "event",
  "api_version": "2023-10-16",
  "created": 1752066409,
  "data": {
    "object": {
      "id": "sub_1RY5PUFfX5n10EQsOHblzucB",
      "object": "subscription",
      "application": null,
      "application_fee_percent": null,
      "automatic_tax": {
        "disabled_reason": null,
        "enabled": false,
        "liability": null
      },
      "billing_cycle_anchor": 1749474404,
      "billing_cycle_anchor_config": null,
      "billing_mode": {
        "type": "classic"
      },
      "billing_thresholds": null,
      "cancel_at": 1752066404,
      "cancel_at_period_end": true,
      "canceled_at": 1749488457,
      "cancellation_details": {
        "comment": null,
        "feedback": "unused",
        "reason": "cancellation_requested"
      },
      "collection_method": "charge_automatically",
      "created": 1749474404,
      "currency": "usd",
      "current_period_end": 1752066404,
      "current_period_start": 1749474404,
      "customer": "cus_ST1RtHydC4cdb5",
      "days_until_due": null,
      "default_payment_method": "pm_1RY5PUFfX5n10EQsk3JXEvs7",
      "default_source": null,
      "default_tax_rates": [
      ],
      "description": null,
      "discount": null,
      "discounts": [
      ],
      "ended_at": 1752066404,
      "invoice_settings": {
        "account_tax_ids": null,
        "issuer": {
          "type": "self"
        }
      },
      "items": {
        "object": "list",
        "data": [
          {
            "id": "si_ST1SYp9eHIs7zU",
            "object": "subscription_item",
            "billing_thresholds": null,
            "created": 1749474405,
            "current_period_end": 1752066404,
            "current_period_start": 1749474404,
            "discounts": [
            ],
            "metadata": {
            },
            "plan": {
              "id": "price_1RUVl6FfX5n10EQsLjS0Rndk",
              "object": "plan",
              "active": true,
              "aggregate_usage": null,
              "amount": 1000,
              "amount_decimal": "1000",
              "billing_scheme": "per_unit",
              "created": 1748622376,
              "currency": "usd",
              "interval": "month",
              "interval_count": 1,
              "livemode": false,
              "metadata": {
              },
              "meter": null,
              "nickname": null,
              "product": "prod_SPKPZ453LZJHUc",
              "tiers_mode": null,
              "transform_usage": null,
              "trial_period_days": null,
              "usage_type": "licensed"
            },
            "price": {
              "id": "price_1RUVl6FfX5n10EQsLjS0Rndk",
              "object": "price",
              "active": true,
              "billing_scheme": "per_unit",
              "created": 1748622376,
              "currency": "usd",
              "custom_unit_amount": null,
              "livemode": false,
              "lookup_key": null,
              "metadata": {
              },
              "nickname": null,
              "product": "prod_SPKPZ453LZJHUc",
              "recurring": {
                "aggregate_usage": null,
                "interval": "month",
                "interval_count": 1,
                "meter": null,
                "trial_period_days": null,
                "usage_type": "licensed"
              },
              "tax_behavior": "unspecified",
              "tiers_mode": null,
              "transform_quantity": null,
              "type": "recurring",
              "unit_amount": 1000,
              "unit_amount_decimal": "1000"
            },
            "quantity": 1,
            "subscription": "sub_1RY5PUFfX5n10EQsOHblzucB",
            "tax_rates": [
            ]
          }
        ],
        "has_more": false,
        "total_count": 1,
        "url": "/v1/subscription_items?subscription=sub_1RY5PUFfX5n10EQsOHblzucB"
      },
      "latest_invoice": "in_1RY5PVFfX5n10EQs3f7maDHe",
      "livemode": false,
      "metadata": {
      },
      "next_pending_invoice_item_invoice": null,
      "on_behalf_of": null,
      "pause_collection": null,
      "payment_settings": {
        "payment_method_options": {
          "acss_debit": null,
          "bancontact": null,
          "card": {
            "network": null,
            "request_three_d_secure": "automatic"
          },
          "customer_balance": null,
          "konbini": null,
          "sepa_debit": null,
          "us_bank_account": null
        },
        "payment_method_types": [
          "card"
        ],
        "save_default_payment_method": "off"
      },
      "pending_invoice_item_interval": null,
      "pending_setup_intent": null,
      "pending_update": null,
      "plan": {
        "id": "price_1RUVl6FfX5n10EQsLjS0Rndk",
        "object": "plan",
        "active": true,
        "aggregate_usage": null,
        "amount": 1000,
        "amount_decimal": "1000",
        "billing_scheme": "per_unit",
        "created": 1748622376,
        "currency": "usd",
        "interval": "month",
        "interval_count": 1,
        "livemode": false,
        "metadata": {
        },
        "meter": null,
        "nickname": null,
        "product": "prod_SPKPZ453LZJHUc",
        "tiers_mode": null,
        "transform_usage": null,
        "trial_period_days": null,
        "usage_type": "licensed"
      },
      "quantity": 1,
      "schedule": null,
      "start_date": 1749474404,
      "status": "canceled",
      "test_clock": null,
      "transfer_data": null,
      "trial_end": null,
      "trial_settings": {
        "end_behavior": {
          "missing_payment_method": "create_invoice"
        }
      },
      "trial_start": null
    }
  },
  "livemode": false,
  "pending_webhooks": 1,
  "request": {
    "id": null,
    "idempotency_key": null
  },
  "type": "customer.subscription.deleted"
}

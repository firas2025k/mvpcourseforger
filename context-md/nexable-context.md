✅ Nexable B2B – Feature Outline
Here’s a breakdown categorized by purpose:

🧱 Core Functionality (Adapted from B2C)
These are foundational features you’ll keep from your B2C platform:

✅ Prompt-based AI course generation

✅ Course structure with chapters and lessons

✅ Notion-style editor (customize AI content)

✅ PDF export of entire course

✅ Lesson progress tracking (per employee/user)

✅ Quizzes and completions tracking

🏢 B2B-Specific Enhancements
1. Team/Org Management
👥 Create organizations (companies)

➕ Invite team members via email

🔐 Role-based access (Admin, Manager, Learner)

🔄 User status (pending, active, removed)

2. Branded Experience
🎨 Custom logo, color palette, company name

🖼️ Custom login screen / subdomain (e.g., acme.nexable.com)

3. Custom Course Generation
📄 Upload internal documentation (PDF, DOCX) to inform AI prompts

📘 Curriculum-based generation (e.g., generate course from onboarding doc)

🧠 Fine-tuned prompt options per company (e.g., always target .NET stack)

4. Advanced Analytics (Org-wide)
📊 Track team-wide course completions

🧍 Leaderboard: employees by completion %, quiz score

📅 Activity heatmaps, per-course stats, time spent

5. Company Dashboard
🖥️ Admins manage:

Users

Generated courses

AI cost usage / limits

Reports + compliance exports

6. Flexible Licensing
💼 Monthly pricing per team size or per employee seat

💳 Custom billing via Stripe (optional invoicing support)

⚙️ Admins can assign course access to employees

7. Compliance & Export
✅ Export compliance reports (who completed what, when)

📄 Signed PDFs per employee (for HR/legal)

8. Custom Hosting (Optional Tier)
🛡️ Private cloud or white-labeled deployment

🔐 Data residency options (e.g., EU-only)

💡 Future Nice-to-Haves (Post-MVP)
📱 Mobile app (employee learning portal)

💬 Internal team chat/comments per course

🧩 LMS integrations (Slack, Microsoft Teams, Notion sync)

📌 Summary: B2B Product Goals
Category	Goal
✅ Internal training	Fast onboarding + course generation
✅ Customization	Company-specific content, branded experience
✅ Analytics	Track employee performance + compliance
✅ Team management	Admin control over users and content access
✅ Licensing model	Recurring revenue based on team size or usage

# Current B2C Structure to use as infrastructure 


.
├── README.md
├── actions
│   └── search.ts
├── app
│   ├── actions
│   │   └── search.ts
│   ├── api
│   │   ├── complete-course
│   │   │   └── route.ts
│   │   ├── course
│   │   │   └── [courseId]
│   │   │       └── route.ts
│   │   ├── course-details
│   │   │   └── [courseId]
│   │   │       └── route.ts
│   │   ├── export-course-pdf
│   │   │   └── route.ts
│   │   ├── generate-course
│   │   │   └── route.ts
│   │   ├── lesson-content
│   │   │   └── route.ts
│   │   ├── lesson-progress
│   │   │   └── route.ts
│   │   ├── save-course
│   │   │   └── route.ts
│   │   └── stripe
│   │       ├── create-checkout-session
│   │       │   └── route.ts
│   │       ├── create-portal-session
│   │       │   └── route.ts
│   │       └── webhook
│   │           └── route.ts
│   ├── auth
│   │   ├── confirm
│   │   │   └── route.ts
│   │   ├── error
│   │   │   └── page.tsx
│   │   ├── forgot-password
│   │   │   └── page.tsx
│   │   ├── login
│   │   │   └── page.tsx
│   │   ├── sign-up
│   │   │   └── page.tsx
│   │   ├── sign-up-success
│   │   │   └── page.tsx
│   │   └── update-password
│   │       └── page.tsx
│   ├── dashboard
│   │   ├── analytics
│   │   │   └── page.tsx
│   │   ├── courses
│   │   │   ├── [courseId]
│   │   │   │   └── page.tsx
│   │   │   ├── new
│   │   │   │   └── page.tsx
│   │   │   └── preview
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── settings
│   │       └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── opengraph-image.png
│   ├── page.tsx
│   ├── pricing
│   │   ├── PricingClientPage.tsx
│   │   └── page.tsx
│   └── twitter-image.png
├── build.log
├── components
│   ├── analytics
│   │   ├── CourseProgressPieChart.tsx
│   │   └── LessonsCompletionBarChart.tsx
│   ├── auth
│   │   ├── AuthPageLayout.tsx
│   │   ├── auth-button.tsx
│   │   ├── forgot-password-form.tsx
│   │   ├── login-form.tsx
│   │   ├── logout-button.tsx
│   │   ├── sign-up-form.tsx
│   │   └── update-password-form.tsx
│   ├── dashboard
│   │   ├── CourseCard.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── ManageSubscriptionButton.tsx
│   │   ├── SearchInput.tsx
│   │   ├── SearchInputLoading.tsx
│   │   ├── UserPlanCard.tsx
│   │   └── courses
│   │       ├── CourseLayoutClient.tsx
│   │       ├── LessonEditor.tsx
│   │       └── RichTextEditor.tsx
│   ├── landing
│   │   ├── Footer.tsx
│   │   └── Navbar.tsx
│   ├── next-logo.tsx
│   ├── shared
│   │   └── LanguageSwitcher.tsx
│   ├── supabase-logo.tsx
│   ├── theme-switcher.tsx
│   └── ui
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── resizable.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sonner.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       └── tooltip.tsx
├── components.json
├── context-md
│   ├── Analytics_page.md
│   ├── CONTEXT.md
│   ├── DEPLOYMENT.md
│   ├── USER_FLOW.md
│   ├── course-gen-context.md
│   ├── database.md
│   ├── errors.md
│   ├── query.md
│   ├── results.md
│   ├── saas-context.md
│   └── working-code.md
├── eslint.config.mjs
├── hooks
│   ├── useAutoSave.ts
│   └── useDebounce.ts
├── html2pdf.d.ts
├── lib
│   ├── gemini.ts
│   ├── stripe.ts
│   ├── supabase
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   └── server.ts
│   └── utils.ts
├── middleware.ts
├── next-env.d.ts
├── next-i18next.config.js
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   ├── assets
│   │   └── images
│   │       ├── banner.png
│   │       ├── logo-icon.png
│   │       └── logo.png
│   └── locales
│       ├── en
│       │   └── common.json
│       └── fr
│           └── common.json
├── tailwind.config.ts
├── tsconfig.json
├── types
│   ├── course.ts
│   ├── index.ts
│   ├── pdf-types.ts
│   └── supabase.ts
├── utils
│   └── pdfExport.ts
└── vercel.json

# Current B2c Database schema to tweak for our B2B needs
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
  CONSTRAINT plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  avatar_url text,
  agreed_to_terms boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  course_limit integer DEFAULT 0,
  courses_created_count integer DEFAULT 0,
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

# Important note 
- the B2C product is ready ,in order to save time we will use parts of the B2C for the The B2B 
- the B2B will be a seperate product with a seperate database

# 🧭 Nexable B2B Roadmap
🚀 Phase 1: MVP – Internal Learning for Teams
🎯 Goal: Launch quickly with AI-powered course generation and team access.

✅ Features
✅ Organization creation + invite system

✅ Role management (admin, manager, learner)

✅ AI course generation scoped to org

✅ Notion-style lesson editor

✅ Team-based course assignments

✅ Learner dashboard for consuming assigned courses

✅ Progress tracking per lesson

✅ Org-level analytics dashboard (basic metrics)

✅ PDF course export (for HR/legal)

✅ Stripe-powered organization billing (per seat or plan)

⏱️ Timeline: 4–6 weeks
🔁 Phase 2: Team Enablement & Compliance
🎯 Goal: Make it a serious tool for HR + onboarding workflows.

🛠 Enhancements
🧾 Exportable compliance reports (per employee/course)

🪪 Invite via CSV upload (bulk onboarding)

🧑‍💼 Department-level team grouping (e.g., “Sales”, “Dev”)

🧩 Dynamic course recommendations based on roles

📅 Activity calendar / learning streaks (light gamification)

🔍 Improved analytics: time spent, dropout points

🌐 Custom subdomain per org (e.g., acme.nexable.xyz)

📈 Usage metering for billing (optional overage fees)

⏱️ Timeline: +3–5 weeks post-MVP
🧠 Phase 3: Enterprise Readiness & AI Uplift
🎯 Goal: Become an AI-powered internal L&D platform

🧬 Advanced Features
🧾 Upload internal docs (PDF, Notion, DOCX) → generate course from content

📂 AI-powered tagging & smart course suggestions

🔐 Role-based curriculum permissions

🔄 SCORM/xAPI export (for legacy LMS integration)

🧰 HR tools integration (Slack, Microsoft Teams, BambooHR, etc.)

📱 Mobile app (cross-platform with Expo or RN)

🔒 Private instance hosting (for larger orgs)

🤝 SSO integration (OAuth, SAML)

⏱️ Timeline: Q4 2025 → Q1 2026
📌 Summary View
Phase	Focus Area	Key Outcomes
MVP	AI course gen + teams	Validated use case, revenue-ready
Post-MVP	Compliance & team features	HR/manager usability + admin adoption
Enterprise	Doc-to-course AI, integrations	Sell to orgs needing deeper customization
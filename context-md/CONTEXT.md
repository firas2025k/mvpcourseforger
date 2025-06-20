SaaS LMS MVP – Project Context

## 📌 Overview

This project is a SaaS-based Learning Management System (LMS) MVP . It supports **prompt-based course creation via Gemini API**, and **Stripe-powered subscription tiers** with enforced course limits (Free: 1 course, Paid: more).

## 🧱 Tech Stack

- **Frontend:** Next.js 14 (App Router, TypeScript, Tailwind CSS and shadcnui
- **Backend/DB:** Supabase (PostgreSQL, Supabase Auth, Realtime)
- **AI:** Gemini API (for automatic course generation)
- **Payments:** Stripe (subscription model)
- **Hosting:** Vercel (for seamless deployment)

---

## ✨ MVP Features (Single Role)

- ✅ Authentication: Email and Google SSO via Supabase Auth

- 🧠 AI Course Generation: Prompt-based multilingual course creation using Gemini API

- 🗃️ Course Management: Create, edit, delete, preview, archive courses

- ✍️ Lesson Editor: Notion-style rich-text editor with autosave

- 📚 Learning Interface: Dashboard with enrolled courses, progress tracking, lesson completion, and quizzes

- 📊 Admin Dashboard: Basic analytics for users with active subscriptions (lesson completion, course progress)

- 💳 Payments Integration: Stripe checkout with course/chapter/lesson limits enforced based on plan

Free Plan → 1 course, 3 chapters, 3 lessons/chapter

Basic → 5 courses, 5 chapters, 4 lessons/chapter

Pro → 15 courses, 8 chapters, 5 lessons/chapter

Ultimate → 50 courses, 10 chapters, 6 lessons/chapter

- 📂 PDF Export: Users can export courses as PDF

- 🔍 Search & Filtering: Search courses and lessons, with loading fallback

- 🌍 Internationalization: Language switcher and i18n support

- 🧾 Profile & Settings: Manage user info and subscription details

- 🧠 Plan Enforcement (Frontend + API): Validates limits before course generation

.
├── README.md
├── actions
│   └── search.ts
├── app
│   ├── actions
│   │   └── search.ts
│   ├── api
│   │   ├── complete-course
│   │   │   └── route.ts
│   │   ├── course
│   │   │   └── [courseId]
│   │   │   └── route.ts
│   │   ├── course-details
│   │   │   └── [courseId]
│   │   │   └── route.ts
│   │   ├── export-course-pdf
│   │   │   └── route.ts
│   │   ├── generate-course
│   │   │   └── route.ts
│   │   ├── lesson-content
│   │   │   └── route.ts
│   │   ├── lesson-progress
│   │   │   └── route.ts
│   │   ├── save-course
│   │   │   └── route.ts
│   │   └── stripe
│   │   ├── create-checkout-session
│   │   │   └── route.ts
│   │   ├── create-portal-session
│   │   │   └── route.ts
│   │   └── webhook
│   │   └── route.ts
│   ├── auth
│   │   ├── confirm
│   │   │   └── route.ts
│   │   ├── error
│   │   │   └── page.tsx
│   │   ├── forgot-password
│   │   │   └── page.tsx
│   │   ├── login
│   │   │   └── page.tsx
│   │   ├── sign-up
│   │   │   └── page.tsx
│   │   ├── sign-up-success
│   │   │   └── page.tsx
│   │   └── update-password
│   │   └── page.tsx
│   ├── dashboard
│   │   ├── analytics
│   │   │   └── page.tsx
│   │   ├── courses
│   │   │   ├── [courseId]
│   │   │   │   └── page.tsx
│   │   │   ├── new
│   │   │   │   └── page.tsx
│   │   │   └── preview
│   │   │   └── page.tsx
│   │   ├── dashboard.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── settings
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── opengraph-image.png
│   ├── page.tsx
│   ├── pricing
│   │   ├── PricingClientPage.tsx
│   │   └── page.tsx
│   └── twitter-image.png
├── build.log
├── components
│   ├── analytics
│   │   ├── CourseProgressPieChart.tsx
│   │   └── LessonsCompletionBarChart.tsx
│   ├── auth
│   │   ├── AuthPageLayout.tsx
│   │   ├── auth-button.tsx
│   │   ├── forgot-password-form.tsx
│   │   ├── login-form.tsx
│   │   ├── logout-button.tsx
│   │   ├── sign-up-form.tsx
│   │   └── update-password-form.tsx
│   ├── dashboard
│   │   ├── CourseCard.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── ManageSubscriptionButton.tsx
│   │   ├── SearchInput.tsx
│   │   ├── SearchInputLoading.tsx
│   │   ├── UserPlanCard.tsx
│   │   └── courses
│   │   ├── CourseLayoutClient.tsx
│   │   ├── LessonEditor.tsx
│   │   └── RichTextEditor.tsx
│   ├── landing
│   │   ├── Footer.tsx
│   │   └── Navbar.tsx
│   ├── next-logo.tsx
│   ├── shared
│   │   └── LanguageSwitcher.tsx
│   ├── supabase-logo.tsx
│   ├── theme-switcher.tsx
│   └── ui
│   ├── accordion.tsx
│   ├── alert-dialog.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── breadcrumb.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── progress.tsx
│   ├── radio-group.tsx
│   ├── resizable.tsx
│   ├── scroll-area.tsx
│   ├── select.tsx
│   ├── separator.tsx
│   ├── sheet.tsx
│   ├── sonner.tsx
│   ├── tabs.tsx
│   ├── textarea.tsx
│   └── tooltip.tsx
├── components.json
├── context-md
│   ├── Analytics_page.md
│   ├── CONTEXT.md
│   ├── DEPLOYMENT.md
│   ├── USER_FLOW.md
│   ├── course-gen-context.md
│   ├── database.md
│   ├── errors.md
│   ├── nexable-context.md
│   ├── nexable-userflow.md
│   ├── query.md
│   ├── results.md
│   ├── saas-context.md
│   └── working-code.md
├── eslint.config.mjs
├── hooks
│   ├── useAutoSave.ts
│   └── useDebounce.ts
├── html2pdf.d.ts
├── lib
│   ├── gemini.ts
│   ├── stripe.ts
│   ├── supabase
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   └── server.ts
│   └── utils.ts
├── middleware.ts
├── next-env.d.ts
├── next-i18next.config.js
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   ├── assets
│   │   └── images
│   │   ├── banner.png
│   │   ├── logo-icon.png
│   │   └── logo.png
│   └── locales
│   ├── en
│   │   └── common.json
│   └── fr
│   └── common.json
├── tailwind.config.ts
├── tsconfig.json
├── types
│   ├── course.ts
│   ├── index.ts
│   ├── pdf-types.ts
│   └── supabase.ts
├── utils
│   └── pdfExport.ts
└── vercel.json

## Important notes

- this setup has a template landing page ,supabase auth already implemented and a protected route (dashboard) for authentiticated users
- when creating components,please put theme in a fodler related to the page it relates to
  for example if you are creating a component for the dashboard page,please put it in a dashboard folder in the components folder and for shared components like navbars and side bars etc.. put them in a shared folder in the components folder
- for styling,please use tailwindcss and shadcn/ui
- TypeScript types/interfaces should be put in the types folder
- for hooks,please put them in the hooks folder
- for lib,please put them in the lib folder
- for utilities,please put them in the utils folder

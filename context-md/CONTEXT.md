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

- 🧠 Credit based system generation

## folder structure

.
├── README.md
├── actions
│ ├── companion.actions.ts
│ └── search.ts
├── app
│ ├── actions
│ │ └── search.ts
│ ├── admin
│ │ ├── auth
│ │ │ └── page.tsx
│ │ ├── credits
│ │ │ └── page.tsx
│ │ ├── dashboard
│ │ │ └── page.tsx
│ │ ├── layout.tsx
│ │ ├── page.tsx
│ │ ├── subscriptions
│ │ │ └── page.tsx
│ │ └── users
│ │ └── page.tsx
│ ├── api
│ │ ├── admin
│ │ │ ├── credits
│ │ │ │ └── route.ts
│ │ │ ├── dashboard-stats
│ │ │ │ └── route.ts
│ │ │ ├── subscriptions
│ │ │ │ └── route.ts
│ │ │ └── users
│ │ │ ├── [userId]
│ │ │ │ └── route.ts
│ │ │ └── route.ts
│ │ ├── complete-course
│ │ │ └── route.ts
│ │ ├── course
│ │ │ ├── [courseId]
│ │ │ │ ├── generate-access-code
│ │ │ │ │ └── route.ts
│ │ │ │ └── route.ts
│ │ │ └── join-by-code
│ │ │ └── route.ts
│ │ ├── course-details
│ │ │ └── [courseId]
│ │ │ └── route.ts
│ │ ├── export-course-pdf
│ │ │ └── route.ts
│ │ ├── export-presentation-pdf
│ │ │ └── route.ts
│ │ ├── generate-course
│ │ │ └── route.ts
│ │ ├── generate-course-from-pdf
│ │ │ └── route.ts
│ │ ├── generate-presentation
│ │ │ └── route.ts
│ │ ├── generate-presentation-from-pdf
│ │ │ └── route.ts
│ │ ├── lesson-content
│ │ │ └── route.ts
│ │ ├── lesson-progress
│ │ │ └── route.ts
│ │ ├── presentation-details
│ │ │ └── [presentationId]
│ │ │ └── route.ts
│ │ ├── presentation-progress
│ │ │ └── route.ts
│ │ ├── save-course
│ │ │ └── route.ts
│ │ ├── save-presentation
│ │ │ └── route.ts
│ │ ├── search-images
│ │ │ └── route.ts
│ │ ├── stripe
│ │ │ ├── create-checkout-session
│ │ │ │ └── route.ts
│ │ │ ├── create-credit-checkout
│ │ │ │ └── route.ts
│ │ │ ├── create-portal-session
│ │ │ │ └── route.ts
│ │ │ └── webhook
│ │ │ └── route.ts
│ │ ├── user
│ │ │ ├── credit-transactions
│ │ │ │ └── route.ts
│ │ │ └── credits
│ │ │ └── route.ts
│ │ └── voice-agent
│ │ └── create
│ │ └── route.ts
│ ├── auth
│ │ ├── confirm
│ │ │ └── route.ts
│ │ ├── confirm-success
│ │ │ └── page.tsx
│ │ ├── error
│ │ │ └── page.tsx
│ │ ├── forgot-password
│ │ │ └── page.tsx
│ │ ├── login
│ │ │ └── page.tsx
│ │ ├── sign-up
│ │ │ └── page.tsx
│ │ ├── sign-up-success
│ │ │ └── page.tsx
│ │ ├── update-password
│ │ │ └── page.tsx
│ │ └── verify-otp
│ │ └── page.tsx
│ ├── course-content-styles.css
│ ├── dashboard
│ │ ├── analytics
│ │ │ └── page.tsx
│ │ ├── courses
│ │ │ ├── [courseId]
│ │ │ │ └── page.tsx
│ │ │ ├── new
│ │ │ │ └── page.tsx
│ │ │ ├── page.tsx
│ │ │ └── preview
│ │ │ └── page.tsx
│ │ ├── credit
│ │ │ ├── page.tsx
│ │ │ └── purchase
│ │ │ └── page.tsx
│ │ ├── dashboard.css
│ │ ├── layout.tsx
│ │ ├── page-old.tsx
│ │ ├── page.tsx
│ │ ├── presentations
│ │ │ ├── [presentationId]
│ │ │ │ ├── page.tsx
│ │ │ │ └── present
│ │ │ │ └── page.tsx
│ │ │ ├── new
│ │ │ │ └── page.tsx
│ │ │ └── page.tsx
│ │ ├── settings
│ │ │ └── page.tsx
│ │ └── voice
│ │ ├── [id]
│ │ │ └── page.tsx
│ │ ├── new
│ │ │ └── page.tsx
│ │ └── page.tsx
│ ├── favicon.ico
│ ├── globals.css
│ ├── layout.tsx
│ ├── opengraph-image.png
│ ├── page.tsx
│ ├── pricing
│ │ ├── PricingClientPage.tsx
│ │ └── page.tsx
│ ├── print-presentation
│ │ └── [presentationId]
│ │ └── page.tsx
│ ├── real-landingpage.tsx
│ └── twitter-image.png
├── build.log
├── components
│ ├── admin
│ │ ├── auth
│ │ ├── credits
│ │ │ └── CreditSystemManagement.tsx
│ │ ├── dashboard
│ │ │ └── DashboardStats.tsx
│ │ ├── subscriptions
│ │ │ └── SubscriptionManagement.tsx
│ │ └── users
│ │ └── UserManagement.tsx
│ ├── analytics
│ │ ├── AnalyticsClient.tsx
│ │ ├── CompanionUsageChart.tsx
│ │ ├── CourseProgressPieChart.tsx
│ │ ├── LessonsCompletionBarChart.tsx
│ │ ├── PresentationProgressPieChart.tsx
│ │ ├── SlidesCompletionBarChart.tsx
│ │ └── VoiceAgentSessionChart.tsx
│ ├── auth
│ │ ├── AuthPageLayout.tsx
│ │ ├── auth-button.tsx
│ │ ├── forgot-password-form.tsx
│ │ ├── login-form.tsx
│ │ ├── logout-button.tsx
│ │ ├── otp-verification.tsx
│ │ ├── sign-up-form.tsx
│ │ └── update-password-form.tsx
│ ├── dashboard
│ │ ├── CourseCard.tsx
│ │ ├── CreditBalance.tsx
│ │ ├── CreditPurchaseForm.tsx
│ │ ├── CreditUsageTable.tsx
│ │ ├── DashboardLayout-old.tsx
│ │ ├── DashboardLayout.tsx
│ │ ├── JoinCourseDialog.tsx
│ │ ├── ManageSubscriptionButton.tsx
│ │ ├── PresentationCard.tsx
│ │ ├── SearchInput.tsx
│ │ ├── SearchInputLoading.tsx
│ │ ├── UserPlanCard.tsx
│ │ ├── courses
│ │ │ ├── CourseLayoutClient.tsx
│ │ │ ├── CourseLayoutClient.tsx.backup
│ │ │ ├── CoursesSearchFilter.tsx
│ │ │ ├── LessonContent.tsx
│ │ │ ├── LessonEditor.tsx
│ │ │ ├── ReadAloudButton.tsx
│ │ │ ├── ReadAloudControls.tsx
│ │ │ ├── ReadAloudSettings.tsx
│ │ │ └── RichTextEditor.tsx
│ │ ├── presentations
│ │ │ ├── CreatePresentationForm.tsx
│ │ │ ├── MarkdownSlideRenderer.tsx
│ │ │ └── PresentationViewer.tsx
│ │ └── voice
│ │ ├── CompanionCard.tsx
│ │ ├── CompanionComponent.tsx
│ │ ├── CompanionForm.tsx
│ │ ├── CompanionsList.tsx
│ │ └── CreditCostPreview.tsx
│ ├── landing
│ │ ├── Footer.tsx
│ │ └── Navbar.tsx
│ ├── next-logo.tsx
│ ├── shared
│ │ └── LanguageSwitcher.tsx
│ ├── supabase-logo.tsx
│ ├── theme-switcher.tsx
│ └── ui
│ ├── accordion.tsx
│ ├── alert-dialog.tsx
│ ├── alert.tsx
│ ├── avatar.tsx
│ ├── badge.tsx
│ ├── breadcrumb.tsx
│ ├── button.tsx
│ ├── card.tsx
│ ├── checkbox.tsx
│ ├── dialog.tsx
│ ├── dropdown-menu.tsx
│ ├── form.tsx
│ ├── input.tsx
│ ├── label.tsx
│ ├── popover.tsx
│ ├── progress.tsx
│ ├── radio-group.tsx
│ ├── resizable.tsx
│ ├── scroll-area.tsx
│ ├── select.tsx
│ ├── separator.tsx
│ ├── sheet.tsx
│ ├── slider.tsx
│ ├── sonner.tsx
│ ├── table.tsx
│ ├── tabs.tsx
│ ├── textarea.tsx
│ ├── tooltip.tsx
│ └── use-toast.ts
├── components.json
├── constants
│ ├── index.ts
│ └── soundwaves.json
├── context-md
│ ├── Analytics_page.md
│ ├── CONTEXT.md
│ ├── DEPLOYMENT.md
│ ├── USER_FLOW.md
│ ├── course-gen-context.md
│ ├── database.md
│ ├── errors.md
│ ├── landing page.md
│ ├── nexable-context.md
│ ├── nexable-userflow.md
│ ├── query.md
│ ├── results.md
│ ├── saas-context.md
│ ├── schema.md
│ └── working-code.md
├── eslint.config.mjs
├── hooks
│ ├── useAutoSave.ts
│ ├── useDebounce.ts
│ └── useReadAloud.ts
├── html2pdf.d.ts
├── lib
│ ├── gemini.ts
│ ├── mistral.ts
│ ├── multi-model.ts
│ ├── pixabay.ts
│ ├── stripe.ts
│ ├── supabase
│ │ ├── client.ts
│ │ ├── middleware.ts
│ │ └── server.ts
│ ├── utils.ts
│ ├── vapi.sdk.ts
│ └── voice-agent-credits.ts
├── middleware.ts
├── next-env.d.ts
├── next-i18next.config.js
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│ ├── assets
│ │ └── images
│ │ ├── banner.png
│ │ ├── logo-icon.png
│ │ └── logo.png
│ ├── icons
│ │ ├── bookmark-filled.svg
│ │ ├── bookmark.svg
│ │ ├── cap.svg
│ │ ├── check.svg
│ │ ├── clock.svg
│ │ ├── coding.svg
│ │ ├── economics.svg
│ │ ├── google.svg
│ │ ├── history.svg
│ │ ├── language.svg
│ │ ├── logout.svg
│ │ ├── maths.svg
│ │ ├── mic-off.svg
│ │ ├── mic-on.svg
│ │ ├── plus.svg
│ │ ├── science.svg
│ │ └── search.svg
│ ├── images
│ │ ├── cta.svg
│ │ ├── limit.svg
│ │ └── logo.svg
│ ├── locales
│ │ ├── en
│ │ │ └── common.json
│ │ └── fr
│ │ └── common.json
│ └── readme
│ ├── hero.png
│ ├── jsmpro.jpg
│ ├── thumbnail.png
│ └── videokit.jpg
├── tailwind.config.ts
├── tsconfig.json
├── types
│ ├── course.ts
│ ├── index.d.ts
│ ├── index.ts
│ ├── pdf-types.ts
│ ├── presentation.ts
│ ├── supabase.ts
│ └── vapi.d.ts
├── utils
│ ├── parseJson.ts
│ ├── pdfExport.ts
│ └── presentationPdfExport.ts
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

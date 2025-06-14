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

- ✅ **Authentication:** Email and Google SSO via Supabase Auth
- 🧠 **AI Course Generation:** Prompt-based course creation using Gemini API
- 🗃️ **Course Management:** Create, publish, archive courses
- 📚 **Learning Interface:** Dashboard with progress tracking and quizzes
- 📊 **Admin Dashboard:** Basic analytics for users with active subscriptions
- 💳 **Payments Integration:** Stripe checkout with course limits enforced
  - Free Plan → 1 course
  - Paid Plans → Multiple courses
- 👤 **Profile & Settings:** User can manage their personal data and preferences
.
├── README.md
├── app
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
├── assets
│   └── images
│       └── banner.png
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
│   └── useAutoSave.ts
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
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── types
│   ├── course.ts
│   ├── index.ts
│   └── pdf-types.ts
├── utils
│   └── pdfExport.ts
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

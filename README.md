# CourseForger - AI-Powered Learning Management System

CourseForger is a modern Learning Management System (LMS) built with Next.js and Supabase, designed to empower creators to easily generate and manage online courses. It leverages AI for content generation assistance and provides a seamless experience for both course creators and learners.

## Features

*   **AI-Assisted Course Generation:** (Potentially using `@google/generative-ai`) Quickly scaffold course structures, lesson content, and quizzes.
*   **Rich Content Formatting:** Lessons are rendered from Markdown, supporting rich text, code blocks with syntax highlighting, lists, and more for an engaging learning experience.
*   **Subscription Management:** Integrated with Stripe for handling user subscriptions and plan-based access to features.
    *   Multiple Tiers (e.g., Free, Pro, Ultimate) with varying course creation limits.
    *   Secure checkout and customer portal for managing subscriptions.
*   **Course Creation Limits:**
    *   Enforces limits on the number of courses a user can create based on their subscription plan.
    *   Tracks lifetime course creations to prevent abuse of free tier limits.
*   **User Authentication & Profiles:** Secure user registration and login powered by Supabase Auth. User profiles store relevant information and preferences.
*   **Interactive Course Navigation:**
    *   Resizable side panel for easy navigation through chapters and lessons.
    *   Progress tracking for lessons and overall course completion.
    *   Interactive quizzes within lessons with instant feedback.
*   **Dashboard:**
    *   Overview of user statistics (total courses, progress).
    *   Easy access to create new courses and manage existing ones.
    *   Displays current subscription plan and course creation allowance.
*   **Settings Page:**
    *   View user account information (email).
    *   Manage subscription via Stripe customer portal.
    *   Account deletion with data removal and subscription cancellation.
*   **PDF Export:** Export course content (or parts of it) to PDF (using `html2pdf.js`).
*   **Responsive Design:** Built with Tailwind CSS for a consistent experience across devices.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Backend & Database:** [Supabase](https://supabase.io/)
    *   Authentication
    *   PostgreSQL Database
    *   Storage (for course assets, if applicable)
    *   Edge Functions / Serverless Functions (RPC for operations like user deletion)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** Custom components + [shadcn/ui](https://ui.shadcn.com/) (based on project structure)
*   **Markdown Rendering:**
    *   `react-markdown`
    *   `remark-gfm` (GitHub Flavored Markdown)
    *   `rehype-highlight` (Syntax highlighting for code blocks)
*   **Payments & Subscriptions:** [Stripe](https://stripe.com/)
*   **AI Content Generation:** `@google/generative-ai` (Gemini)
*   **PDF Generation:** `html2pdf.js`
*   **Language:** TypeScript

## Getting Started

### Prerequisites

*   Node.js (e.g., v18.x or v20.x)
*   npm or yarn
*   Supabase account and project setup
*   Stripe account and API keys
*   Google Gemini API Key

### Clone and Run Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/courseforger.git
    cd courseforger
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add your Supabase, Stripe, and Gemini API keys:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key # If needed for admin tasks
    STRIPE_SECRET_KEY=your_stripe_secret_key
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
    STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret # For handling Stripe events
    GEMINI_API_KEY=your_gemini_api_key
    # Add any other necessary environment variables (e.g., NEXT_PUBLIC_APP_URL for production)
    ```

4.  **Set up Supabase database schema:**
    Apply the migrations located in `supabase/migrations/` to your Supabase project.
    ```bash
    npx supabase login
    npx supabase link --project-ref <your-project-id>
    npx supabase db push
    # Or apply migrations manually via the Supabase dashboard SQL editor.
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Future Improvements

*   **Advanced AI Content Tools:**
    *   More granular control over AI-generated content (tone, style, depth).
    *   AI-powered content summarization or question generation.
    *   Image generation for course thumbnails or lesson illustrations.
*   **Enhanced Analytics:** Detailed analytics for course creators on student engagement, completion rates, and quiz performance.
*   **Community Features:** Discussion forums per course or lesson, Q&A sections.
*   **Gamification:** Badges, points, leaderboards to increase student motivation.
*   **Direct File Uploads:** For course materials (videos, PDFs, presentations) using Supabase Storage.
*   **Mobile Application:** Native or PWA for learning on the go.
*   **Internationalization (i18n):** Support for multiple languages.
*   **Accessibility (a11y) Enhancements:** Continuous improvements to meet WCAG standards.
*   **More Theming Options:** Allow users to customize the look and feel of their course pages.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue for bugs, features, or improvements.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. (You may want to create a `LICENSE` file with the MIT License text if one doesn't exist).


- Works across the entire [Next.js](https://nextjs.org) stack
  - App Router
  - Pages Router
  - Middleware
  - Client
  - Server
  - It just works!
- supabase-ssr. A package to configure Supabase Auth to use cookies
- Password-based authentication block installed via the [Supabase UI Library](https://supabase.com/ui/docs/nextjs/password-based-auth)
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Components with [shadcn/ui](https://ui.shadcn.com/)
- Optional deployment with [Supabase Vercel Integration and Vercel deploy](#deploy-your-own)
  - Environment variables automatically assigned to Vercel project

## Demo

You can view a fully working demo at [demo-nextjs-with-supabase.vercel.app](https://demo-nextjs-with-supabase.vercel.app/).

## Deploy to Vercel

Vercel deployment will guide you through creating a Supabase account and project.

After installation of the Supabase integration, all relevant environment variables will be assigned to the project so the deployment is fully functioning.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&project-name=nextjs-with-supabase&repository-name=nextjs-with-supabase&demo-title=nextjs-with-supabase&demo-description=This+starter+configures+Supabase+Auth+to+use+cookies%2C+making+the+user%27s+session+available+throughout+the+entire+Next.js+app+-+Client+Components%2C+Server+Components%2C+Route+Handlers%2C+Server+Actions+and+Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2Fopengraph-image.png)

The above will also clone the Starter kit to your GitHub, you can clone that locally and develop locally.

If you wish to just develop locally and not deploy to Vercel, [follow the steps below](#clone-and-run-locally).

## Clone and run locally

1. You'll first need a Supabase project which can be made [via the Supabase dashboard](https://database.new)

2. Create a Next.js app using the Supabase Starter template npx command

   ```bash
   npx create-next-app --example with-supabase with-supabase-app
   ```

   ```bash
   yarn create next-app --example with-supabase with-supabase-app
   ```

   ```bash
   pnpm create next-app --example with-supabase with-supabase-app
   ```

3. Use `cd` to change into the app's directory

   ```bash
   cd with-supabase-app
   ```

4. Rename `.env.example` to `.env.local` and update the following:

   ```
   NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT SUPABASE PROJECT API ANON KEY]
   ```

   Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` can be found in [your Supabase project's API settings](https://supabase.com/dashboard/project/_?showConnect=true)

5. You can now run the Next.js local development server:

   ```bash
   npm run dev
   ```

   The starter kit should now be running on [localhost:3000](http://localhost:3000/).

6. This template comes with the default shadcn/ui style initialized. If you instead want other ui.shadcn styles, delete `components.json` and [re-install shadcn/ui](https://ui.shadcn.com/docs/installation/next)

> Check out [the docs for Local Development](https://supabase.com/docs/guides/getting-started/local-development) to also run Supabase locally.

## Feedback and issues

Please file feedback and issues over on the [Supabase GitHub org](https://github.com/supabase/supabase/issues/new/choose).

## More Supabase examples

- [Next.js Subscription Payments Starter](https://github.com/vercel/nextjs-subscription-payments)
- [Cookie-based Auth and the Next.js 13 App Router (free course)](https://youtube.com/playlist?list=PL5S4mPUpp4OtMhpnp93EFSo42iQ40XjbF)
- [Supabase Auth and the Next.js App Router](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)

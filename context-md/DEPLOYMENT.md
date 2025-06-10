# Deploying CourseForger to Vercel

This guide provides step-by-step instructions for deploying the CourseForger application to Vercel.

## 1. Prerequisites

- A [Vercel](https://vercel.com/) account.
- A [GitHub](https://github.com/), [GitLab](https://gitlab.com/), or [Bitbucket](https://bitbucket.org/) account where your project repository is hosted.
- Your Supabase project and Stripe account credentials ready.

## 2. Importing Your Project

1.  **Log in to Vercel** with your account.
2.  From your dashboard, click **"Add New..."** and select **"Project"**.
3.  **Import your Git Repository** by connecting your Git provider (e.g., GitHub) and selecting the `courseforger` repository.
4.  Vercel will automatically detect that this is a Next.js project and configure the build settings for you. The default settings are usually correct and do not need to be changed.

## 3. Configure Environment Variables

This is the most critical step. You need to add all the environment variables from your local `.env.local` file to your Vercel project settings.

Navigate to your project's **Settings** tab, go to the **Environment Variables** section, and add the following keys and their corresponding values:

| Variable Name                       | Description                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`          | Your Supabase project URL.                                                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | Your Supabase project's public anonymous key.                               |
| `SUPABASE_SERVICE_ROLE_KEY`         | Your Supabase project's service role key (secret).                          |
| `STRIPE_SECRET_KEY`                 | Your Stripe account's secret key.                                           |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`| Your Stripe account's publishable key.                                      |
| `STRIPE_WEBHOOK_SECRET`             | The signing secret for your Stripe webhook endpoint.                        |
| `GOOGLE_GEMINI_API_KEY`             | Your API key for the Google Gemini AI service.                              |

**Important:**
- Ensure `NEXT_PUBLIC_` variables are correctly prefixed so they are exposed to the browser.
- Keep all secret keys secure and do not expose them publicly.

## 4. Deploy

Once the environment variables are set, go to the **Deployments** tab and trigger a new deployment. Vercel will build and deploy your application.

## 5. Update Stripe Webhook Endpoint

After the deployment is successful, Vercel will provide you with a production URL (e.g., `https-your-project-name.vercel.app`). You must update your Stripe webhook to use this new URL.

1.  Go to your **Stripe Dashboard**.
2.  Navigate to **Developers > Webhooks**.
3.  Select the webhook endpoint you created for this project.
4.  Click **"Update details"**.
5.  Change the **Endpoint URL** to `https://<your-vercel-production-url>/api/stripe/webhook`.
6.  Save the changes.

Your application is now fully deployed and configured to handle payments and subscriptions correctly in a production environment.

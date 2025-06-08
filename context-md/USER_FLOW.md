# User Flow for LMS MVP

## Landing Page
A visitor lands on the website and sees an overview of the platform: create AI-powered courses, learn at your own pace, and choose subscription plans.
They click “Sign Up Free” to create an account or “Log In” if they already have one.
Next, they go to the login/sign-up page.

## Sign-Up or Login
The user signs up with their email and password or uses their Google account. They can also log in the same way.
After signing up or logging in, they’re taken to their personal dashboard.

## Dashboard
The dashboard shows the user’s created courses and the progress of the courses . It also displays their plan (e.g., “Free Plan: 1 course”) and options to create a new course or check their profile.
They click “Create New Course” to make a course or “View Profile” to manage settings.

## Create a Course
The user enters a prompt (e.g., “Make a Python course”) and picks options: number of chapters (e.g., 3), lessons per chapter (e.g., 4), and difficulty level (e.g., beginner, intermediate, advanced).
They click “Generate Course” to create a course with AI, then see a preview with the course title, chapters, and lessons.
They can edit only the course title, then click “Save Course.” to save the course in the database

If they’re on the free plan and already made one course, they’re prompted to upgrade their plan. Otherwise, the course saves, and they return to the dashboard.

## Manage Courses
The user sees a list of only their created courses.
For each course, they can edit the title, delete the course, or enroll in it to start learning.
Deleting a course removes it permanently but does not reset their course creation limit (e.g.the limit desnt not go back to 0 after deleting a course)
They can enroll in their own course to learn it.
After managing, they return to the dashboard.

## Learn a Course
The user picks a course they created and enrolled in to start learning.
They go through chapters and lessons (text, quizzes, or videos), see their progress, and take quizzes that are graded automatically.
When they finish a lesson or course, they go back to the dashboard.

## Upgrade Plan
If the user tries to create more courses than their plan allows (e.g., 1 for free), they’re taken to a payment page.
They choose a plan (e.g., Basic: 5 courses for €10/month, Premium: 20 courses for €25/month) and pay with a credit card. using stripe
After payment, their plan updates, letting them create more courses, and they return to the dashboard.

## Profile/Settings
The user views or updates their email and agrees to share data if the platform is sold (for legal reasons).
They can export a course as a pdf file.
They can see their plan details and log out.
After making changes, they return to the dashboard.

## Analytics Dashboard
The user visits an analytics page to see stats about their courses, like how many they created or their learning progress.
They return to the dashboard afterward.

## Summary
A user visits the site, signs up or logs in, and goes to their dashboard. They create a course by entering a prompt and choosing chapters, lessons, and difficulty, limited by their plan (e.g., 1 for free). They can edit only the course title, delete a course (without resetting their limit), or enroll to learn it. They track progress while learning, upgrade their plan if needed, manage their profile, or check analytics, always returning to the dashboard for a simple experience.
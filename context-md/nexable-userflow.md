🧭 Nexable B2B User Flow
🔐 1. Authentication & Landing
User lands on main site

Signs up or logs in using email or Google

Redirected to:

/organizations if not part of any org

/[orgSlug]/dashboard if already part of an organization

🏢 2. Organization Creation (Admin only)
User creates a new organization:

Enters org name, slug (e.g., acme)

Uploads logo (optional)

This user becomes the admin

System creates:

organizations entry

organization_members entry with role = admin

Redirected to: /acme/dashboard

📧 3. Team Management
Admin goes to /[orgSlug]/team

Can:

Invite users via email

Assign roles: manager, learner

View invite status

Invited users get email → click → accept invite → become members

📚 4. Course Creation (Admin or Manager)
Goes to /[orgSlug]/courses/new

Inputs prompt, number of chapters, lessons, difficulty

AI generates course (title, chapters, lessons)

Can edit course with Notion-style editor

Saves → Course is now available for the org

📤 5. Assign Courses to Team Members
Admin or Manager selects a course

Clicks “Assign to learners”

Chooses members or teams

Those users get access on their dashboards

🧠 6. Learning Experience (Learner Role)
Learner sees assigned courses in /[orgSlug]/dashboard

Clicks course → learns chapter by chapter

Quizzes show up at end of lessons (if present)

Progress is auto-tracked in org_progress

📊 7. Analytics (Admin/Manager)
Access /[orgSlug]/analytics

View:

Completion % per employee

Time spent per lesson

Who finished which courses

Quiz scores, leaderboard

📄 8. Reports & Compliance
Export PDF reports (per learner or entire team)

See course completions for compliance (onboarding, HR, etc.)

💳 9. Billing & Plans
Admin views plan in /[orgSlug]/settings

Plan may include:

Seat limits

Course generation quota

Billing history (Stripe customer portal)

Can upgrade/downgrade → limits change automatically

🧑‍💼 10. Role-Specific Permissions Summary
Role	Can Generate Courses	Can Assign Members	View Analytics	Learn Courses
Admin	✅ Yes	✅ Yes	✅ Yes	✅ Yes
Manager	✅ Yes	❌ No (can assign existing)	✅ Yes	✅ Yes
Learner	❌ No	❌ No	❌ No	✅ Yes
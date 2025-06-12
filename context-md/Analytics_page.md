# Analytics Page
Help the learner  track their own progress, engagement, and learning behavior across their personalized course.

✅ Core Features to Include (Per User)

1. 🧭 Progress Overview
% Course Completed

Chapters completed / total

Lessons completed / total

Current lesson in progress

Last activity timestamp

2. 📊 Learning Engagement
Line chart: Daily activity (minutes/day or lessons viewed)

Streak count: Consecutive days of learning

Time spent learning: total + avg session length

3. 🕹️ Lesson Interaction
Lesson status: Not started / In progress / Completed

Time spent per lesson

Optional: quiz performance if any assessments are planned

4. 🔔 Milestones
Badges like:

“First Chapter Completed”

“1 Hour Spent Learning”

“Completed All Lessons”


🧱 ShadCN UI Components to Use (Per User Dashboard)
Feature	Component
Progress tracking	<Progress />, <Badge />, <Card />
Time charts	Use Recharts inside <Card />
Tabs (Overview, Lessons)	<Tabs />, <TabsList />, <TabsContent />
Lesson list	<Accordion /> + <Checkbox /> or <Progress />
Timeline	<Separator /> + vertical layout with timestamps

🎯 1. Track Progress Per Lesson
Use the progress table:

user_id, lesson_id, is_completed, completed_at

Join lessons → chapters → courses to get course structure

You can compute:

% course completed

Lessons done vs total

Time since last activity (from completed_at)

📚 2. Lesson and Course Metadata
From:

courses → general course info

chapters & lessons → structure + order

plans and subscriptions → if tied to features

📅 3. Enrollment & Milestone Timings
From:

enrollments.enrolled_at

progress.completed_at timestamps

This lets you:

Show a learning timeline

Calculate learning streaks (based on completed_at dates)

Count total time spent (approximate by average lesson duration or add a new field)
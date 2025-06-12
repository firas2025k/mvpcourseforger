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


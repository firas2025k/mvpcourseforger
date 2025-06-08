# 📘 AI Course Generation Context (For Gemini API)

## 🎯 Objective
Generate a complete course structure based on user input using Gemini. The generated structure should include the course title, chapters, lessons, content, and quizzes for each lesson. YouTube integration is not required at this stage.

---

## 🧾 User Input Fields
The user will provide the following:
- `prompt`: What the course should be about (e.g., "Create a course about Python programming basics.")
- `chapters`: Number of chapters (e.g., `3`)
- `lessons_per_chapter`: Number of lessons in each chapter (e.g., `4`)
- `difficulty`: The course level (beginner, intermediate, advanced)

---

## 📦 Expected JSON Output Format

```json
{
  "title": "Introduction to Python Programming",
  "difficulty": "beginner",
  "chapters": [
    {
      "title": "Getting Started with Python",
      "lessons": [
        {
          "title": "Installing Python",
          "content": "In this lesson, you'll learn how to install Python on your machine...",
          "quiz": {
            "questions": [
              {
                "question": "Which website do you use to download Python?",
                "choices": ["python.org", "java.com", "github.com", "google.com"],
                "answer": "python.org"
              }
            ]
          }
        }
        // More lessons...
      ]
    }
    // More chapters...
  ]
}


##  Gemini Prompt Template

You can pass this to Gemini in a system or user role prompt:

You are an AI course generator.
Based on the following input:

Prompt: {{course_prompt}}

Chapters: {{num_chapters}}

Lessons per chapter: {{lessons_per_chapter}}

Difficulty: {{difficulty_level}}

Please return a JSON object with the following structure:

json
Copy
Edit
{
  "title": "Course Title",
  "difficulty": "beginner",
  "chapters": [
    {
      "title": "Chapter Title",
      "lessons": [
        {
          "title": "Lesson Title",
          "content": "Text content of the lesson...",
          "quiz": {
            "questions": [
              {
                "question": "Question text?",
                "choices": ["A", "B", "C", "D"],
                "answer": "Correct Answer"
              }
            ]
          }
        }
      ]
    }
  ]
}
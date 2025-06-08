"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CreateCoursePage() {
  const [prompt, setPrompt] = useState('');
  const [numChapters, setNumChapters] = useState<number | string>(5);
  const [numLessonsPerChapter, setNumLessonsPerChapter] = useState<number | string>(5);
  const [difficulty, setDifficulty] = useState('beginner');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          chapters: Number(numChapters),
          lessons_per_chapter: Number(numLessonsPerChapter),
          difficulty,
        }),
      });

      setIsLoading(false);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error generating course:', errorData);
        alert(`Failed to generate course: ${errorData.error || response.statusText}`);
        return;
      }

      const courseData = await response.json();
      console.log('Generated Course Data:', courseData);
      alert('Course outline generated successfully! Check the console for the data.');
      // TODO: Handle the successful response (e.g., navigate to a new page, display data, save to DB)
      // For now, we'll just log it and show an alert.
      // Example: router.push(`/dashboard/courses/edit/${courseData.id}`); 

    } catch (error) {
      setIsLoading(false);
      console.error('Error submitting form:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <div className="mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Course</CardTitle>
          <CardDescription>
            Fill in the details below to generate your course outline using AI.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="prompt">Course Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="e.g., 'A comprehensive guide to digital marketing for startups'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Describe the main topic or subject of your course.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="numChapters">Number of Chapters</Label>
                <Input
                  id="numChapters"
                  type="number"
                  placeholder="e.g., 10"
                  value={numChapters}
                  onChange={(e) => setNumChapters(e.target.value ? parseInt(e.target.value) : '')}
                  min="1"
                  max="50" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numLessonsPerChapter">Lessons per Chapter</Label>
                <Input
                  id="numLessonsPerChapter"
                  type="number"
                  placeholder="e.g., 5"
                  value={numLessonsPerChapter}
                  onChange={(e) => setNumLessonsPerChapter(e.target.value ? parseInt(e.target.value) : '')}
                  min="1"
                  max="20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={difficulty} onValueChange={setDifficulty} required>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
              {isLoading ? 'Generating Course...' : 'Generate Course Outline'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

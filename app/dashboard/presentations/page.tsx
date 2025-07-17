// app/dashboard/presentations/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  Presentation,
  Loader2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PresentationCard from "@/components/dashboard/PresentationCard";
import { createBrowserClient } from '@supabase/ssr';

interface PresentationData {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  slide_count: number;
  theme: string;
  created_at: string;
  is_published: boolean;
  is_archived: boolean;
  slides?: any[];
}

function PresentationsPage() {
  const router = useRouter();
  const [presentations, setPresentations] = useState<PresentationData[]>([]);
  const [filteredPresentations, setFilteredPresentations] = useState<PresentationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [themeFilter, setThemeFilter] = useState<string>("all");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchPresentations();
  }, []);

  useEffect(() => {
    filterPresentations();
  }, [presentations, searchQuery, difficultyFilter, themeFilter]);

  const fetchPresentations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError('Please log in to view your presentations.');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('presentations')
        .select(`
          id,
          title,
          difficulty,
          slide_count,
          theme,
          created_at,
          is_published,
          is_archived,
          slides (id)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching presentations:', fetchError);
        setError('Failed to load presentations. Please try again.');
        return;
      }

      setPresentations(data || []);
    } catch (err) {
      console.error('Error in fetchPresentations:', err);
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPresentations = () => {
    let filtered = presentations;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(presentation =>
        presentation.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Difficulty filter
    if (difficultyFilter !== "all") {
      filtered = filtered.filter(presentation => presentation.difficulty === difficultyFilter);
    }

    // Theme filter
    if (themeFilter !== "all") {
      filtered = filtered.filter(presentation => presentation.theme === themeFilter);
    }

    setFilteredPresentations(filtered);
  };

  const handleDeletePresentation = async (presentationId: string) => {
    try {
      const response = await fetch(`/api/presentation-details/${presentationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete presentation');
      }

      // Remove from local state
      setPresentations(prev => prev.filter(p => p.id !== presentationId));
    } catch (error) {
      console.error('Error deleting presentation:', error);
      setError('Failed to delete presentation. Please try again.');
    }
  };

  const handleArchivePresentation = async (presentationId: string) => {
    try {
      const presentation = presentations.find(p => p.id === presentationId);
      if (!presentation) return;

      const { error } = await supabase
        .from('presentations')
        .update({ is_archived: !presentation.is_archived })
        .eq('id', presentationId);

      if (error) {
        throw error;
      }

      // Update local state
      setPresentations(prev => prev.map(p => 
        p.id === presentationId 
          ? { ...p, is_archived: !p.is_archived }
          : p
      ));
    } catch (error) {
      console.error('Error archiving presentation:', error);
      setError('Failed to archive presentation. Please try again.');
    }
  };

  const handleDuplicatePresentation = async (presentationId: string) => {
    // TODO: Implement duplication logic
    console.log('Duplicate presentation:', presentationId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
          <p className="text-slate-600 dark:text-slate-400">Loading your presentations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 mx-auto text-red-600" />
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchPresentations} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <Presentation className="h-8 w-8 text-purple-600" />
              My Presentations
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Create and manage your AI-generated presentations
            </p>
          </div>
          
          <Button 
            asChild
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/dashboard/presentations/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Presentation
              <Sparkles className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search presentations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
            />
          </div>
          
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full md:w-48 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={themeFilter} onValueChange={setThemeFilter}>
            <SelectTrigger className="w-full md:w-48 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Themes</SelectItem>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white/90 dark:bg-slate-800/90">
              {filteredPresentations.length} presentation{filteredPresentations.length !== 1 ? 's' : ''}
            </Badge>
            {(searchQuery || difficultyFilter !== "all" || themeFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setDifficultyFilter("all");
                  setThemeFilter("all");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Presentations Grid */}
        {filteredPresentations.length === 0 ? (
          <div className="text-center py-16">
            <Presentation className="h-16 w-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {presentations.length === 0 ? "No presentations yet" : "No presentations match your filters"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {presentations.length === 0 
                ? "Create your first AI-generated presentation to get started"
                : "Try adjusting your search or filter criteria"
              }
            </p>
            {presentations.length === 0 && (
              <Button 
                asChild
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
              >
                <Link href="/dashboard/presentations/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Presentation
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPresentations.map((presentation) => (
              <PresentationCard
                key={presentation.id}
                presentation={presentation}
                onDelete={handleDeletePresentation}
                onArchive={handleArchivePresentation}
                onDuplicate={handleDuplicatePresentation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PresentationsPage;


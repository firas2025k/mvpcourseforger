"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CoursesSearchFilterProps {
  initialSearchQuery?: string;
  initialDifficultyFilter?: string;
  initialStatusFilter?: string;
  initialSortBy?: string;
}

export default function CoursesSearchFilter({
  initialSearchQuery = "",
  initialDifficultyFilter = "all",
  initialStatusFilter = "all",
  initialSortBy = "created_at",
}: CoursesSearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [difficultyFilter, setDifficultyFilter] = useState(
    initialDifficultyFilter
  );
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [sortBy, setSortBy] = useState(initialSortBy);

  const updateURL = (params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== "all") {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });

    router.push(`/dashboard/courses?${newSearchParams.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateURL({
      q: value,
      difficulty: difficultyFilter === "all" ? "" : difficultyFilter,
      status: statusFilter === "all" ? "" : statusFilter,
      sort: sortBy,
    });
  };

  const handleDifficultyChange = (value: string) => {
    setDifficultyFilter(value);
    updateURL({
      q: searchQuery,
      difficulty: value === "all" ? "" : value,
      status: statusFilter === "all" ? "" : statusFilter,
      sort: sortBy,
    });
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    updateURL({
      q: searchQuery,
      difficulty: difficultyFilter === "all" ? "" : difficultyFilter,
      status: value === "all" ? "" : value,
      sort: sortBy,
    });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    updateURL({
      q: searchQuery,
      difficulty: difficultyFilter === "all" ? "" : difficultyFilter,
      status: statusFilter === "all" ? "" : statusFilter,
      sort: value,
    });
  };

  return (
    <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <Select
              value={difficultyFilter}
              onValueChange={handleDifficultyChange}
            >
              <SelectTrigger className="w-[140px] bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[120px] bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[140px] bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Latest</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="difficulty">Difficulty</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

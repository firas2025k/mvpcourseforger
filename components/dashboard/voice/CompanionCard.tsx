"use client";
import { removeBookmark } from "@/actions/companion.actions";
import { addBookmark } from "@/actions/companion.actions";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, BookmarkIcon, Play, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanionCardProps {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color: string;
  bookmarked: boolean;
}

const CompanionCard = ({
  id,
  name,
  topic,
  subject,
  duration,
  color,
  bookmarked,
}: CompanionCardProps) => {
  const pathname = usePathname();
  const handleBookmark = async () => {
    if (bookmarked) {
      await removeBookmark(id, pathname);
    } else {
      await addBookmark(id, pathname);
    }
  };

  return (
    <article className="bg-gradient-to-br from-white/90 via-slate-50/90 to-blue-50/90 dark:from-slate-900/90 dark:via-slate-800/90 dark:to-blue-900/90 backdrop-blur-md rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl p-6 flex flex-col gap-4 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group">
      <div className="flex justify-between items-center">
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-full text-sm font-semibold border border-blue-200/50 dark:border-blue-700/50 shadow-md">
          {subject}
        </div>
        <button
          className={cn(
            "p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-md",
            bookmarked
              ? "bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-600 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-700/50"
              : "bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-600/50 hover:from-yellow-100 hover:to-orange-100 hover:text-yellow-600"
          )}
          onClick={handleBookmark}
        >
          <BookmarkIcon
            className={cn(
              "h-4 w-4 transition-all duration-300",
              bookmarked && "fill-current"
            )}
          />
        </button>
      </div>

      <div className="flex-1 space-y-3">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
          {name}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
          {topic}
        </p>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <div className="bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-800 dark:to-blue-900 px-3 py-2 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <p className="text-sm font-medium">{duration} minutes</p>
          </div>
        </div>
      </div>

      <Link href={`/dashboard/voice/${id}`} className="w-full">
        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 group/button">
          <div className="relative">
            <Play className="h-5 w-5 group-hover/button:scale-110 transition-transform duration-200" />
            <div className="absolute inset-0 bg-white rounded-full blur opacity-20 animate-pulse"></div>
          </div>
          Launch Lesson
          <Zap className="h-4 w-4 text-yellow-300" />
        </button>
      </Link>
    </article>
  );
};

export default CompanionCard;

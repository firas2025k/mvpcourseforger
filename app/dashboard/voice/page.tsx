import { getAllCompanions } from "@/actions/companion.actions";
import CompanionCard from "@/components/dashboard/voice/CompanionCard";
import { getSubjectColor } from "@/lib/utils";
import Link from "next/link";
import { PlusCircle, Zap } from "lucide-react";

const CompanionsLibrary = async ({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) => {
  const subject =
    typeof searchParams?.subject === "string" ? searchParams.subject : "";
  const topic =
    typeof searchParams?.topic === "string" ? searchParams.topic : "";

  const companions = await getAllCompanions({ subject, topic });

  return (
    <main className="bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 min-h-screen p-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent">
          AI Companions
        </h1>

        <Link href="/dashboard/voice/new">
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center gap-3 group">
            <div className="relative">
              <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              <div className="absolute inset-0 bg-white rounded-full blur opacity-20 animate-pulse"></div>
            </div>
            Create New Companion
            <Zap className="h-4 w-4 text-yellow-300" />
          </button>
        </Link>
      </div>

      {/* Companions Grid */}
      <section className="companions-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {companions.map((companion) => (
          <CompanionCard
            key={companion.id}
            {...companion}
            color={getSubjectColor(companion.subject)}
          />
        ))}
      </section>

      {/* Empty State */}
      {companions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-4">
              No companions found
            </h3>
            <Link href="/dashboard/voice/new">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center gap-3 group mx-auto">
                <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                Create Your First Companion
              </button>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
};

export default CompanionsLibrary;

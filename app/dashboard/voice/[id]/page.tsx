import { getCompanion } from "@/actions/companion.actions";
import { redirect } from "next/navigation";
import { getSubjectColor } from "@/lib/utils";
import Image from "next/image";
import CompanionComponent from "@/components/dashboard/voice/CompanionComponent";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Companion } from "@/types/index.d";
import { Sparkles, Clock, BookOpen } from "lucide-react";

interface CompanionSessionPageProps {
  params: { id: string };
}

const CompanionSession = async ({ params }: CompanionSessionPageProps) => {
  const { id } = params;
  const companion: Companion = await getCompanion(id);

  // SSR Supabase Auth
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");
  if (!companion?.name) redirect("/companions");

  const { name, subject, topic, duration } = companion;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 flex flex-col items-center py-8 px-2">
      {/* Top Info Card */}
      <section className="w-full max-w-3xl rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-6 flex items-center justify-between mb-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-xl">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div
                className="rounded-xl p-3 shadow-lg transition-all duration-300 group-hover:scale-110"
                style={{ backgroundColor: getSubjectColor(subject) }}
              >
                <Image
                  src={`/icons/${subject}.svg`}
                  alt={subject}
                  width={32}
                  height={32}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-2xl bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent">
                  {name}
                </h2>
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50">
                  <BookOpen className="inline h-3 w-3 mr-1" />
                  {subject}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                {topic}
              </p>
            </div>
          </div>
        </div>
        {duration && (
          <div className="text-right">
            <div className="flex items-center gap-2 text-lg font-medium text-slate-700 dark:text-slate-300 bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-800 dark:to-blue-900 px-4 py-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <Clock className="h-5 w-5 text-blue-500" />
              {duration} minutes
            </div>
          </div>
        )}
      </section>

      {/* Main Interaction Area */}
      <section className="w-full max-w-4xl rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-xl p-0 flex flex-col overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 dark:from-blue-400/10 dark:to-purple-400/10"></div>
          <CompanionComponent
            {...companion}
            companionId={id}
            userName={user.user_metadata?.full_name || user.email}
            userImage={user.user_metadata?.avatar_url || ""}
            style={(companion as any).style || ""}
            voice={(companion as any).voice || ""}
          />
        </div>
      </section>
    </main>
  );
};

export default CompanionSession;


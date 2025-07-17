import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, getSubjectColor } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import type { Companion } from "@/types/index.d";
import { Clock, BookOpen, Sparkles, Play } from "lucide-react";

interface CompanionsListProps {
  title: string;
  companions?: Companion[];
  classNames?: string;
}

const CompanionsList = ({
  title,
  companions,
  classNames,
}: CompanionsListProps) => {
  return (
    <article className={cn("companion-list", classNames)}>
      <div className="mb-8">
        <h2 className="font-bold text-3xl bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-purple-500" />
          {title}
        </h2>
      </div>

      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/80 to-blue-50/80 dark:from-slate-800/80 dark:to-blue-900/80 hover:bg-gradient-to-r hover:from-slate-100/80 hover:to-blue-100/80 dark:hover:from-slate-700/80 dark:hover:to-blue-800/80">
              <TableHead className="text-lg font-semibold w-2/3 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Lessons
                </div>
              </TableHead>
              <TableHead className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                Subject
              </TableHead>
              <TableHead className="text-lg font-semibold text-right text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 justify-end">
                  <Clock className="h-5 w-5 text-purple-500" />
                  Duration
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companions?.map(({ id, subject, name, topic, duration }) => (
              <TableRow
                key={id}
                className="border-slate-200/60 dark:border-slate-700/60 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-blue-50/50 dark:hover:from-slate-800/50 dark:hover:to-blue-900/50 transition-all duration-300 group"
              >
                <TableCell className="py-6">
                  <Link
                    href={`/dashboard/voice/${id}`}
                    className="block group-hover:scale-[1.02] transition-transform duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative group/icon">
                        <div
                          className="size-[72px] flex items-center justify-center rounded-xl max-md:hidden shadow-lg group-hover/icon:scale-110 transition-all duration-300"
                          style={{ backgroundColor: getSubjectColor(subject) }}
                        >
                          <Image
                            src={`/icons/${subject}.svg`}
                            alt={subject}
                            width={35}
                            height={35}
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-xl blur opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 max-md:hidden"></div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="font-bold text-2xl bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                          {name}
                        </p>
                        <p className="text-lg text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          {topic}
                        </p>
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-full text-sm font-semibold border border-blue-200/50 dark:border-blue-700/50 w-fit max-md:hidden shadow-md">
                    {subject}
                  </div>
                  <div
                    className="flex items-center justify-center rounded-xl w-fit p-3 md:hidden shadow-lg"
                    style={{ backgroundColor: getSubjectColor(subject) }}
                  >
                    <Image
                      src={`/icons/${subject}.svg`}
                      alt={subject}
                      width={18}
                      height={18}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 w-full justify-end">
                    <div className="bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-800 dark:to-blue-900 px-4 py-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-md">
                      <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                        {duration}{" "}
                        <span className="max-md:hidden text-sm opacity-75">
                          mins
                        </span>
                      </p>
                    </div>
                    <div className="md:hidden bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-2 rounded-lg">
                      <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </article>
  );
};

export default CompanionsList;

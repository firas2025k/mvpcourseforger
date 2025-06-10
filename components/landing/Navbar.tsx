import Link from 'next/link';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { AuthButton } from '@/components/auth/auth-button';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="w-full sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700/50 h-16 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center p-3 px-5 text-sm h-full">
        <Link href="/" className="font-bold text-xl text-purple-600 dark:text-purple-400">
          CourseForger
        </Link>
        <div className="hidden md:flex gap-6 items-center">
          <Link href="#features" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Pricing</Link>
          {/* <Link href="#testimonials" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Testimonials</Link> */}
          {/* <Link href="/blog" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Blog</Link> */}
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {user && (
            <Button asChild size="sm" variant={"secondary"}>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          )}
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}

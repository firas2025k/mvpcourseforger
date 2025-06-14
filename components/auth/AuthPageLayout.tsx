import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
import Logo from "@/public/assets/images/logo.png"

interface AuthPageLayoutProps {
  children: ReactNode;
  // We might not need pageTitle and pageDescription here if the CardHeader in the form provides it.
  // pageTitle: string;
  // pageDescription: string;
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/50 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="absolute top-6 left-6 md:top-8 md:left-8">
        <Link href="/" className="font-bold text-xl md:text-2xl text-purple-600 dark:text-purple-400 hover:opacity-80 transition-opacity">
        <Image alt='logo' src={Logo} width={150} height={30}/>
        </Link>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center text-xs text-gray-500 dark:text-gray-400 bg-transparent">
        &copy; {new Date().getFullYear()} NexusEd. All rights reserved.
        <Link href="/" className="ml-2 underline hover:text-purple-600 dark:hover:text-purple-400">Go to Homepage</Link>
      </footer>
    </div>
  );
}

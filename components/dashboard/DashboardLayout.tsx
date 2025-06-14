/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import logoIcon from "@/public/assets/images/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  CircleUser,
  Menu,
  LogOut,
  LayoutDashboard,
  Settings,
  BookMarked,
  BriefcaseBusiness,
} from "lucide-react";
import Image from "next/image";

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BookMarked },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }, 
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      setLoading(false);
    };
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const UserAvatar = () => (
    <CircleUser className="h-5 w-5" />
  );

  const UserEmail = () => {
    if (loading) return <span className="text-sm text-muted-foreground">Loading...</span>;
    return <span className="text-sm font-medium truncate">{user?.email || "User"}</span>;
  };
  
  const UserName = () => {
    if (loading) return null;
    return <span className="text-xs text-muted-foreground truncate">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"}</span>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        {/* Main desktop navigation - adjusted for better centering and larger icon */}
        <nav className="hidden w-full md:flex md:items-center">
          {/* Logo on the left */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Image
              src={logoIcon}
              alt="Nexus Ed Logo"
              width={132} // Increased size, e.g., 32px
              height={32} // Increased size, e.g., 32px
            // Corresponds to 32px (8*4)
            />
          </Link>

          {/* Navigation links centered using auto margins */}
          <div className=" flex-1 items-center justify-center hidden md:flex">
            <div className="flex items-center gap-5 text-sm lg:gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors hover:text-foreground ${pathname === link.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Mobile sheet navigation - icon size for mobile remains default as not specified by user */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <SheetHeader className="px-5 pt-5 pb-2.5">
              <SheetTitle className="text-lg font-semibold">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Image
                    src={logoIcon}
                    alt="Nexus Ed Logo"
                    width={124} // Keep default size for mobile
                    height={24} // Keep default size for mobile
                  />
                  
                </Link>
              </SheetTitle>
              <SheetClose asChild className="ml-auto">
                <Button variant="ghost" size="sm" className="rounded-md">
                  Close
                </Button>
              </SheetClose>
            </SheetHeader>
            <nav className="grid gap-3 px-5 pt-2.5 text-lg font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 transition-all hover:bg-secondary hover:text-primary ${pathname === link.href
                    ? "bg-secondary text-primary"
                    : "text-black"
                    }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        {/* Right-aligned elements */}
        <div className="flex items-center gap-4 md:gap-2 lg:gap-4">
          <div className="ml-auto">
            <ThemeSwitcher />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <UserAvatar />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="flex flex-col">
                <UserName />
                <UserEmail />
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer flex items-center">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 px-6 sm:px-8">
        {children}
      </main>
      <footer className="border-t">
        <div className="container mx-auto py-4 px-4 md:px-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Nexus Ed. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
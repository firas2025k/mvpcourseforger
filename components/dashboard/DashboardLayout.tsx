// app/dashboard/DashboardLayout.tsx
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
import { SearchInput } from "@/components/dashboard/SearchInput";
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
        {/* Main desktop navigation */}
        <nav className="hidden flex-1 items-center gap-6 md:flex">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <Image
              src={logoIcon}
              alt="Nexus Ed Logo"
              width={132}
              height={32}
            />
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-foreground ${pathname === link.href
                ? "text-foreground"
                : "text-muted-foreground"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile sheet navigation */}
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
                  className="flex items-center gap-2"
                >
                  <Image
                    src={logoIcon}
                    alt="Nexus Ed Logo"
                    width={124}
                    height={24}
                  />
                </Link>
              </SheetTitle>
              <SheetClose asChild className="ml-auto">
                <Button variant="ghost" size="sm" className="rounded-md">
                  Close
                </Button>
              </SheetClose>
            </SheetHeader>
            <div className="p-4 border-y">
                <SearchInput />
            </div>
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
        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="hidden md:block">
            <SearchInput />
          </div>
          <ThemeSwitcher />
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
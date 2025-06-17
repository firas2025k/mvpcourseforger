/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Suspense, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import logoIcon from "@/public/assets/images/logo.png";
import { SearchInput } from "@/components/dashboard/SearchInput";
import {
  CircleUser,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Settings,
  BookMarked,
  PlusCircle,
  DollarSign,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BookMarked },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/pricing", label: "Pricing", icon: DollarSign },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const showSearch = pathname === "/dashboard";

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const UserAvatar = () => <CircleUser className={cn("h-5 w-5", !isSidebarOpen && "h-6 w-6")} />;
  const UserName = () => <span className="font-medium">{user?.user_metadata?.name || "User"}</span>;
  const UserEmail = () => {
    if (loading) return <span className="text-sm text-muted-foreground">Loading...</span>;
    return (
      <span className="text-sm text-muted-foreground truncate max-w-[120px]">
        {user?.email || "User"}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-row bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background transition-all duration-300",
          isSidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          {isSidebarOpen && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src={logoIcon} alt="Nexable Logo" width={132} height={32} />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="ml-auto"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        <nav className="flex flex-col flex-1 gap-2 p-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-primary",
                !isSidebarOpen && "justify-center"
              )}
            >
              <link.icon className="h-5 w-5 flex-shrink-0" />
              {isSidebarOpen && <span>{link.label}</span>}
            </Link>
          ))}
          <Link
            href="/dashboard/courses/new"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors bg-purple-600 text-white hover:bg-purple-700",
              !isSidebarOpen && "justify-center"
            )}
          >
            <PlusCircle className="h-5 w-5 flex-shrink-0" />
            {isSidebarOpen && <span>Create New Course</span>}
          </Link>
        </nav>
        
      </aside>
      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300",
          isSidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <div className="flex flex-1 items-center justify-end gap-4">
            {showSearch && (
              <Suspense>
                <SearchInput />
              </Suspense>
            )}
            <ThemeSwitcher />
            <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className={cn("rounded-full", !isSidebarOpen && "p-1")}
              >
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
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer flex items-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
        </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6" data-sidebar-open={isSidebarOpen.toString()}>
          {children}
        </main>
        <footer className="border-t">
          <div className="container mx-auto py-4 px-4 md:px-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Nexable. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
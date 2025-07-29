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
import CreditBalance from "@/components/dashboard/CreditBalance";
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
  Search,
  Sparkles,
  Zap,
  TrendingUp,
  Star,
  Crown,
  GraduationCap,
  Coins,
  Mic,
  MessageSquare,
  Volume2,
  Brain,
  Headphones,
  Users,
  Award,
  Target,
  BarChart3,
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
import { Badge } from "@/components/ui/badge";

// Credit loading component
function CreditLoading() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
      <Coins className="h-4 w-4 text-slate-400 animate-pulse" />
      <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
    </div>
  );
}

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
  gradient?: string;
  isNew?: boolean;
  description?: string;
}

const navLinks: NavLink[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    gradient: "from-blue-500 to-purple-600",
    description: "Overview & Analytics",
  },
  {
    href: "/dashboard/voice",
    label: "Voice Coach",
    icon: Mic,
    gradient: "from-orange-500 to-red-600",
    isNew: true,
    description: "AI-Powered Speaking Coach",
  },
  {
    href: "/dashboard/courses",
    label: "My Courses",
    icon: BookMarked,
    gradient: "from-green-500 to-blue-600",
    description: "Course Management",
  },
  {
    href: "/dashboard/presentations",
    label: "Presentations",
    icon: Users,
    gradient: "from-purple-500 to-pink-600",
    description: "Slide Presentations",
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: BarChart3,
    gradient: "from-emerald-500 to-teal-600",
    description: "Progress & Insights",
  },
  {
    href: "/dashboard/credit",
    label: "Credits",
    icon: Coins,
    gradient: "from-yellow-500 to-orange-600",
    description: "Manage Credits",
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    gradient: "from-slate-500 to-slate-700",
    description: "Account Settings",
  },
];

const quickActions = [
  {
    href: "/dashboard/courses/new",
    label: "New Course",
    icon: PlusCircle,
    gradient: "from-blue-500 to-purple-600",
  },
  {
    href: "/dashboard/voice/new",
    label: "Voice Session",
    icon: Mic,
    gradient: "from-orange-500 to-red-600",
  },
  {
    href: "/dashboard/presentations/new",
    label: "New Presentation",
    icon: Users,
    gradient: "from-purple-500 to-pink-600",
  },
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const showSearch = pathname === "/dashboard";

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);
      setLoading(false);
    };
    getUser();
  }, [supabase]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle window resize to close mobile menu on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const UserAvatar = () => (
    <div className="relative">
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
        <CircleUser className="h-5 w-5 text-white" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-20 animate-pulse"></div>
    </div>
  );

  const UserName = () => (
    <span className="font-semibold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent">
      {user?.user_metadata?.name || user?.email?.split("@")[0] || "User"}
    </span>
  );

  const UserEmail = () => {
    if (loading)
      return (
        <span className="text-sm text-muted-foreground animate-pulse">
          Loading...
        </span>
      );
    return (
      <span className="text-sm text-muted-foreground truncate max-w-[120px]">
        {user?.email || "User"}
      </span>
    );
  };

  // Mobile Navigation Component
  const MobileNavigation = () => (
    <nav className="flex flex-col gap-3 p-4">
      {navLinks.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={closeMobileMenu}
            className={cn(
              "relative flex items-center gap-4 rounded-2xl px-4 py-4 text-base font-medium transition-all duration-300 group hover:scale-[1.02] overflow-hidden",
              isActive
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 hover:shadow-md"
            )}
          >
            {/* Background gradient overlay */}
            <div
              className={cn(
                "absolute inset-0 opacity-0 transition-opacity duration-300",
                `bg-gradient-to-r ${link.gradient}`,
                !isActive && "group-hover:opacity-10"
              )}
            />

            <div className="relative flex items-center gap-4 z-10">
              <div className="relative">
                <link.icon className="h-6 w-6 flex-shrink-0" />
                {isActive && (
                  <div className="absolute inset-0 bg-white rounded-full blur opacity-30 animate-pulse"></div>
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span>{link.label}</span>
                  {link.isNew && (
                    <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                      NEW
                    </Badge>
                  )}
                  {isActive && (
                    <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                  )}
                </div>
                {isSidebarOpen && link.description && (
                  <span className="text-xs opacity-70">{link.description}</span>
                )}
              </div>
            </div>
          </Link>
        );
      })}

      {/* Quick Actions */}
      <div className="mt-6 space-y-2">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-4">
          Quick Actions
        </h3>
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            onClick={closeMobileMenu}
            className={cn(
              "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 group hover:scale-[1.02] overflow-hidden",
              `bg-gradient-to-r ${action.gradient} text-white shadow-lg hover:shadow-xl`
            )}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <action.icon className="h-5 w-5 flex-shrink-0 group-hover:rotate-12 transition-transform duration-300 z-10" />
            <span className="z-10">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Mobile User Section */}
      <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <UserAvatar />
          <div className="flex flex-col">
            <UserName />
            <UserEmail />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Link
            href="/dashboard"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 p-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-colors duration-200"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/settings"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 p-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-colors duration-200"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
          <button
            onClick={() => {
              handleLogout();
              closeMobileMenu();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full flex-row bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:flex md:flex-col border-r border-slate-200/60 dark:border-slate-700/60 transition-all duration-300 shadow-xl",
          // Glass morphism effect
          "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl",
          isSidebarOpen ? "md:w-72" : "md:w-20"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200/60 dark:border-slate-700/60">
          {isSidebarOpen && (
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                <Image
                  src={logoIcon}
                  alt="Nexable Logo"
                  width={132}
                  height={32}
                  className="relative"
                />
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="ml-auto hover:bg-slate-200/80 dark:hover:bg-slate-700/80 hover:scale-110 transition-all duration-200 rounded-full"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col flex-1 gap-2 p-4 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 group hover:scale-[1.02] overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 hover:shadow-md",
                  !isSidebarOpen && "justify-center px-3"
                )}
              >
                {/* Background gradient overlay */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 transition-opacity duration-300",
                    `bg-gradient-to-r ${link.gradient}`,
                    !isActive && "group-hover:opacity-10"
                  )}
                />

                <div className="relative z-10 flex items-center gap-4">
                  <div className="relative">
                    <link.icon className="h-5 w-5 flex-shrink-0" />
                    {isActive && (
                      <div className="absolute inset-0 bg-white rounded-full blur opacity-30 animate-pulse"></div>
                    )}
                  </div>
                  {isSidebarOpen && (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span>{link.label}</span>
                        {link.isNew && (
                          <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                            NEW
                          </Badge>
                        )}
                        {isActive && (
                          <Sparkles className="h-3 w-3 text-yellow-300 animate-pulse" />
                        )}
                      </div>
                      {link.description && (
                        <span className="text-xs opacity-70">
                          {link.description}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}

          {/* Quick Actions */}
          <div className="mt-auto space-y-2">
            {isSidebarOpen && (
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-4 mb-3">
                Quick Actions
              </h3>
            )}
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 group hover:scale-[1.02] overflow-hidden",
                  `bg-gradient-to-r ${action.gradient} text-white shadow-lg hover:shadow-xl`,
                  !isSidebarOpen && "justify-center px-3"
                )}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <action.icon className="h-5 w-5 flex-shrink-0 group-hover:rotate-12 transition-transform duration-300 z-10" />
                {isSidebarOpen && <span className="z-10">{action.label}</span>}
              </Link>
            ))}
          </div>
        </nav>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={closeMobileMenu}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile Menu Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 flex flex-col border-r border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl transition-transform duration-300 md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200/60 dark:border-slate-700/60">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 group"
            onClick={closeMobileMenu}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <Image
                src={logoIcon}
                alt="Nexable Logo"
                width={132}
                height={32}
                className="relative"
              />
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMobileMenu}
            className="hover:bg-slate-200/80 dark:hover:bg-slate-700/80 hover:scale-110 transition-all duration-200 rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <MobileNavigation />
        </div>
      </aside>

      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300",
          "md:ml-72", // Default desktop margin
          !isSidebarOpen && "md:ml-20" // Collapsed desktop margin
        )}
      >
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 md:px-6 shadow-sm">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="md:hidden hover:bg-slate-200/80 dark:hover:bg-slate-700/80 hover:scale-110 transition-all duration-200 rounded-full"
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex flex-1 items-center justify-end gap-4 relative">
            {showSearch && (
              <Suspense>
                <div className="relative flex-1 md:grow-0 max-w-md">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-xl blur"></div>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <SearchInput />
                  </div>
                </div>
              </Suspense>
            )}
            <div className="flex items-center gap-4">
              <Suspense fallback={<CreditLoading />}>
                <CreditBalance compact={true} showTopUpButton={false} />
              </Suspense>
              <ThemeSwitcher />
              {/* Desktop User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-slate-200/80 dark:hover:bg-slate-700/80 hover:scale-110 transition-all duration-200 rounded-full"
                  >
                    <UserAvatar />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 shadow-xl"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <UserName />
                      <UserEmail />
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

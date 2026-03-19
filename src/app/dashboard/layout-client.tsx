"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Kanban,
  Settings,
  Menu,
  LogOut,
  Building2,
  Bell,
  Search,
  LineChart,
  Mail,
  Radar,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
  };
  basePath?: string;
}

const getNavItems = (basePath: string = "/dashboard") => [
  { name: "Overview", href: basePath, icon: LayoutDashboard },
  { name: "Discover", href: `${basePath}/discover`, icon: Radar },
  { name: "Leads", href: `${basePath}/leads`, icon: Users },
  { name: "Pipeline", href: `${basePath}/pipeline`, icon: Kanban },
  { name: "Intelligence", href: `${basePath}/intelligence`, icon: LineChart },
  { name: "Templates", href: `${basePath}/templates`, icon: Mail },
  { name: "Automation", href: `${basePath}/automation`, icon: Zap },
  { name: "Settings", href: `${basePath}/settings`, icon: Settings },
];

function SidebarContent({ onNavigate, basePath = "/dashboard", isDemo = false }: { onNavigate?: () => void; basePath?: string; isDemo?: boolean }) {
  const pathname = usePathname();
  const navItems = getNavItems(basePath);

  return (
    <div className="flex flex-col h-full bg-navy-950 border-r border-navy-800/50">
      {/* Logo */}
      <div className="p-6 border-b border-navy-800/50">
        <Link href={basePath} className="flex items-center gap-3" onClick={onNavigate}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-navy-950" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">ACQUISITOR</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 shadow-lg shadow-gold-500/20"
                  : "text-navy-300 hover:bg-navy-800/50 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-navy-950")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-navy-800/50">
        <button
          onClick={async () => {
            if (isDemo) {
              window.location.href = "/";
            } else {
              await authClient.signOut();
              window.location.href = "/login";
            }
          }}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-navy-400 hover:bg-navy-800/50 hover:text-white transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          {isDemo ? "Exit Demo" : "Sign Out"}
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayoutClient({ children, user, basePath = "/dashboard" }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const displayName = user.name || user.email || "User";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const isDemo = basePath === "/demo";

  return (
    <div className="flex h-screen bg-navy-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0">
        <SidebarContent basePath={basePath} isDemo={isDemo} />
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-navy-950/80 backdrop-blur-xl border-b border-navy-800/50 px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger>
                <Button variant="ghost" size="icon" className="md:hidden text-navy-300 hover:text-white hover:bg-navy-800">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-navy-950 border-r border-navy-800/50">
                <SidebarContent basePath={basePath} isDemo={isDemo} onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <Input
                placeholder="Search deals, leads..."
                className="w-64 pl-9 h-9 bg-navy-800/50 border-navy-700/50 text-white placeholder:text-navy-400 focus:border-gold-500/50 focus:ring-gold-500/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-navy-300 hover:text-white hover:bg-navy-800 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold-500 rounded-full" />
            </Button>
            <div className="flex items-center gap-3 pl-3 border-l border-navy-800/50">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center text-navy-950 font-semibold text-sm">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">{displayName}</p>
                <p className="text-xs text-navy-400">Business Buyer</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

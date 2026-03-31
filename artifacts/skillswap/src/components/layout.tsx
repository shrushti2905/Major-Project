import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { UserCircle, LayoutDashboard, Search, Inbox, Bell, LogOut, ShieldCheck, Menu, Moon, Sun, Zap } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/explore", label: "Explore", icon: Search },
    { href: "/requests", label: "Requests", icon: Inbox },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/profile", label: "Profile", icon: UserCircle },
  ];

  if (user?.role === "admin") {
    navItems.push({ href: "/admin", label: "Admin Panel", icon: ShieldCheck });
  }

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <div className="border-t border-border my-2" />

      <button
        onClick={logout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 hover:bg-destructive/10 text-muted-foreground hover:text-destructive text-sm font-medium w-full"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span>Logout</span>
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <Zap className="h-5 w-5" />
          SkillSwap
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col gap-2 p-4 bg-card">
              <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-primary mb-6">
                <Zap className="h-6 w-6" />
                SkillSwap
              </div>
              <NavLinks />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-sidebar px-3 py-5">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary mb-8 px-3">
          <Zap className="h-5 w-5" />
          SkillSwap
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          <NavLinks />
        </nav>

        {/* Bottom: user info + theme toggle */}
        <div className="border-t border-border pt-3 mt-2 px-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-xs text-muted-foreground truncate">{user?.name || "User"}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

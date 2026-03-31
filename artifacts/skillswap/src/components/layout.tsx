import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { UserCircle, LayoutDashboard, Search, Inbox, Bell, LogOut, ShieldCheck, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
          <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}>
            <Icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
      <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-destructive/10 text-destructive mt-auto">
        <LogOut className="h-5 w-5" />
        <span className="font-medium">Logout</span>
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Nav */}
      <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <Link href="/dashboard" className="font-bold text-xl tracking-tight text-primary">SkillSwap</Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col gap-4">
            <div className="font-bold text-2xl tracking-tight text-primary mb-6">SkillSwap</div>
            <NavLinks />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card px-4 py-6">
        <Link href="/dashboard" className="font-bold text-2xl tracking-tight text-primary mb-8 px-3">
          SkillSwap
        </Link>
        <nav className="flex flex-col gap-2 flex-1">
          <NavLinks />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

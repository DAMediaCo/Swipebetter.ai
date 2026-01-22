import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth, useLogout } from "@/lib/auth";
import { 
  Home, 
  LayoutDashboard, 
  DollarSign, 
  BookOpen, 
  LogIn, 
  LogOut,
  X,
  Menu,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", requiresAuth: true },
  { href: "/pricing", icon: DollarSign, label: "Pricing" },
  { href: "/blog/", icon: BookOpen, label: "Blog" },
];

export function SidebarDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { data: authData } = useAuth();
  const logoutMutation = useLogout();
  const user = authData?.user;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="group"
        aria-label="Open menu"
        data-testid="button-hamburger-menu"
      >
        <Menu className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:drop-shadow-[0_0_6px_hsl(180,100%,50%,0.5)]" />
      </Button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 w-[280px] h-screen bg-card border-l border-border z-[101] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg">SwipeBetter</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            data-testid="button-close-sidebar"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navItems
            .filter((item) => !item.requiresAuth || user)
            .map((item) => {
              const isActive = location === item.href || 
                (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-all ${
                      isActive
                        ? "text-primary bg-primary/10 border-l-[3px] border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                    data-testid={`sidebar-${item.label.toLowerCase()}`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}

          {/* Auth link */}
          {user ? (
            <div
              onClick={() => {
                logoutMutation.mutate();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-6 py-3 cursor-pointer transition-all text-muted-foreground hover:text-foreground hover:bg-muted/50"
              data-testid="sidebar-logout"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Log Out</span>
            </div>
          ) : (
            <Link href="/auth">
              <div
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-all ${
                  location === "/auth"
                    ? "text-primary bg-primary/10 border-l-[3px] border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                data-testid="sidebar-login"
              >
                <LogIn className="w-5 h-5" />
                <span className="font-medium">Login</span>
              </div>
            </Link>
          )}
        </nav>
      </aside>
    </>
  );
}

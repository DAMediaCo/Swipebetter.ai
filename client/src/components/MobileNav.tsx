import { Link, useLocation } from "wouter";
import { Home, Wrench, LogIn, User, CreditCard, BookOpen } from "lucide-react";
import { useAuth, useLogout } from "@/lib/auth";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/dashboard", icon: Wrench, label: "Dashboard" },
  { href: "/blog/", icon: BookOpen, label: "Blog", external: true },
  { href: "/account", icon: CreditCard, label: "Account", requiresAuth: true },
];

export function MobileNav() {
  const [location] = useLocation();
  const { data: authData } = useAuth();
  const logoutMutation = useLogout();
  const user = authData?.user;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-bottom md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems
          .filter((item) => !item.requiresAuth || user)
          .map((item) => {
          const isActive = location === item.href || 
            (item.href !== "/" && location.startsWith(item.href));
          
          const content = (
            <div
              className={`flex flex-col items-center justify-center px-4 py-2 touch-target cursor-pointer transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </div>
          );
          
          if (item.external) {
            return (
              <a key={item.href} href={item.href}>
                {content}
              </a>
            );
          }
          
          return (
            <Link key={item.href} href={item.href}>
              {content}
            </Link>
          );
        })}
        {user ? (
          <div
            className="flex flex-col items-center justify-center px-4 py-2 touch-target cursor-pointer transition-colors text-muted-foreground"
            onClick={() => logoutMutation.mutate()}
            data-testid="nav-logout"
          >
            <User className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">Log Out</span>
          </div>
        ) : (
          <Link href="/auth">
            <div
              className={`flex flex-col items-center justify-center px-4 py-2 touch-target cursor-pointer transition-colors ${
                location === "/auth" ? "text-primary" : "text-muted-foreground"
              }`}
              data-testid="nav-login"
            >
              <LogIn className="w-5 h-5" />
              <span className="text-xs mt-1 font-medium">Log In</span>
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
}

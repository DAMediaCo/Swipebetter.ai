import { Link, useLocation } from "wouter";
import { Home, User, MessageSquare, CreditCard } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/fix-profile", icon: User, label: "Profile" },
  { href: "/fix-reply", icon: MessageSquare, label: "Reply" },
  { href: "/pricing", icon: CreditCard, label: "Pricing" },
];

export function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-bottom md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location === item.href || 
            (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

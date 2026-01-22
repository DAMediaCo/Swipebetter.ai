import { ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LegalFooter } from "@/components/LegalFooter";

interface ToolsLayoutProps {
  children: ReactNode;
}

export function ToolsLayout({ children }: ToolsLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          </div>
          {children}
        </div>
      </div>
      <LegalFooter />
    </div>
  );
}

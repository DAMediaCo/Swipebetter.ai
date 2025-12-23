import { Link } from "wouter";

export function LegalFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors" data-testid="link-terms">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-privacy">
              Privacy Policy
            </Link>
            <Link href="/cookie-policy" className="hover:text-foreground transition-colors" data-testid="link-cookies">
              Cookie Policy
            </Link>
            <Link href="/refund-policy" className="hover:text-foreground transition-colors" data-testid="link-refund">
              Refund Policy
            </Link>
            <Link href="/disclaimer" className="hover:text-foreground transition-colors" data-testid="link-disclaimer">
              Disclaimer
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors" data-testid="link-contact">
              Contact
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            SwipeBetter.ai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

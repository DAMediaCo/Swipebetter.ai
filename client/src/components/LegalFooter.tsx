import { Link } from "wouter";

export function LegalFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <h4 className="font-semibold text-foreground mb-3">Free Tools</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/tools/tinder-bio-generator" className="hover:text-foreground transition-colors" data-testid="link-tinder-bio-generator">
                Tinder Bio Generator
              </Link>
              <Link href="/tools/hinge-prompt-writer" className="hover:text-foreground transition-colors" data-testid="link-hinge-prompt-writer">
                Hinge Prompt Writer
              </Link>
              <Link href="/tools/dating-photo-analyzer" className="hover:text-foreground transition-colors" data-testid="link-dating-photo-analyzer">
                Dating Photo Analyzer
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-3">Resources</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/blog" className="hover:text-foreground transition-colors" data-testid="link-blog">
                Blog
              </Link>
              <Link href="/pricing" className="hover:text-foreground transition-colors" data-testid="link-pricing-footer">
                Pricing
              </Link>
              <Link href="/contact" className="hover:text-foreground transition-colors" data-testid="link-contact">
                Contact
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-3">Legal</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors" data-testid="link-terms">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-privacy">
                Privacy Policy
              </Link>
              <Link href="/refund-policy" className="hover:text-foreground transition-colors" data-testid="link-refund">
                Refund Policy
              </Link>
              <Link href="/disclaimer" className="hover:text-foreground transition-colors" data-testid="link-disclaimer">
                Disclaimer
              </Link>
            </div>
          </div>
        </div>
        
        <div className="pt-6 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            SwipeBetter.ai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

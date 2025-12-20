import { Shield } from "lucide-react";

export function PrivacyNote() {
  return (
    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-md p-3">
      <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span>Your screenshots are processed securely and automatically deleted after analysis.</span>
    </div>
  );
}

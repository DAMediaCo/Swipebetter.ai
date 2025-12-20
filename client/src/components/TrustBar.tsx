import { Lock, Trash2, Zap } from "lucide-react";

export function TrustBar() {
  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-6 py-3 px-4 bg-muted/50 rounded-md text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4 text-primary" />
        <span>Private & Secure</span>
      </div>
      <div className="flex items-center gap-2">
        <Trash2 className="w-4 h-4 text-primary" />
        <span>Screenshots deleted after processing</span>
      </div>
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        <span>No account sharing required</span>
      </div>
    </div>
  );
}

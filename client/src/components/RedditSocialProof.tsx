import { ArrowBigUp, MessageSquare, Share2, Clock } from "lucide-react";

export function RedditSocialProof() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#1a1a1b] rounded-lg border border-[#343536] overflow-hidden">
        <div className="p-3 flex items-start gap-2">
          <div className="flex flex-col items-center gap-1 text-[#818384]">
            <button className="hover:text-[#ff4500] transition-colors" aria-label="Upvote">
              <ArrowBigUp className="w-6 h-6" />
            </button>
            <span className="text-xs font-bold text-[#d7dadc]">127</span>
            <button className="hover:text-[#7193ff] transition-colors rotate-180" aria-label="Downvote">
              <ArrowBigUp className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-[#818384] mb-2 flex-wrap">
              <span className="font-medium text-[#d7dadc]">u/gymrat99</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                2d ago
              </span>
            </div>
            
            <p className="text-[#d7dadc] text-sm leading-relaxed mb-3">
              Okay, I actually changed my first pic like the AI said and got 3 matches today. The bio rewrite was surprisingly good.
            </p>
            
            <div className="flex items-center gap-4 text-xs text-[#818384]">
              <button className="flex items-center gap-1.5 hover:bg-[#343536] px-2 py-1.5 rounded transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span>Reply</span>
              </button>
              <button className="flex items-center gap-1.5 hover:bg-[#343536] px-2 py-1.5 rounded transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="ml-10 p-3 border-l-2 border-[#343536] bg-[#161617]">
          <div className="flex items-center gap-2 text-xs text-[#818384] mb-2">
            <span className="font-medium text-[#d7dadc]">u/dating_coach_mike</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              1d ago
            </span>
          </div>
          <p className="text-[#d7dadc] text-sm leading-relaxed">
            Same experience here. The photo order suggestions were spot on.
          </p>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground text-center mt-4">
        Real feedback from r/Tinder
      </p>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { Check, Camera, Lightbulb } from "lucide-react";

export function ExampleResults() {
  const bioSuggestions = [
    "Lead with your passion for cooking - it's specific and relatable",
    "Add a conversation starter question at the end",
    "Mention what you're looking for to filter better matches",
  ];

  const photoFeedback = [
    "Your first photo is strong - good lighting and smile",
    "Add an action shot doing something you love",
    "Remove the group photo where it's hard to tell which one is you",
  ];

  const topImprovements = [
    "Swap your 3rd photo for an outdoor activity shot",
    "Rewrite bio to show personality instead of listing traits",
    "Add one prompt answer that tells a mini story",
  ];

  return (
    <div className="space-y-6" id="example-results">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Example Results</h2>
        <p className="text-muted-foreground">Here's what your analysis will look like</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ScoreBreakdown overallScore={72} isExample />
        
        <div className="space-y-4">
          <Card className="border-dashed border-2">
            <div className="bg-muted/50 px-4 py-2 text-xs text-muted-foreground text-center border-b">
              Example Output
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Bio Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {bioSuggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-dashed border-2">
          <div className="bg-muted/50 px-4 py-2 text-xs text-muted-foreground text-center border-b">
            Example Output
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Photo Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {photoFeedback.map((feedback, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{feedback}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2">
          <div className="bg-muted/50 px-4 py-2 text-xs text-muted-foreground text-center border-b">
            Example Output
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Top Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {topImprovements.map((improvement, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

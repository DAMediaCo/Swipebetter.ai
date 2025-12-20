import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ScoreBreakdownProps {
  overallScore: number;
  subscores?: {
    bio: number;
    photos: number;
    clarity: number;
    authenticity: number;
    matchAppeal: number;
  };
  isExample?: boolean;
}

const defaultSubscores = {
  bio: 72,
  photos: 68,
  clarity: 75,
  authenticity: 78,
  matchAppeal: 70,
};

export function ScoreBreakdown({ overallScore, subscores, isExample = false }: ScoreBreakdownProps) {
  const scores = subscores || defaultSubscores;
  
  const scoreItems = [
    { label: "Bio", value: scores.bio },
    { label: "Photos", value: scores.photos },
    { label: "Clarity", value: scores.clarity },
    { label: "Authenticity", value: scores.authenticity },
    { label: "Match Appeal", value: scores.matchAppeal },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card className={isExample ? "border-dashed border-2" : ""}>
      {isExample && (
        <div className="bg-muted/50 px-4 py-2 text-xs text-muted-foreground text-center border-b">
          Example Output
        </div>
      )}
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg">Profile Score</CardTitle>
        <div className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
          {overallScore}
        </div>
        <p className="text-sm text-muted-foreground">out of 100</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {scoreItems.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{item.label}</span>
              <span className={`font-medium ${getScoreColor(item.value)}`}>{item.value}</span>
            </div>
            <Progress value={item.value} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

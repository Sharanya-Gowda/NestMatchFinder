import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";

interface CompatibilityScoreProps {
  score: number;
  details?: {
    category: string;
    match: boolean;
    userPref: string;
    roommatePref: string;
  }[];
}

export default function CompatibilityScore({ score, details }: CompatibilityScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Roommate Compatibility Score
      </h4>
      
      <div className="flex items-center space-x-2 mb-3">
        <div className="flex-1">
          <Progress value={score} className="h-3" />
        </div>
        <span className={`text-lg font-bold ${getScoreColor(score)}`}>
          {score}%
        </span>
      </div>
      
      {details && (
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
          {details.slice(0, 4).map((detail, index) => (
            <div key={index} className="flex items-center">
              {detail.match ? (
                <Check className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <X className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span>{detail.category}</span>
            </div>
          ))}
        </div>
      )}
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        {score >= 80 && "Great match! You share similar lifestyle preferences."}
        {score >= 60 && score < 80 && "Good compatibility with some differences."}
        {score < 60 && "Consider discussing lifestyle preferences before moving in."}
      </p>
    </div>
  );
}

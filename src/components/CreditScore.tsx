
import React from 'react';
import { Star, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface CreditScoreProps {
  score: number;
  className?: string;
}

const CreditScore: React.FC<CreditScoreProps> = ({ score, className }) => {
  // Calculate progress percentage (max score is 10)
  const progressPercentage = (score / 10) * 100;
  
  // Determine the color based on the score
  const getScoreColor = (score: number): string => {
    if (score <= 3) return 'text-red-500';
    if (score <= 6) return 'text-amber-500';
    return 'text-green-500';
  };

  // Determine the label based on the score
  const getScoreLabel = (score: number): string => {
    if (score <= 3) return 'Needs Improvement';
    if (score <= 6) return 'Good';
    return 'Excellent';
  };

  return (
    <div className={cn("p-6 space-y-4 rounded-2xl bg-white/80 shadow-md", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Credit Score</h3>
        <div className="text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors">
          <Info size={16} className="inline mr-1" />
          <span>How it works</span>
        </div>
      </div>
      
      <div className="flex items-center justify-center">
        <div className="relative w-28 h-28 rounded-full flex items-center justify-center bg-gray-100">
          <Star className="absolute w-full h-full text-primary opacity-5" />
          <span className={cn("text-3xl font-bold", getScoreColor(score))}>
            {score}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Rating</span>
          <span className={cn("text-sm font-medium", getScoreColor(score))}>
            {getScoreLabel(score)}
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      <div className="text-sm text-muted-foreground text-center mt-4">
        Repay more loans to improve your score
      </div>
    </div>
  );
};

export default CreditScore;

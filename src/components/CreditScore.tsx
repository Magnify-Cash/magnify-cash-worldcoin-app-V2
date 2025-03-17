
import React from 'react';
import { Star } from 'lucide-react';
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
    <div className={cn("glass-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300", className)}>
      <div className="flex items-center justify-center mb-4">
        <Star className="w-16 h-16 text-primary" />
      </div>
      
      <h2 className="text-2xl font-bold text-gradient mb-6 text-center">Your Credit Score</h2>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Rating</span>
          <span className={cn("text-sm font-medium", getScoreColor(score))}>
            {getScoreLabel(score)}
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="text-center mt-2">
          <span className={cn("text-lg font-semibold", getScoreColor(score))}>
            {score}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CreditScore;

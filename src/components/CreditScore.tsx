
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
  const progressPercentage = Math.max(0, ((score + 1) / 11) * 100); // Adjusted for -1 case
  
  // Determine the color based on the score
  const getScoreColor = (score: number): string => {
    if (score < 0) return 'text-red-500';
    if (score <= 3) return 'text-red-500';
    if (score <= 6) return 'text-amber-500';
    return 'text-green-500';
  };

  // Get the status text based on score
  const getScoreStatus = (score: number): string => {
    if (score < 0) return 'Defaulted';
    if (score <= 3) return 'Poor';
    if (score <= 6) return 'Fair';
    if (score <= 8) return 'Good';
    return 'Excellent';
  };

  return (
    <div className={cn("glass-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300", className)}>
      <div className="flex items-center justify-center mb-4">
        <Star className="w-16 h-16 text-primary" />
      </div>
      
      <h2 className="text-2xl font-bold text-gradient mb-6 text-center">Your Credit Score</h2>
      
      <div className="space-y-4">
        <Progress 
          value={progressPercentage} 
          className="h-2 bg-purple-100 dark:bg-purple-950/30" 
          style={{ background: 'linear-gradient(to right, #9b87f5, #7E69AB, #6E59A5)' }} 
        />
        <div className="text-center space-y-2">
          <span className={cn("text-3xl font-bold", getScoreColor(score))}>
            {score}
          </span>
          <p className={cn("text-sm font-medium", getScoreColor(score))}>
            {getScoreStatus(score)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreditScore;

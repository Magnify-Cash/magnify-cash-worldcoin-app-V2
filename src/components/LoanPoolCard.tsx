
import { Shield, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

interface LoanPoolCardProps {
  name: string;
  loanAmount: number;
  interestRate: number | string;
  loanPeriod: number;
  contractAddress: string;
  liquidity: number;
  isLoading?: boolean;
  onSelect: (contractAddress: string, tierId: number) => void;
  disabled?: boolean;
  tierId: number;
  dataLoading?: boolean;
}

export const LoanPoolCard = ({
  name,
  loanAmount,
  interestRate,
  loanPeriod,
  contractAddress,
  liquidity,
  isLoading = false,
  onSelect,
  disabled = false,
  tierId,
  dataLoading = false,
}: LoanPoolCardProps) => {
  const handleSelectPool = () => {
    onSelect(contractAddress, tierId);
  };

  // Format the loan period in days, ensuring it's a reasonable number
  const formattedLoanPeriod = typeof loanPeriod === 'number' 
    ? Math.max(1, Math.min(365, Math.ceil(loanPeriod / (60 * 60 * 24))))
    : 30; // Default 30 days if invalid

  // Format interest rate to always show as percentage with proper decimal places
  const formattedInterestRate = (() => {
    if (typeof interestRate === 'number') {
      return `${interestRate.toFixed(2)}%`;
    }
    
    if (typeof interestRate === 'string') {
      // If it already contains %, return it
      if (interestRate.includes('%')) {
        return interestRate;
      }
      
      // Otherwise, parse it and add %
      const numericRate = parseFloat(interestRate);
      return isNaN(numericRate) ? '8.5%' : `${numericRate.toFixed(2)}%`;
    }
    
    return '8.5%'; // Default fallback
  })();

  // Check if pool has enough liquidity
  const hasEnoughLiquidity = liquidity >= loanAmount;

  return (
    <div className="glass-card p-6 mb-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Shield className="w-6 h-6 mr-2 text-[#5A1A8F]" />
          <h3 className="text-lg font-medium">{name}</h3>
        </div>
        {!hasEnoughLiquidity && !dataLoading && (
          <Popover>
            <PopoverTrigger>
              <Info className="w-5 h-5 text-amber-500" />
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <p className="text-sm">
                This pool currently doesn't have enough liquidity for your loan amount.
              </p>
            </PopoverContent>
          </Popover>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-600 text-sm">Loan Amount</p>
          {dataLoading ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <p className="font-medium">${loanAmount.toLocaleString()}</p>
          )}
        </div>
        <div>
          <p className="text-gray-600 text-sm">Interest Rate</p>
          {dataLoading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <p className="font-medium">{formattedInterestRate}</p>
          )}
        </div>
        <div>
          <p className="text-gray-600 text-sm">Duration</p>
          {dataLoading ? (
            <Skeleton className="h-6 w-20" />
          ) : (
            <p className="font-medium">{formattedLoanPeriod} days</p>
          )}
        </div>
        <div>
          <p className="text-gray-600 text-sm">Available Liquidity</p>
          {dataLoading ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <p className="font-medium">${liquidity.toLocaleString()}</p>
          )}
        </div>
      </div>
      
      <Button 
        onClick={handleSelectPool} 
        disabled={isLoading || disabled || !hasEnoughLiquidity || dataLoading} 
        className="w-full"
      >
        {isLoading ? "Loading..." : dataLoading ? "Loading Pool Data..." : !hasEnoughLiquidity ? "Insufficient Liquidity" : "Apply for Loan"}
      </Button>
    </div>
  );
};

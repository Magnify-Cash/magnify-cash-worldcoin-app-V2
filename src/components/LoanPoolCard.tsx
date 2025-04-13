import { Coins, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/tailwind";

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
  originationFee?: number;
  poolIndex?: number;
}

// Array of colors for pool icons and gradients
const POOL_COLORS = [
  {
    icon: "text-[#8B5CF6]", // Vivid Purple
    gradient: "from-[#8B5CF6]/10 via-[#7E69AB]/5 to-transparent",
    border: "border-[#8B5CF6]/20",
  },
  {
    icon: "text-[#F97316]", // Bright Orange
    gradient: "from-[#F97316]/10 via-[#F9A366]/5 to-transparent",
    border: "border-[#F97316]/20",
  },
  {
    icon: "text-[#0EA5E9]", // Ocean Blue
    gradient: "from-[#0EA5E9]/10 via-[#38BDF8]/5 to-transparent",
    border: "border-[#0EA5E9]/20",
  },
  {
    icon: "text-[#1EAEDB]", // Bright Blue
    gradient: "from-[#1EAEDB]/10 via-[#33C3F0]/5 to-transparent",
    border: "border-[#1EAEDB]/20",
  },
  {
    icon: "text-[#D946EF]", // Magenta Pink
    gradient: "from-[#D946EF]/10 via-[#E879F9]/5 to-transparent",
    border: "border-[#D946EF]/20",
  },
  {
    icon: "text-[#ea384c]", // Red
    gradient: "from-[#ea384c]/10 via-[#f87171]/5 to-transparent",
    border: "border-[#ea384c]/20",
  },
];

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
  originationFee = 0,
  poolIndex = 0,
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

  // Format origination fee
  const formattedOriginationFee = `${originationFee.toFixed(2)}%`;

  // Determine colors based on pool index
  const colorSet = POOL_COLORS[poolIndex % POOL_COLORS.length];

  // Check if pool has enough liquidity
  const hasEnoughLiquidity = liquidity >= loanAmount;

  // Format currency for better display - always showing 2 decimal places
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div 
      className={cn(
        "bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border",
        colorSet.border,
        "transform hover:-translate-y-1"
      )}
    >
      {/* Header Section with Gradient Background */}
      <div className={cn(
        "px-6 py-4 bg-gradient-to-r", 
        colorSet.gradient
      )}>
        <div className="flex items-center">
          <Coins className={cn("w-5 h-5 mr-2", colorSet.icon)} />
          <h3 className="text-lg font-semibold">{name}</h3>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-6 space-y-6">
        {/* Key metrics in a grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Loan Amount - Icon removed */}
          <div className="space-y-1">
            <div className="text-gray-500 text-sm mb-1">
              <span>Loan Amount</span>
            </div>
            {dataLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <p className="text-lg font-bold">{formatCurrency(loanAmount)}</p>
            )}
          </div>
          
          {/* Interest Rate - Icon removed */}
          <div className="space-y-1">
            <div className="text-gray-500 text-sm mb-1">
              <span>Interest Rate</span>
            </div>
            {dataLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <p className="text-lg font-bold">{formattedInterestRate}</p>
            )}
          </div>
          
          {/* Duration - Icon removed */}
          <div className="space-y-1">
            <div className="text-gray-500 text-sm mb-1">
              <span>Duration</span>
            </div>
            {dataLoading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <p className="text-lg font-bold">{formattedLoanPeriod} days</p>
            )}
          </div>
          
          {/* Origination Fee - Icon removed + added popover here */}
          <div className="space-y-1">
            <div className="flex items-center text-gray-500 text-sm mb-1">
              <span>Origination Fee</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="inline-flex ml-1">
                    <Info className="h-3 w-3 text-gray-400 hover:text-gray-600 transition-colors" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 text-sm">
                  <p>Origination Fee is automatically deducted from your loan amount.</p>
                </PopoverContent>
              </Popover>
            </div>
            {dataLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <p className="text-lg font-bold">{formattedOriginationFee}</p>
            )}
          </div>
        </div>
        
        {/* Available Liquidity Section - Icon removed */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Available Liquidity
            </div>
            {dataLoading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <span className={cn(
                "font-medium",
                !hasEnoughLiquidity && "text-red-500"
              )}>
                {formatCurrency(liquidity)}
              </span>
            )}
          </div>
        </div>
        
        {/* Action Button */}
        <Button 
          onClick={handleSelectPool} 
          disabled={isLoading || disabled || !hasEnoughLiquidity || dataLoading} 
          className={cn(
            "w-full bg-[#8B5CF6] hover:bg-[#7c50e6] text-white",
            "size-lg rounded-xl transition-all duration-300"
          )}
          variant={!hasEnoughLiquidity ? "destructive" : "default"}
        >
          {isLoading ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              Processing...
            </span>
          ) : dataLoading ? (
            "Loading Pool Data..." 
          ) : !hasEnoughLiquidity ? (
            "Insufficient Liquidity" 
          ) : (
            "Apply Now"
          )}
        </Button>
      </div>
    </div>
  );
};

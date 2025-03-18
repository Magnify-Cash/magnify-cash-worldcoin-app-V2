import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpFromLine, ArrowDownToLine, Wallet, Info } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SupplyModal } from "@/components/SupplyModal";
import { WithdrawModal } from "@/components/WithdrawModal";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface UserPortfolioCardProps {
  balance: number;
  depositedValue: number;
  currentValue: number;
  earnings: number;
  onSupply: () => void;
  onWithdraw: () => void;
  useCustomGradient?: boolean;
}

export function UserPortfolioCard({ 
  balance, 
  depositedValue, 
  currentValue, 
  earnings, 
  onSupply, 
  onWithdraw,
  useCustomGradient = false
}: UserPortfolioCardProps) {
  const isMobile = useIsMobile();
  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  
  // Calculate percentage growth/loss
  const percentageChange = depositedValue > 0 ? (earnings / depositedValue * 100) : 0;
  const isPositive = percentageChange >= 0;
  
  // Pool's standard APY
  const poolAPY = 8.5;
  
  // Calculate personalized APY based on earnings and deposit time
  // For demo purposes, we'll assume the deposit was made 30 days ago
  // In a real app, we would store the deposit timestamp in the database
  const calculatePersonalizedAPY = () => {
    if (depositedValue <= 0 || earnings === 0) return poolAPY;
    
    // Assuming deposit was made 30 days ago for this demo
    const daysSinceDeposit = 30;
    
    // Annualize the returns: (earnings / depositedValue) * (365 / daysSinceDeposit) * 100
    // This formula converts the earnings over X days to an annual percentage
    const annualizedReturn = (earnings / depositedValue) * (365 / daysSinceDeposit) * 100;
    
    // For very recent deposits (< 7 days), showing the pool APY might be more accurate
    if (daysSinceDeposit < 7) return poolAPY;
    
    return annualizedReturn;
  };
  
  // Get the APY to display
  const displayAPY = calculatePersonalizedAPY();

  // Only modify the header gradient, not the card background
  const headerGradient = useCustomGradient
    ? "bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#D946EF]/80"
    : "bg-gradient-to-r from-[#8B5CF6]/10 to-[#6E59A5]/5";

  const iconColor = useCustomGradient ? "text-white" : "text-[#8B5CF6]";
  const borderStyle = useCustomGradient ? "border-[#D946EF]/30" : "border-[#8B5CF6]/20";
  const apyTextColor = useCustomGradient ? "text-[#D946EF]" : "text-[#8B5CF6]";
  
  return (
    <Card className={`h-full border-${borderStyle} overflow-hidden`}>
      <CardHeader className={`pb-2 pt-4 ${headerGradient}`}>
        <CardTitle className={`text-xl flex items-center gap-2 ${useCustomGradient ? "text-white" : ""}`}>
          <Wallet className={`h-5 w-5 ${iconColor}`} />
          Your Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent className={`${isMobile ? "px-3 py-2" : "pt-5"} space-y-3 sm:space-y-4`}>
        {balance > 0 ? (
          <>
            <div className="space-y-2 sm:space-y-3 pt-2">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-500">
                  Your Balance
                </span>
                <span className="font-semibold text-sm sm:text-base flex items-center">{balance.toFixed(2)} LP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-500">Deposited Value</span>
                <span className="font-semibold text-sm sm:text-base flex items-center">${depositedValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-500">Current Value</span>
                <span className="font-semibold text-sm sm:text-base flex items-center">${currentValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-500">Earnings</span>
                <span className={`font-semibold text-sm sm:text-base ${isPositive ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                  {isPositive ? '+' : ''}{earnings.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                  Your APY
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="inline-flex">
                        <Info className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-[250px] text-xs p-3">
                      <p className="font-bold">How Your APY is Calculated</p>
                      <p className="mt-1">Your personal APY is calculated based on your actual earnings:</p>
                      <div className="bg-gray-100 p-2 rounded mt-1">
                        APY = (Earnings / Deposited Value) × (365 / Days Since Deposit) × 100%
                      </div>
                      <p className="mt-1">For new deposits (less than 7 days old), we show the pool's standard APY of {poolAPY}%.</p>
                      <p className="mt-1">For this demo, we're assuming your deposit was made 30 days ago.</p>
                    </PopoverContent>
                  </Popover>
                </span>
                <span className={`font-semibold text-sm sm:text-base ${apyTextColor}`}>{displayAPY.toFixed(2)}%</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4 sm:py-6">
            <p className="text-xs sm:text-sm text-gray-500 mb-2">You haven't supplied any assets yet</p>
            <p className="text-xs text-gray-400">Supply assets to start earning interest</p>
          </div>
        )}
      </CardContent>
      <CardFooter className={`flex gap-2 ${isMobile ? "px-3 py-3" : ""}`}>
        <Button 
          onClick={() => setIsSupplyModalOpen(true)} 
          className={`flex-1 ${useCustomGradient ? "bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#D946EF]" : "bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75]"} hover:opacity-90 text-white text-xs sm:text-sm py-1.5 sm:py-2 border-0`}
        >
          <ArrowUpFromLine className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
          Supply
        </Button>
        <Button 
          onClick={() => setIsWithdrawModalOpen(true)} 
          variant="outline" 
          className={`flex-1 text-xs sm:text-sm py-1.5 sm:py-2 ${useCustomGradient ? "border-[#D946EF]/50 text-[#A855F7] hover:text-white hover:bg-[#A855F7]" : "border-[#8B5CF6]/50 text-[#8B5CF6] hover:text-white hover:bg-[#8B5CF6]"}`}
          disabled={balance <= 0}
        >
          <ArrowDownToLine className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
          Withdraw
        </Button>
      </CardFooter>
      
      <SupplyModal 
        isOpen={isSupplyModalOpen} 
        onClose={() => setIsSupplyModalOpen(false)} 
      />
      
      <WithdrawModal 
        isOpen={isWithdrawModalOpen} 
        onClose={() => setIsWithdrawModalOpen(false)}
        lpBalance={balance}
        lpValue={currentValue}
      />
    </Card>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Wallet, TrendingUp, TrendingDown, Loader2 } from "lucide-react";

interface UserPortfolioCardProps {
  balance: number;
  depositedValue: number;
  currentValue: number;
  earnings: number;
  percentageChange?: number;
  isLoading?: boolean;
  onSupply?: () => void;
  onWithdraw?: () => void;
  useCustomGradient?: boolean;
  hideButtons?: boolean;
  showSupplyButton?: boolean;
  showWithdrawButton?: boolean;
  onToggleDummyData?: () => void;
  showToggle?: boolean;
  poolStatus?: 'warm-up' | 'active' | 'cooldown' | 'withdrawal';
  symbol?: string;
}

export function UserPortfolioCard({
  balance,
  depositedValue,
  currentValue,
  earnings,
  percentageChange,
  isLoading = false,
  onSupply,
  onWithdraw,
  useCustomGradient = false,
  hideButtons = false,
  showSupplyButton = true,
  showWithdrawButton = true,
  onToggleDummyData,
  showToggle = false,
  poolStatus,
  symbol = "LP"
}: UserPortfolioCardProps) {
  const isMobile = useIsMobile();

  // Calculate percentage change if not provided
  const calculatedPercentage = percentageChange !== undefined ? 
    percentageChange : 
    (depositedValue > 0 ? (earnings / depositedValue * 100) : 0);
  
  const isPositive = calculatedPercentage >= 0;

  // Determine the appropriate message for empty balance
  const getEmptyBalanceMessage = () => {
    if (poolStatus === 'active' || poolStatus === 'withdrawal') {
      return "You haven't supplied any assets";
    }
    return "You haven't supplied any assets yet";
  };

  if (isLoading) {
    return (
      <Card className="border border-[#8B5CF6]/20 shadow-sm overflow-hidden">
        <CardHeader className="py-4 bg-gradient-to-r from-[#8B5CF6]/10 to-[#6E59A5]/5">
          <CardTitle className="text-xl flex items-center gap-2 justify-center">
            <Wallet className="h-5 w-5 text-[#8B5CF6]" />
            Your Position
          </CardTitle>
        </CardHeader>
        <CardContent className={`${isMobile ? "px-4 py-4" : "p-6"} flex justify-center items-center min-h-[200px]`}>
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-[#8B5CF6] animate-spin mb-2" />
            <p className="text-sm text-gray-500">Loading your position...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-[#8B5CF6]/20 shadow-sm overflow-hidden">
      <CardHeader className="py-4 bg-gradient-to-r from-[#8B5CF6]/10 to-[#6E59A5]/5">
        <CardTitle className="text-xl flex items-center gap-2 justify-center">
          <Wallet className="h-5 w-5 text-[#8B5CF6]" />
          Your Position
        </CardTitle>
      </CardHeader>
      <CardContent className={`${isMobile ? "px-4 py-4" : "p-6"} space-y-3 sm:space-y-4`}>
        {balance > 0 ? (
          <>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">
                  Your Balance
                </span>
                <span className="font-medium">{balance.toFixed(2)} {symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Deposited Value</span>
                <span className="font-medium">${depositedValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Current Value</span>
                <span className="font-medium">${currentValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Yield</span>
                <span className={`font-medium flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {isPositive ? '+' : ''}{earnings.toFixed(2)} ({isPositive ? '+' : ''}{calculatedPercentage.toFixed(2)}%)
                </span>
              </div>
            </div>
            
            {!hideButtons && (
              <div className="flex gap-2 pt-2">
                {(showSupplyButton || poolStatus === 'active') && (
                  <Button
                    onClick={onSupply}
                    className="flex-1 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] hover:opacity-90"
                  >
                    Supply
                  </Button>
                )}
                {showWithdrawButton && (
                  <Button
                    onClick={onWithdraw}
                    variant="outline"
                    className="flex-1 border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/20 hover:text-[#8B5CF6] hover:font-medium"
                  >
                    Withdraw
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-2">{getEmptyBalanceMessage()}</p>
            {!(poolStatus === 'withdrawal') && (
              <p className="text-xs text-gray-400">Supply assets to start earning interest</p>
            )}
            
            {!hideButtons && (showSupplyButton || poolStatus === 'active') && (
              <Button
                onClick={onSupply}
                className="mt-4 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] hover:opacity-90"
              >
                Supply Assets
              </Button>
            )}
          </div>
        )}
        
        {showToggle && onToggleDummyData && (
          <div className="flex justify-center pt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleDummyData} 
              className="text-xs text-gray-500"
            >
              Toggle Demo Data
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

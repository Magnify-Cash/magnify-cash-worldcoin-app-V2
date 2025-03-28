
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Wallet } from "lucide-react";

interface UserPortfolioCardProps {
  balance: number;
  depositedValue: number;
  currentValue: number;
  earnings: number;
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

  // Calculate percentage growth/loss
  const percentageChange = depositedValue > 0 ? (earnings / depositedValue * 100) : 0;
  const isPositive = percentageChange >= 0;

  // Determine the appropriate message for empty balance
  const getEmptyBalanceMessage = () => {
    if (poolStatus === 'active' || poolStatus === 'withdrawal') {
      return "You haven't supplied any assets";
    }
    return "You haven't supplied any assets yet";
  };

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
                <span className="text-sm text-gray-500">Earnings</span>
                <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{earnings.toFixed(2)} ({isPositive ? '+' : ''}{percentageChange.toFixed(2)}%)
                </span>
              </div>
            </div>
            
            {!hideButtons && (
              <div className="flex gap-2 pt-2">
                {showSupplyButton && (
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
            {!(poolStatus === 'active' || poolStatus === 'withdrawal') && (
              <p className="text-xs text-gray-400">Supply assets to start earning interest</p>
            )}
            
            {!hideButtons && showSupplyButton && (
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
              {balance > 0 ? "Remove Demo Data" : "Add Demo Data"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

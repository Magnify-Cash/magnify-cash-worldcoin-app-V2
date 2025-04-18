
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Wallet, Loader2 } from "lucide-react";

interface UserPortfolioCardProps {
  balance: number;
  currentValue: number;
  isLoading?: boolean;
  onSupply?: () => void;
  onWithdraw?: () => void;
  useCustomGradient?: boolean;
  hideButtons?: boolean;
  showSupplyButton?: boolean;
  showWithdrawButton?: boolean;
  poolStatus?: 'warm-up' | 'active' | 'cooldown' | 'withdrawal';
  symbol?: string;
  poolContractAddress?: string;
}

export function UserPortfolioCard({
  balance: initialBalance,
  currentValue: initialCurrentValue,
  isLoading = false,
  onSupply,
  onWithdraw,
  useCustomGradient = false,
  hideButtons = false,
  showSupplyButton = true,
  showWithdrawButton = true,
  poolStatus,
  symbol = "LP"
}: UserPortfolioCardProps) {
  const isMobile = useIsMobile();
  const [balance, setBalance] = useState(initialBalance);
  const [currentValue, setCurrentValue] = useState(initialCurrentValue);
  
  // Update when props change
  useEffect(() => {
    setBalance(initialBalance);
    setCurrentValue(initialCurrentValue);
  }, [initialBalance, initialCurrentValue]);

  const getEmptyBalanceMessage = () => {
    if (poolStatus === 'active' || poolStatus === 'withdrawal') {
      return "You haven't supplied any assets";
    }
    return "You haven't supplied any assets yet";
  };

  // Check if buttons should be shown based on pool status
  const shouldShowSupplyButton = () => {
    if (poolStatus === 'cooldown') return false;
    return showSupplyButton || poolStatus === 'active';
  };

  const shouldShowWithdrawButton = () => {
    if (poolStatus === 'cooldown') return false;
    return showWithdrawButton;
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
                <span className="text-sm text-gray-500">Current Value</span>
                <span className="font-medium">${currentValue.toFixed(2)}</span>
              </div>
            </div>
            
            {!hideButtons && (
              <div className="flex gap-2 pt-2">
                {shouldShowSupplyButton() && (
                  <Button
                    onClick={onSupply}
                    className="flex-1 bg-[#8B5CF6] hover:bg-[#7c50e6] text-white"
                  >
                    Supply
                  </Button>
                )}
                {shouldShowWithdrawButton() && (
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
            {!(poolStatus === 'withdrawal' || poolStatus === 'cooldown') && (
              <p className="text-xs text-gray-400">Supply assets to start earning interest</p>
            )}
            
            {!hideButtons && shouldShowSupplyButton() && (
              <Button
                onClick={onSupply}
                className="mt-4 bg-[#8B5CF6] hover:bg-[#7c50e6] text-white"
              >
                Supply Assets
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

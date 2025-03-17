import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpFromLine, ArrowDownToLine, Wallet, TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserPortfolioCardProps {
  balance: number;
  depositedValue: number;
  currentValue: number;
  earnings: number;
  onSupply: () => void;
  onWithdraw: () => void;
}

export function UserPortfolioCard({ 
  balance, 
  depositedValue, 
  currentValue, 
  earnings, 
  onSupply, 
  onWithdraw 
}: UserPortfolioCardProps) {
  const isMobile = useIsMobile();
  
  return (
    <Card className="h-full border-[#8B5CF6]/20 overflow-hidden">
      <CardHeader className={`pb-2 pt-4 bg-gradient-to-r from-[#8B5CF6]/10 to-[#6E59A5]/5`}>
        <CardTitle className="text-xl flex items-center gap-2">
          <Wallet className="h-5 w-5 text-[#8B5CF6]" />
          Your Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent className={`${isMobile ? "px-3 py-2" : ""} space-y-3 sm:space-y-4`}>
        {balance > 0 ? (
          <>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-[#8B5CF6] flex-shrink-0" />
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
                <span className="font-semibold text-sm sm:text-base text-green-600 flex items-center">+${earnings.toFixed(2)}</span>
              </div>
            </div>
            <div className="pt-2">
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] rounded-full" 
                  style={{ width: `${(earnings/depositedValue*100).toFixed(1)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-right mt-1">
                {(earnings/depositedValue*100).toFixed(1)}% growth
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-4 sm:py-6">
            <p className="text-xs sm:text-sm text-gray-500 mb-2">You haven't supplied any assets yet</p>
            <p className="text-xs text-gray-400">Supply assets to start earning interest and $MAG rewards</p>
          </div>
        )}
      </CardContent>
      <CardFooter className={`flex gap-2 ${isMobile ? "px-3 py-3" : ""}`}>
        <Button 
          onClick={onSupply} 
          className="flex-1 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] hover:opacity-90 text-xs sm:text-sm py-1.5 sm:py-2 border-0"
        >
          <ArrowUpFromLine className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
          Supply
        </Button>
        <Button 
          onClick={onWithdraw} 
          variant="outline" 
          className="flex-1 text-xs sm:text-sm py-1.5 sm:py-2 border-[#8B5CF6]/50 text-[#8B5CF6] hover:bg-[#8B5CF6]/5"
          disabled={balance <= 0}
        >
          <ArrowDownToLine className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
          Withdraw
        </Button>
      </CardFooter>
    </Card>
  );
}

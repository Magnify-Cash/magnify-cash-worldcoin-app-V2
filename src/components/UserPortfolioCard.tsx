
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserPortfolioCardProps {
  balance: number;
  depositedValue: number;
  currentValue: number;
  earnings: number;
  onSupply: () => void;
  onWithdraw: () => void;
  useCustomGradient?: boolean;
  hideButtons?: boolean;
  showSupplyButton?: boolean;
  showWithdrawButton?: boolean;
  onToggleDummyData?: () => void;
  showToggle?: boolean;
  poolStatus?: 'warm-up' | 'active' | 'cooldown' | 'withdrawal';
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
  poolStatus
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
    <Card className="border-none shadow-none">
      <CardContent className={`${isMobile ? "px-0 py-2" : "p-0"} space-y-3 sm:space-y-4`}>
        {balance > 0 ? (
          <>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">
                  Your Balance
                </span>
                <span className="font-medium">{balance.toFixed(2)} LP</span>
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
                  {isPositive ? '+' : ''}{earnings.toFixed(2)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-2">{getEmptyBalanceMessage()}</p>
            {!(poolStatus === 'active' || poolStatus === 'withdrawal') && (
              <p className="text-xs text-gray-400">Supply assets to start earning interest</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

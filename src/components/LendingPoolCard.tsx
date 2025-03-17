
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Wallet, TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface LendingPoolCardProps {
  title: string;
  apy: number;
  totalSupply: number;
  availableLiquidity: number;
}

export function LendingPoolCard({ 
  title, 
  apy, 
  totalSupply, 
  availableLiquidity 
}: LendingPoolCardProps) {
  const isMobile = useIsMobile();

  const formatValue = (value: number, suffix: string) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M${suffix}`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K${suffix}`;
    }
    return `${value.toFixed(0)}${suffix}`;
  };

  return (
    <Card className="overflow-hidden border bg-white">
      <CardHeader className="pb-2 bg-gradient-to-r from-[#8B5CF6]/10 to-[#6E59A5]/5">
        <CardTitle className="text-xl flex items-center gap-2">
          <Coins className="h-5 w-5 text-[#8B5CF6]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={`p-4 sm:p-6 ${isMobile ? 'pt-3' : ''}`}>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="space-y-1">
            <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">APY</span>
            </div>
            <div className="font-semibold text-base sm:text-lg text-[#8B5CF6]">{apy}%</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
              <Wallet className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Total</span>
            </div>
            <div className="font-semibold text-base sm:text-lg">
              ${formatValue(totalSupply, '')}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
              <Coins className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Available</span>
            </div>
            <div className="font-semibold text-base sm:text-lg">
              ${formatValue(availableLiquidity, '')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

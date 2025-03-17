
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Wallet, TrendingUp } from "lucide-react";

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
  return (
    <Card className="overflow-hidden border bg-white">
      <CardHeader className="pb-2 bg-gradient-to-r from-[#8B5CF6]/10 to-[#6E59A5]/5">
        <CardTitle className="text-xl flex items-center gap-2">
          <Coins className="h-5 w-5 text-[#8B5CF6]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-gray-500 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              APY
            </div>
            <div className="font-semibold text-lg text-[#8B5CF6]">{apy}%</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500 flex items-center gap-1.5">
              <Wallet className="h-4 w-4" />
              Total Supply
            </div>
            <div className="font-semibold">${(totalSupply / 1000000).toFixed(2)}M</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500 flex items-center gap-1.5">
              <Coins className="h-4 w-4" />
              Available
            </div>
            <div className="font-semibold">${(availableLiquidity / 1000).toFixed(1)}K</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

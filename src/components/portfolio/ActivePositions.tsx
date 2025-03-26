
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivePositionCard } from "@/components/ActivePositionCard";
import { Wallet } from "lucide-react";
import { LiquidityPool } from "@/types/supabase/liquidity";

interface ActivePositionsProps {
  pool: LiquidityPool;
  balance: number;
  depositedValue: number;
  currentValue: number;
  earnings: number;
  isMobile: boolean;
  onRemoveDemoData: () => void;
}

export const ActivePositions: React.FC<ActivePositionsProps> = ({
  pool,
  balance,
  depositedValue,
  currentValue,
  earnings,
  isMobile,
  onRemoveDemoData
}) => {
  return (
    <Card className="border border-[#8B5CF6]/20 overflow-hidden">
      <CardHeader className="py-4 bg-gradient-to-r from-[#8B5CF6]/10 to-[#6E59A5]/5">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Wallet className="mr-2 h-5 w-5 text-[#8B5CF6]" />
            <span>Your Active Positions</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className={`${isMobile ? "px-3 py-4" : "px-6 py-5"}`}>
        <ActivePositionCard 
          poolId={pool.id}
          poolName={pool.name}
          balance={balance}
          depositedValue={depositedValue}
          currentValue={currentValue}
          earnings={earnings}
          status={pool.status}
          apy={pool.apy}
        />

        <div className="flex justify-center mt-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRemoveDemoData} 
            className="text-xs text-gray-500"
          >
            Remove Demo Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

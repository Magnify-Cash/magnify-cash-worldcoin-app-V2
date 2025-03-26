
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { LiquidityPool } from "@/types/supabase/liquidity";
import { useNavigate } from "react-router-dom";

interface ActivePositionsProps {
  pools: LiquidityPool[];
  balances: Record<number, number>;
  depositedValues: Record<number, number>;
  currentValues: Record<number, number>;
  earnings: Record<number, number>;
  isMobile: boolean;
  onRemoveDemoData: () => void;
}

export const ActivePositions: React.FC<ActivePositionsProps> = ({
  pools,
  balances,
  depositedValues,
  currentValues,
  earnings,
  isMobile,
  onRemoveDemoData
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: 'warm-up' | 'active' | 'cooldown' | 'withdrawal') => {
    switch (status) {
      case 'warm-up':
        return 'bg-amber-100 text-amber-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cooldown':
        return 'bg-gray-100 text-gray-800';
      case 'withdrawal':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const showSupplyButton = (status: 'warm-up' | 'active' | 'cooldown' | 'withdrawal') => {
    return status === 'warm-up' || status === 'active';
  };

  const showWithdrawButton = (status: 'warm-up' | 'active' | 'cooldown' | 'withdrawal') => {
    return status === 'warm-up' || status === 'withdrawal';
  };

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
      <CardContent className={`${isMobile ? "px-3 py-4" : "px-6 py-5"} space-y-4`}>
        {pools.map((pool) => (
          <div key={pool.id} className="rounded-lg border border-[#8B5CF6]/20 overflow-hidden">
            <div className="bg-gradient-to-r from-[#8B5CF6]/5 to-transparent p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-lg">{pool.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(pool.status)}`}>
                      {pool.status.charAt(0).toUpperCase() + pool.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Your Balance</span>
                    <span className="font-medium">{balances[pool.id]?.toFixed(2) || "0.00"} LP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Deposited Value</span>
                    <span className="font-medium">${depositedValues[pool.id]?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Current Value</span>
                    <span className="font-medium">${currentValues[pool.id]?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Earnings</span>
                    <span className="font-medium text-green-600">
                      +{earnings[pool.id]?.toFixed(2) || "0.00"} 
                      {depositedValues[pool.id] > 0 ? 
                        ` (+${((earnings[pool.id] / depositedValues[pool.id]) * 100).toFixed(2)}%)` : 
                        ""}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {showSupplyButton(pool.status) && (
                    <Button 
                      onClick={() => navigate(`/pool/${pool.id}`)} 
                      className="flex-1 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] hover:opacity-90"
                    >
                      Supply More
                    </Button>
                  )}
                  
                  {showWithdrawButton(pool.status) && (
                    <Button 
                      onClick={() => navigate(`/pool/${pool.id}`)} 
                      variant="outline" 
                      className="flex-1 border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-center mt-2">
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


import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Coins } from "lucide-react";
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
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIndicator = (status: 'warm-up' | 'active' | 'cooldown' | 'withdrawal') => {
    switch (status) {
      case 'warm-up':
        return <div className="h-3 w-3 rounded-full bg-amber-500 mr-1.5"></div>;
      case 'active':
        return <div className="h-3 w-3 rounded-full bg-green-500 mr-1.5"></div>;
      case 'cooldown':
        return <div className="h-3 w-3 rounded-full bg-gray-500 mr-1.5"></div>;
      case 'withdrawal':
        return <div className="h-3 w-3 rounded-full bg-purple-500 mr-1.5"></div>;
      default:
        return <div className="h-3 w-3 rounded-full bg-gray-500 mr-1.5"></div>;
    }
  };

  // Used to get icon based on pool ID
  const getPoolIcon = (poolId: number) => {
    switch (poolId) {
      case 1:
        return <Coins className="h-5 w-5 text-blue-500 mr-1.5" />;
      case 2:
        return <Coins className="h-5 w-5 text-purple-500 mr-1.5" />;
      case 3:
        return <Coins className="h-5 w-5 text-yellow-500 mr-1.5" />;
      case 4:
        return <Coins className="h-5 w-5 text-green-500 mr-1.5" />;
      default:
        return <Coins className="h-5 w-5 text-gray-500 mr-1.5" />;
    }
  };

  const showSupplyButton = (status: 'warm-up' | 'active' | 'cooldown' | 'withdrawal') => {
    return status === 'warm-up' || status === 'active';
  };

  const showWithdrawButton = (status: 'warm-up' | 'active' | 'cooldown' | 'withdrawal') => {
    return status === 'warm-up' || status === 'withdrawal';
  };

  return (
    <div className="space-y-5">
      {pools.map((pool) => (
        <div 
          key={pool.id} 
          className="rounded-lg bg-white shadow-md overflow-hidden"
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {getPoolIcon(pool.id)}
                  <h3 className="font-medium text-base sm:text-lg">Pool {String.fromCharCode(64 + pool.id)}</h3>
                </div>
                <div className={`flex items-center text-xs px-2 py-0.5 rounded-full ${getStatusColor(pool.status)}`}>
                  {getStatusIndicator(pool.status)}
                  <span>{pool.status.charAt(0).toUpperCase() + pool.status.slice(1)}</span>
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(`/pool/${pool.id}`)}
                className="p-1 h-8 w-8"
              >
                <ExternalLink className="h-4 w-4 text-gray-500" />
              </Button>
            </div>

            <div className="space-y-3 mt-3">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-500">Your Balance</span>
                <span className="text-xs sm:text-sm font-medium">{balances[pool.id]?.toFixed(2) || "0.00"} LP</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-500">Deposited Value</span>
                <span className="text-xs sm:text-sm font-medium">${depositedValues[pool.id]?.toFixed(2) || "0.00"}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-500">Current Value</span>
                <span className="text-xs sm:text-sm font-medium">${currentValues[pool.id]?.toFixed(2) || "0.00"}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-500">Earnings</span>
                <span className="text-xs sm:text-sm font-medium text-green-600">
                  +${earnings[pool.id]?.toFixed(2) || "0.00"} 
                  {depositedValues[pool.id] > 0 ? 
                    ` (+${((earnings[pool.id] / depositedValues[pool.id]) * 100).toFixed(1)}%)` : 
                    ""}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2 mt-4">
              <div className="flex gap-2">
                {showSupplyButton(pool.status) && (
                  <Button 
                    onClick={() => navigate(`/pool/${pool.id}`)} 
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] hover:opacity-90"
                  >
                    Supply More
                  </Button>
                )}
                
                {showWithdrawButton(pool.status) && (
                  <Button 
                    onClick={() => navigate(`/pool/${pool.id}`)} 
                    variant="outline" 
                    size="sm"
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
    </div>
  );
};

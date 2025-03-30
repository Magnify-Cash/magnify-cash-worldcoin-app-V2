
import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserPoolPosition } from "@/hooks/useUserPoolPositions";

interface ActivePositionsProps {
  positions: UserPoolPosition[];
  isMobile: boolean;
}

export const ActivePositions: React.FC<ActivePositionsProps> = ({
  positions,
  isMobile
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
      case 5:
        return <Coins className="h-5 w-5 text-red-500 mr-1.5" />;
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
      {positions.map((position) => (
        <div 
          key={position.poolId} 
          className="rounded-lg bg-white shadow-md overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                {getPoolIcon(position.poolId)}
                <h3 className="font-medium text-base sm:text-lg">{position.poolName}</h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(`/pool/${position.poolId}`)}
                className="p-1 h-8 w-8 hover:text-white group"
              >
                <ExternalLink className="h-4 w-4 text-gray-500 group-hover:text-white" />
              </Button>
            </div>
            
            <div className="flex justify-start mb-3">
              <div className={`flex items-center text-xs px-2 py-0.5 rounded-full ${getStatusColor(position.status)}`}>
                {getStatusIndicator(position.status)}
                <span>{position.status.charAt(0).toUpperCase() + position.status.slice(1)}</span>
              </div>
            </div>

            <div className="space-y-3 mt-3">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-500">Your Balance</span>
                <span className="text-xs sm:text-sm font-medium">
                  {position.balance.toFixed(2)} {position.symbol}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-500">Deposited Value</span>
                <span className="text-xs sm:text-sm font-medium">
                  ${position.depositedValue.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-500">Current Value</span>
                <span className="text-xs sm:text-sm font-medium">
                  ${position.currentValue.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-500">Earnings</span>
                <span className="text-xs sm:text-sm font-medium text-green-600">
                  +${position.earnings.toFixed(2)} 
                  {position.depositedValue > 0 ? 
                    ` (+${((position.earnings / position.depositedValue) * 100).toFixed(1)}%)` : 
                    ""}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2 mt-4">
              <div className="flex gap-2">
                {showSupplyButton(position.status) && (
                  <Button 
                    onClick={() => navigate(`/pool/${position.poolId}`)} 
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] hover:opacity-90"
                  >
                    Supply More
                  </Button>
                )}
                
                {showWithdrawButton(position.status) && (
                  <Button 
                    onClick={() => navigate(`/pool/${position.poolId}`)} 
                    variant="outline" 
                    size="sm"
                    className="flex-1 border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/20 hover:text-[#8B5CF6] hover:font-medium"
                  >
                    Withdraw
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

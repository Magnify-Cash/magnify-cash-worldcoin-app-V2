import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserPoolPosition } from "@/hooks/useUserPoolPositions";
import { usePoolModals } from "@/hooks/usePoolModals";
import { useCacheListener, EVENTS } from '@/hooks/useCacheListener';

interface ActivePositionsProps {
  positions: UserPoolPosition[];
  isMobile: boolean;
  refreshPositions: () => void;
  updateUserPositionOptimistically: (poolId: number, amount: number, isWithdrawal?: boolean) => void;
  updateTrigger?: number;
}

export const ActivePositions: React.FC<ActivePositionsProps> = ({
  positions,
  isMobile,
  refreshPositions,
  updateUserPositionOptimistically,
  updateTrigger = 0
}) => {
  const navigate = useNavigate();
  const { openSupplyModal, openWithdrawModal } = usePoolModals();
  const [localPositions, setLocalPositions] = useState<UserPoolPosition[]>(positions);
  const [positionsKey, setPositionsKey] = useState<number>(0);
  const [processedTransactions] = useState<Set<string>>(new Set());

  useEffect(() => {
    console.log('[ActivePositions] Positions updated:', positions);
    setLocalPositions(positions);
    setPositionsKey(prev => prev + 1);
  }, [positions, updateTrigger]);

  useCacheListener(EVENTS.TRANSACTION_COMPLETED, (data) => {
    if (!data || !data.poolContractAddress) {
      return;
    }
    
    if (data.transactionId && processedTransactions.has(data.transactionId)) {
      console.log('[ActivePositions] Skipping already processed transaction:', data.transactionId);
      return;
    }
    
    if (data.transactionId) {
      console.log('[ActivePositions] Processing transaction:', data.transactionId);
      processedTransactions.add(data.transactionId);
    }
    
    console.log('[ActivePositions] Transaction detected, forcing re-render:', data);
    
    if ((data.type === 'supply' || data.type === 'withdraw') && data.amount) {
      const affectedPosition = localPositions.find(pos => pos.contractAddress === data.poolContractAddress);
      
      if (affectedPosition) {
        if (data.type === 'supply') {
          const lpAmount = data.lpAmount || data.amount * 0.95;
          console.log(`[ActivePositions] Updating position ${affectedPosition.poolId} for supply:`, {
            amount: data.amount,
            lpAmount
          });
          
          updateUserPositionOptimistically(affectedPosition.poolId, data.amount, false);
        } else if (data.type === 'withdraw') {
          console.log(`[ActivePositions] Updating position ${affectedPosition.poolId} for withdraw:`, {
            amount: data.amount
          });
          
          updateUserPositionOptimistically(affectedPosition.poolId, data.amount, true);
        }
      }
    }
    
    setPositionsKey(prev => prev + 1);
    setTimeout(() => refreshPositions(), 500);
  });

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
    <div className="space-y-5" key={`positions-list-${positionsKey}-${updateTrigger}`}>
      {localPositions.map((position) => (
        <div 
          key={`${position.poolId}-${position.balance.toFixed(3)}-${position.currentValue.toFixed(3)}-${positionsKey}-${updateTrigger}`} 
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
                <span className="text-xs sm:text-sm text-gray-500">Current Value</span>
                <span className="text-xs sm:text-sm font-medium">
                  ${position.currentValue.toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2 mt-4">
              <div className="flex gap-2">
                {showSupplyButton(position.status) && (
                  <Button 
                    onClick={() => {
                      openSupplyModal({
                        poolId: position.poolId,
                        poolContractAddress: position.contractAddress,
                        lpSymbol: position.symbol,
                        refreshPositions: refreshPositions,
                        updateUserPositionOptimistically: (poolId, amount) => {
                          updateUserPositionOptimistically(poolId, amount, false);
                          setTimeout(() => refreshPositions(), 500);
                        }
                      });
                    }}
                    size="sm"
                    className="flex-1 bg-[#8B5CF6] hover:bg-[#7c4df3]"
                  >
                    Supply More
                  </Button>
                )}
                
                {showWithdrawButton(position.status) && (
                  <Button 
                    onClick={() => openWithdrawModal({
                      poolId: position.poolId,
                      lpBalance: position.balance,
                      lpValue: position.currentValue,
                      poolContractAddress: position.contractAddress,
                      onSuccessfulWithdraw: (amount) => {
                        updateUserPositionOptimistically(position.poolId, amount, true);
                        setTimeout(() => refreshPositions(), 500);
                      }
                    })}
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

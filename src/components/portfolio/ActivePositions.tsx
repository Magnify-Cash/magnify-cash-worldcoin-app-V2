
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserPoolPosition } from "@/hooks/useUserPoolPositions";
import { usePoolModals } from "@/hooks/usePoolModals";
import { usePortfolio } from "@/contexts/PortfolioContext";

interface ActivePositionsProps {
  positions: UserPoolPosition[];
  isMobile: boolean;
}

export const ActivePositions: React.FC<ActivePositionsProps> = ({
  positions,
  isMobile,
}) => {
  const navigate = useNavigate();
  const { openSupplyModal, openWithdrawModal } = usePoolModals();
  const { updatePositionOptimistically } = usePortfolio();
  const [renderKey, setRenderKey] = useState<number>(0);
  const previousPositionsRef = useRef<UserPoolPosition[]>([]);
  const processedTransactionsRef = useRef<Set<string>>(new Set());
  const clickTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const skipNextUpdateRef = useRef<boolean>(false);
  const lastOptimisticUpdateTimeRef = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    if (now - lastOptimisticUpdateTimeRef.current < 15000) {
      console.log('[ActivePositions] Skipping position update due to recent optimistic update');
      return;
    }
    
    if (skipNextUpdateRef.current) {
      console.log('[ActivePositions] Skipping position update due to flag');
      skipNextUpdateRef.current = false;
      return;
    }

    const positionsChanged = JSON.stringify(previousPositionsRef.current) !== JSON.stringify(positions);
    
    if (positionsChanged) {
      console.log('[ActivePositions] Positions changed, updating render key');
      console.log('[ActivePositions] New positions:', positions);
      previousPositionsRef.current = [...positions];
      setRenderKey(prev => prev + 1);
    }
  }, [positions]);

  useEffect(() => {
    return () => {
      Object.values(clickTimeoutsRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

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
    return (status === 'warm-up' || status === 'active') && status !== 'cooldown';
  };

  const showWithdrawButton = (status: 'warm-up' | 'active' | 'cooldown' | 'withdrawal') => {
    return (status === 'warm-up' || status === 'withdrawal') && status !== 'cooldown';
  };

  const generateTransactionId = () => {
    return `portfolio-tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const handleSupplyClick = (position: UserPoolPosition) => {
    const actionKey = `supply-${position.poolId}`;
    if (clickTimeoutsRef.current[actionKey]) {
      console.log(`[ActivePositions] Preventing duplicate supply action for pool ${position.poolId}`);
      return;
    }
    
    const transactionId = generateTransactionId();
    
    clickTimeoutsRef.current[actionKey] = setTimeout(() => {
      delete clickTimeoutsRef.current[actionKey];
    }, 2000);
    
    lastOptimisticUpdateTimeRef.current = Date.now();
    skipNextUpdateRef.current = true;
    
    console.log(`[ActivePositions] Opening supply modal for pool ${position.poolId} with transaction ID ${transactionId}`);
    
    openSupplyModal({
      poolId: position.poolId,
      poolContractAddress: position.contractAddress,
      lpSymbol: position.symbol,
      transactionId: transactionId,
      updateUserPositionOptimistically: null
    });
  };
  
  const handleWithdrawClick = (position: UserPoolPosition) => {
    const actionKey = `withdraw-${position.poolId}`;
    if (clickTimeoutsRef.current[actionKey]) {
      console.log(`[ActivePositions] Preventing duplicate withdraw action for pool ${position.poolId}`);
      return;
    }
    
    const transactionId = generateTransactionId();
    
    clickTimeoutsRef.current[actionKey] = setTimeout(() => {
      delete clickTimeoutsRef.current[actionKey];
    }, 2000);
    
    lastOptimisticUpdateTimeRef.current = Date.now();
    skipNextUpdateRef.current = true;
    
    console.log(`[ActivePositions] Opening withdraw modal for pool ${position.poolId} with transaction ID ${transactionId}`);
    
    openWithdrawModal({
      poolId: position.poolId,
      lpBalance: position.balance,
      lpValue: position.currentValue,
      poolContractAddress: position.contractAddress,
      transactionId: transactionId,
      onSuccessfulWithdraw: null
    });
  };

  return (
    <div className="space-y-5" key={`positions-list-${renderKey}`}>
      {positions.map((position) => {
        const positionKey = `position-${position.poolId}-${position.balance.toFixed(6)}-${position.currentValue.toFixed(6)}-${renderKey}`;
        
        return (
          <div 
            key={positionKey} 
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
                  onClick={() => navigate(`/pool/${position.contractAddress}`)}
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
                  {position.status !== 'cooldown' && showSupplyButton(position.status) && (
                    <Button 
                      onClick={() => handleSupplyClick(position)}
                      size="sm"
                      className="flex-1 bg-[#8B5CF6] hover:bg-[#7c4df3]"
                    >
                      Supply More
                    </Button>
                  )}
                  
                  {position.status !== 'cooldown' && showWithdrawButton(position.status) && (
                    <Button 
                      onClick={() => handleWithdrawClick(position)}
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
        );
      })}
    </div>
  );
};


import { useState, useEffect, useCallback } from 'react';
import { getPools } from '@/lib/poolRequests';
import { getUserLPBalance, previewRedeem } from '@/lib/backendRequests';
import { toast } from '@/components/ui/use-toast';
import { useCacheListener, EVENTS, TRANSACTION_TYPES } from '@/hooks/useCacheListener';

export interface UserPoolPosition {
  poolId: number;
  poolName: string;
  symbol: string;
  contractAddress: string;
  balance: number;
  currentValue: number;
  status: 'warm-up' | 'active' | 'cooldown' | 'withdrawal';
  apy: number;
}

interface UseUserPoolPositionsResult {
  positions: UserPoolPosition[];
  totalValue: number;
  loading: boolean;
  error: string | null;
  hasPositions: boolean;
  refreshPositions: () => void;
  updateUserPositionOptimistically: (poolId: number, amount: number, isWithdrawal?: boolean) => void;
}

export const useUserPoolPositions = (
  walletAddress: string,
  updateTrigger: number = 0
): UseUserPoolPositionsResult => {
  const [positions, setPositions] = useState<UserPoolPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [processedTransactions] = useState<Set<string>>(new Set());

  // Enhanced fetch positions function with better error handling
  const fetchPositions = useCallback(async () => {
    if (!walletAddress) {
      setPositions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const pools = await getPools();
      if (!pools || pools.length === 0) {
        setPositions([]);
        setLoading(false);
        return;
      }

      const positionPromises = pools.map(async (pool) => {
        if (!pool.contract_address) return null;

        try {
          const lpBalance = await getUserLPBalance(walletAddress, pool.contract_address);

          if (lpBalance.balance <= 0) return null;

          const redeemPreview = await previewRedeem(lpBalance.balance, pool.contract_address);

          return {
            poolId: pool.id,
            poolName: pool.name,
            symbol: pool.metadata?.symbol || 'LP',
            contractAddress: pool.contract_address,
            balance: lpBalance.balance,
            currentValue: redeemPreview.usdcAmount,
            status: pool.status,
            apy: pool.apy
          };
        } catch (err) {
          console.error(`Error fetching position for pool ${pool.id}:`, err);
          return null;
        }
      });

      const resolvedPositions = await Promise.all(positionPromises);
      const validPositions = resolvedPositions.filter(
        (position): position is UserPoolPosition => position !== null
      );

      console.log('[useUserPoolPositions] Fetched positions:', validPositions);
      setPositions(validPositions);
    } catch (err) {
      console.error("Error fetching user positions:", err);
      setError("Failed to load your portfolio data. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to load your portfolio data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  // Initial data fetch when component mounts or dependencies change
  useEffect(() => {
    fetchPositions();
  }, [fetchPositions, refreshTrigger, updateTrigger]);

  // Listen for transaction events to update positions optimistically
  useCacheListener(EVENTS.TRANSACTION_COMPLETED, (data) => {
    if (!data || !data.transactionId || processedTransactions.has(data.transactionId)) {
      return;
    }
    
    // Track processed transaction
    processedTransactions.add(data.transactionId);
    
    if (data.type === TRANSACTION_TYPES.SUPPLY && data.poolContractAddress) {
      console.log('[useUserPoolPositions] Optimistic supply update:', data);
      
      setPositions(prevPositions => {
        // Check if this position already exists
        const existingPosition = prevPositions.find(p => p.contractAddress === data.poolContractAddress);
        
        if (existingPosition) {
          // Update existing position
          return prevPositions.map(position => {
            if (position.contractAddress === data.poolContractAddress) {
              return {
                ...position,
                balance: position.balance + (data.lpAmount || 0),
                currentValue: position.currentValue + data.amount
              };
            }
            return position;
          });
        } else {
          // This would be a new position, but we need more data
          // In reality, we should fetch the pool details here
          // For now, we'll just trigger a refresh to load the new position
          setTimeout(() => refreshPositions(), 500);
          return prevPositions;
        }
      });
    } else if (data.type === TRANSACTION_TYPES.WITHDRAW && data.poolContractAddress) {
      console.log('[useUserPoolPositions] Optimistic withdraw update:', data);
      
      setPositions(prevPositions => {
        return prevPositions.map(position => {
          if (position.contractAddress === data.poolContractAddress) {
            const newBalance = Math.max(0, position.balance - (data.lpAmount || 0));
            const newValue = Math.max(0, position.currentValue - data.amount);
            
            // If the position is now empty, we might want to remove it
            if (newBalance <= 0) {
              // We'll simply filter it out in the next render
              return {
                ...position,
                balance: 0,
                currentValue: 0
              };
            }
            
            return {
              ...position,
              balance: newBalance,
              currentValue: newValue
            };
          }
          return position;
        }).filter(position => position.balance > 0);
      });
    }
  });

  const totalValue = positions.reduce((sum, position) => sum + position.currentValue, 0);
  const hasPositions = positions.length > 0;

  const refreshPositions = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const updateUserPositionOptimistically = (poolId: number, amount: number, isWithdrawal: boolean = false) => {
    setPositions((prevPositions) => {
      if (isWithdrawal) {
        // For withdrawals
        return prevPositions.map((position) => {
          if (position.poolId === poolId) {
            const estimatedLpAmount = amount / (position.currentValue / position.balance);
            const newBalance = Math.max(0, position.balance - estimatedLpAmount);
            const newValue = Math.max(0, position.currentValue - amount);
            
            return { 
              ...position, 
              balance: newBalance,
              currentValue: newValue 
            };
          }
          return position;
        }).filter(position => position.balance > 0); // Remove positions with zero balance
      } else {
        // For deposits
        return prevPositions.map((position) => {
          if (position.poolId === poolId) {
            const estimatedLpAmount = amount * 0.95; // Simple estimation
            return { 
              ...position, 
              balance: position.balance + estimatedLpAmount,
              currentValue: position.currentValue + amount 
            };
          }
          return position;
        });
      }
    });
  };

  return { 
    positions, 
    totalValue, 
    loading, 
    error, 
    hasPositions,
    refreshPositions,
    updateUserPositionOptimistically
  };
};

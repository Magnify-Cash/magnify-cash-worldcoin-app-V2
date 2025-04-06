
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const processedTransactions = useRef<Set<string>>(new Set());
  const initialLoadComplete = useRef(false);

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
            status: pool.status as 'warm-up' | 'active' | 'cooldown' | 'withdrawal',
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
      initialLoadComplete.current = true;
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
  
  // Listen for transaction events with enhanced processing for Portfolio
  useCacheListener(EVENTS.TRANSACTION_COMPLETED, (data) => {
    if (!data || !initialLoadComplete.current) {
      return;
    }
    
    // Skip if we've already processed this transaction
    if (data.transactionId && processedTransactions.current.has(data.transactionId)) {
      console.log('[useUserPoolPositions] Skipping already processed transaction:', data.transactionId);
      return;
    }
    
    // Track processed transactions
    if (data.transactionId) {
      console.log('[useUserPoolPositions] Processing transaction:', data.transactionId);
      processedTransactions.current.add(data.transactionId);
    }
    
    if (data.poolContractAddress) {
      console.log('[useUserPoolPositions] Transaction event with contract address detected:', data);
      
      if (data.type === TRANSACTION_TYPES.SUPPLY && data.amount) {
        console.log('[useUserPoolPositions] Optimistic supply update:', data);
        
        setPositions(prevPositions => {
          // Check if this position already exists
          const existingPosition = prevPositions.find(p => p.contractAddress === data.poolContractAddress);
          
          if (existingPosition) {
            // Update existing position
            return prevPositions.map(position => {
              if (position.contractAddress === data.poolContractAddress) {
                const lpAmount = data.lpAmount || data.amount * 0.95;
                console.log(`[useUserPoolPositions] Updating position ${position.poolId}:`, {
                  oldBalance: position.balance,
                  newBalance: position.balance + lpAmount,
                  oldValue: position.currentValue,
                  newValue: position.currentValue + data.amount
                });
                
                return {
                  ...position,
                  balance: position.balance + lpAmount,
                  currentValue: position.currentValue + data.amount
                };
              }
              return position;
            });
          } else {
            // This would be a new position, but we need more data
            // For now, we'll just trigger a refresh to load the new position
            setTimeout(() => setRefreshTrigger(prev => prev + 1), 500);
            return prevPositions;
          }
        });
      } else if (data.type === TRANSACTION_TYPES.WITHDRAW && data.amount) {
        console.log('[useUserPoolPositions] Optimistic withdraw update:', data);
        
        setPositions(prevPositions => {
          return prevPositions.map(position => {
            if (position.contractAddress === data.poolContractAddress) {
              const lpAmount = data.lpAmount || (position.balance > 0 ? 
                (data.amount / position.currentValue) * position.balance : data.amount * 0.95);
              
              const newBalance = Math.max(0, position.balance - lpAmount);
              const newValue = Math.max(0, position.currentValue - data.amount);
              
              console.log(`[useUserPoolPositions] Updating position ${position.poolId} for withdrawal:`, {
                oldBalance: position.balance,
                newBalance,
                oldValue: position.currentValue,
                newValue,
                lpAmount
              });
              
              // If the position is now empty, we'll filter it out
              if (newBalance <= 0) {
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
      
      // Schedule a refresh to get real data after a short delay
      setTimeout(() => setRefreshTrigger(prev => prev + 1), 1000);
    }
  });

  const totalValue = positions.reduce((sum, position) => sum + position.currentValue, 0);
  const hasPositions = positions.length > 0;

  const refreshPositions = useCallback(() => {
    console.log('[useUserPoolPositions] Manually refreshing positions');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // More accurate optimistic updates with better LP amount estimation
  const updateUserPositionOptimistically = useCallback((poolId: number, amount: number, isWithdrawal: boolean = false) => {
    console.log(`[useUserPoolPositions] Optimistically updating poolId ${poolId} with amount ${amount}, isWithdrawal: ${isWithdrawal}`);
    
    setPositions((prevPositions) => {
      if (isWithdrawal) {
        // For withdrawals
        return prevPositions.map((position) => {
          if (position.poolId === poolId) {
            // Calculate LP amount using the position's current ratio
            const estimatedLpAmount = position.balance > 0 ? 
              (amount / position.currentValue) * position.balance : amount * 0.95;
            
            const newBalance = Math.max(0, position.balance - estimatedLpAmount);
            const newValue = Math.max(0, position.currentValue - amount);
            
            console.log(`[useUserPoolPositions] Optimistically updating position ${poolId} for withdrawal:`, {
              oldBalance: position.balance,
              newBalance,
              oldValue: position.currentValue,
              newValue,
              estimatedLpAmount
            });
            
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
        const existingPosition = prevPositions.find(p => p.poolId === poolId);
        if (existingPosition) {
          return prevPositions.map((position) => {
            if (position.poolId === poolId) {
              // Use a reasonable LP estimate based on the current ratio, or default to 0.95
              const estimatedLpAmount = position.balance > 0 && position.currentValue > 0 ?
                (amount / position.currentValue) * position.balance : amount * 0.95;
                
              console.log(`[useUserPoolPositions] Optimistically updating position ${poolId} for deposit:`, {
                oldBalance: position.balance,
                newBalance: position.balance + estimatedLpAmount,
                oldValue: position.currentValue,
                newValue: position.currentValue + amount
              });
              
              return { 
                ...position, 
                balance: position.balance + estimatedLpAmount,
                currentValue: position.currentValue + amount 
              };
            }
            return position;
          });
        } else {
          // This would be a new position, which requires more data than we have
          // Schedule a refresh to load the new position from the API
          setTimeout(() => refreshPositions(), 500);
          return prevPositions;
        }
      }
    });
  }, [refreshPositions]);

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

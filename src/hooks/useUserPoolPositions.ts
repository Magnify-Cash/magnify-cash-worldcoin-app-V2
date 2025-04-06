
import { useState, useEffect, useCallback, useRef } from 'react';
import { getPools } from '@/lib/poolRequests';
import { getUserLPBalance, previewRedeem } from '@/lib/backendRequests';
import { toast } from '@/components/ui/use-toast';
import { useCacheListener, EVENTS, TRANSACTION_TYPES, emitCacheUpdate } from '@/hooks/useCacheListener';
import { Cache } from '@/utils/cacheUtils';

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
  const processedTransactions = useRef<Set<string>>(new Set());
  const positionsCache = useRef<Record<number, UserPoolPosition>>({});
  const isInitialized = useRef<boolean>(false);
  const refreshTimeoutRef = useRef<number | null>(null);

  // Enhanced fetch positions function with better caching
  const fetchPositions = useCallback(async () => {
    if (!walletAddress) {
      setPositions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('[useUserPoolPositions] Fetching fresh positions data');

      const pools = await getPools();
      if (!pools || pools.length === 0) {
        setPositions([]);
        setLoading(false);
        return;
      }

      const positionPromises = pools.map(async (pool) => {
        if (!pool.contract_address) return null;

        try {
          // Use cache key for each position
          const cacheKey = `user_position_${walletAddress}_${pool.contract_address}`;
          const cachedPosition = Cache.get<{ balance: number, currentValue: number }>(cacheKey);
          
          // Check for balance first
          const lpBalance = await getUserLPBalance(walletAddress, pool.contract_address);
          if (lpBalance.balance <= 0) return null;

          // Then get value
          const redeemPreview = await previewRedeem(lpBalance.balance, pool.contract_address);
          
          const position = {
            poolId: pool.id,
            poolName: pool.name,
            symbol: pool.metadata?.symbol || 'LP',
            contractAddress: pool.contract_address,
            balance: lpBalance.balance,
            currentValue: redeemPreview.usdcAmount,
            status: pool.status as 'warm-up' | 'active' | 'cooldown' | 'withdrawal',
            apy: pool.apy
          };
          
          // Update cache
          Cache.set(cacheKey, { 
            balance: position.balance, 
            currentValue: position.currentValue 
          }, 5, true);
          
          // Update our local cache reference
          positionsCache.current[pool.id] = position;

          return position;
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
      isInitialized.current = true;
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
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [fetchPositions, updateTrigger]);

  // Add direct manual position update function
  const updatePosition = useCallback((poolId: number, newPosition: Partial<UserPoolPosition>) => {
    setPositions(currentPositions => {
      return currentPositions.map(position => {
        if (position.poolId === poolId) {
          return { ...position, ...newPosition };
        }
        return position;
      });
    });
  }, []);
  
  // Listen for transaction events with enhanced processing
  useCacheListener(EVENTS.TRANSACTION_COMPLETED, (data) => {
    if (!data || !isInitialized.current) {
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
      console.log('[useUserPoolPositions] Transaction event detected:', data);
      
      // Find position by contract address
      const position = positions.find(p => p.contractAddress === data.poolContractAddress);
      
      if (position) {
        if (data.type === TRANSACTION_TYPES.SUPPLY && data.amount) {
          const lpAmount = data.lpAmount || data.amount * 0.95;
          const newBalance = position.balance + lpAmount;
          const newValue = position.currentValue + data.amount;
          
          console.log(`[useUserPoolPositions] Updating position ${position.poolId} for supply:`, {
            oldBalance: position.balance,
            newBalance,
            oldValue: position.currentValue,
            newValue
          });
          
          // Update UI immediately
          updatePosition(position.poolId, {
            balance: newBalance,
            currentValue: newValue
          });
          
          // Update cache
          const cacheKey = `user_position_${walletAddress}_${position.contractAddress}`;
          Cache.set(cacheKey, { 
            balance: newBalance, 
            currentValue: newValue 
          }, 5, true);
          
        } else if (data.type === TRANSACTION_TYPES.WITHDRAW && data.amount) {
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
          
          // Update UI immediately
          updatePosition(position.poolId, {
            balance: newBalance,
            currentValue: newValue
          });
          
          // Update cache
          const cacheKey = `user_position_${walletAddress}_${position.contractAddress}`;
          Cache.set(cacheKey, { 
            balance: newBalance, 
            currentValue: newValue 
          }, 5, true);
        }
      }
    }
  });

  const totalValue = positions.reduce((sum, position) => sum + position.currentValue, 0);
  const hasPositions = positions.length > 0;

  // Refresh function to force data reload with debounce
  const refreshPositions = useCallback(() => {
    console.log('[useUserPoolPositions] Manually refreshing positions');
    
    // Clear any pending refresh to avoid multiple refreshes
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Set a short timeout to avoid multiple rapid refreshes
    refreshTimeoutRef.current = window.setTimeout(() => {
      fetchPositions();
      refreshTimeoutRef.current = null;
    }, 100);
  }, [fetchPositions]);

  // More accurate optimistic updates with better LP amount estimation
  const updateUserPositionOptimistically = useCallback((poolId: number, amount: number, isWithdrawal: boolean = false) => {
    console.log(`[useUserPoolPositions] Optimistically updating poolId ${poolId} with amount ${amount}, isWithdrawal: ${isWithdrawal}`);
    
    const position = positions.find(p => p.poolId === poolId);
    if (!position) {
      console.log(`[useUserPoolPositions] Position not found for poolId ${poolId}`);
      return;
    }
    
    if (isWithdrawal) {
      // For withdrawals
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
      
      // Update position in state
      updatePosition(poolId, {
        balance: newBalance,
        currentValue: newValue
      });
      
      // Also simulate transaction event
      const transactionId = `manual-tx-${Date.now()}`;
      emitCacheUpdate(EVENTS.TRANSACTION_COMPLETED, {
        type: TRANSACTION_TYPES.WITHDRAW,
        amount: amount,
        lpAmount: estimatedLpAmount,
        poolContractAddress: position.contractAddress,
        timestamp: Date.now(),
        isUserAction: true,
        transactionId
      });
      
      // Update cache
      const cacheKey = `user_position_${walletAddress}_${position.contractAddress}`;
      Cache.set(cacheKey, { 
        balance: newBalance, 
        currentValue: newValue 
      }, 5, true);
      
    } else {
      // For deposits
      // Use a reasonable LP estimate based on the current ratio, or default to 0.95
      const estimatedLpAmount = position.balance > 0 && position.currentValue > 0 ?
        (amount / position.currentValue) * position.balance : amount * 0.95;
        
      const newBalance = position.balance + estimatedLpAmount;
      const newValue = position.currentValue + amount;
      
      console.log(`[useUserPoolPositions] Optimistically updating position ${poolId} for deposit:`, {
        oldBalance: position.balance,
        newBalance,
        oldValue: position.currentValue,
        newValue,
        estimatedLpAmount
      });
      
      // Update position in state
      updatePosition(poolId, {
        balance: newBalance,
        currentValue: newValue
      });
      
      // Also simulate transaction event
      const transactionId = `manual-tx-${Date.now()}`;
      emitCacheUpdate(EVENTS.TRANSACTION_COMPLETED, {
        type: TRANSACTION_TYPES.SUPPLY,
        amount: amount,
        lpAmount: estimatedLpAmount,
        poolContractAddress: position.contractAddress,
        timestamp: Date.now(),
        isUserAction: true,
        transactionId
      });
      
      // Update cache
      const cacheKey = `user_position_${walletAddress}_${position.contractAddress}`;
      Cache.set(cacheKey, { 
        balance: newBalance, 
        currentValue: newValue 
      }, 5, true);
    }
  }, [positions, updatePosition, walletAddress]);

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

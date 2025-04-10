import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Cache } from '@/utils/cacheUtils';
import { useCacheListener, EVENTS, TRANSACTION_TYPES, emitCacheUpdate } from '@/hooks/useCacheListener';
import { UserPoolPosition } from '@/hooks/useUserPoolPositions';
import { getPools } from '@/lib/poolRequests';
import { getUserLPBalance, previewRedeem } from '@/lib/backendRequests';

interface PortfolioState {
  positions: UserPoolPosition[];
  totalValue: number;
  loading: boolean;
  error: string | null;
  hasPositions: boolean;
  lastUpdated: number;
}

interface PortfolioContextType {
  state: PortfolioState;
  refreshPortfolio: (forceRefresh?: boolean) => void;
  updatePositionOptimistically: (poolId: number, amount: number, isWithdrawal?: boolean, lpAmount?: number) => void;
}

const initialState: PortfolioState = {
  positions: [],
  totalValue: 0,
  loading: true,
  error: null,
  hasPositions: false,
  lastUpdated: 0
};

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<PortfolioState>(initialState);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const processedTransactions = useRef<Set<string>>(new Set());
  const refreshTimeoutRef = useRef<number | null>(null);
  const positionsCache = useRef<Record<number, UserPoolPosition>>({});
  const optimisticUpdateTimestampRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);
  const optimisticUpdatesActive = useRef<Set<number>>(new Set());
  const disableAutoRefresh = useRef<boolean>(false);
  
  // Get user's wallet address from localStorage
  useEffect(() => {
    const ls_wallet = localStorage.getItem("ls_wallet_address");
    if (!ls_wallet) {
      // Redirect to welcome page if no wallet address is found
      navigate("/welcome");
      return;
    }
    setWalletAddress(ls_wallet);
  }, [navigate]);

  // Fetch portfolio data - without caching
  const fetchPortfolio = useCallback(async (forceRefresh = false) => {
    if (!walletAddress) {
      setState(prev => ({ ...prev, loading: false, positions: [], hasPositions: false }));
      return;
    }
    
    // Prevent multiple concurrent fetches
    if (isFetchingRef.current) {
      console.log('[PortfolioProvider] Already fetching data, skipping this request');
      return;
    }
    
    // Skip fetching if we have recent optimistic updates (unless forced)
    if (!forceRefresh) {
      // Enhanced cooldown logic - don't auto-refresh for a longer period after optimistic updates
      if (Date.now() - optimisticUpdateTimestampRef.current < 30000 && 
          optimisticUpdatesActive.current.size > 0) {
        console.log('[PortfolioProvider] Skipping fetch due to recent optimistic updates');
        return;
      }
      
      // Also respect the global auto-refresh disable flag
      if (disableAutoRefresh.current) {
        console.log('[PortfolioProvider] Skipping fetch due to disabled auto-refresh');
        return;
      }
    }
    
    // Set the fetching flag
    isFetchingRef.current = true;
    
    // Record fetch start time to avoid race conditions
    const fetchStartTime = Date.now();

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      console.log('[PortfolioProvider] Fetching portfolio data. Force refresh:', forceRefresh);

      const pools = await getPools();
      if (!pools || pools.length === 0) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          positions: [],
          totalValue: 0,
          hasPositions: false,
          lastUpdated: fetchStartTime
        }));
        isFetchingRef.current = false;
        return;
      }

      const positionPromises = pools.map(async (pool) => {
        if (!pool.contract_address) return null;
        
        // Skip fetching this pool if there's an active optimistic update for it
        // and we're not forcing a refresh
        if (!forceRefresh && optimisticUpdatesActive.current.has(pool.id)) {
          console.log(`[PortfolioProvider] Skipping fetch for pool ${pool.id} due to active optimistic update`);
          const cachedPosition = positionsCache.current[pool.id];
          return cachedPosition || null;
        }

        try {
          // Always fetch fresh data
          const lpBalance = await getUserLPBalance(walletAddress, pool.contract_address);
          if (lpBalance.balance <= 0) return null;

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
          
          // Update local reference
          positionsCache.current[pool.id] = position;

          return position;
        } catch (err) {
          console.error(`Error fetching position for pool ${pool.id}:`, err);
          // Return the cached position if we have one rather than null
          return positionsCache.current[pool.id] || null;
        }
      });

      const resolvedPositions = await Promise.all(positionPromises);
      const validPositions = resolvedPositions.filter(
        (position): position is UserPoolPosition => position !== null
      );
      
      const newTotalValue = validPositions.reduce((sum, position) => sum + position.currentValue, 0);
      
      // Don't apply the fetched data if it's older than the last optimistic update
      // or if there's an active optimistic update and we're not forcing a refresh
      if (!forceRefresh && fetchStartTime < optimisticUpdateTimestampRef.current && 
          optimisticUpdatesActive.current.size > 0) {
        console.log('[PortfolioProvider] Not applying fetch results because there was a more recent optimistic update');
        isFetchingRef.current = false;
        return;
      }
      
      setState({
        positions: validPositions,
        totalValue: newTotalValue,
        loading: false,
        error: null,
        hasPositions: validPositions.length > 0,
        lastUpdated: fetchStartTime
      });
    } catch (err) {
      console.error("Error fetching portfolio data:", err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Failed to load your portfolio data. Please try again later.",
        lastUpdated: fetchStartTime
      }));
      toast({
        title: "Error",
        description: "Failed to load your portfolio data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      isFetchingRef.current = false;
    }
  }, [walletAddress, navigate]);

  // Initialize the portfolio
  useEffect(() => {
    if (walletAddress) {
      fetchPortfolio(true);
    }
    
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [walletAddress, fetchPortfolio]);

  // Force refresh function
  const refreshPortfolio = useCallback((forceRefresh = true) => {
    console.log('[PortfolioProvider] Refreshing portfolio. Force refresh:', forceRefresh);
    
    // Clear any pending refresh to avoid multiple refreshes
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // If it's a force refresh, temporarily allow it regardless of auto-refresh setting
    if (forceRefresh) {
      disableAutoRefresh.current = false;
    }
    
    // Set a short timeout to avoid multiple rapid refreshes
    refreshTimeoutRef.current = window.setTimeout(() => {
      fetchPortfolio(forceRefresh);
      refreshTimeoutRef.current = null;
      
      // If it was a force refresh, restore the auto-refresh setting
      if (forceRefresh) {
        disableAutoRefresh.current = true;
        
        // Re-enable auto-refresh after a long period (5 minutes)
        setTimeout(() => {
          console.log('[PortfolioProvider] Re-enabling auto-refresh after timeout');
          disableAutoRefresh.current = false;
        }, 300000); // 5 minutes
      }
    }, 100);
  }, [fetchPortfolio]);

  // Update position optimistically
  const updatePositionOptimistically = useCallback((
    poolId: number, 
    amount: number, 
    isWithdrawal: boolean = false,
    lpAmount?: number
  ) => {
    console.log(`[PortfolioProvider] Optimistically updating poolId ${poolId} with amount ${amount}, isWithdrawal: ${isWithdrawal}`);
    
    // Set the optimistic update timestamp and mark this pool as having an active update
    optimisticUpdateTimestampRef.current = Date.now();
    optimisticUpdatesActive.current.add(poolId);
    
    // Disable auto-refresh for a longer period after manual updates
    disableAutoRefresh.current = true;
    
    setState(currentState => {
      // Find the position to update
      const position = currentState.positions.find(p => p.poolId === poolId);
      
      // If the position doesn't exist and we're trying to withdraw, nothing to do
      if (!position && isWithdrawal) {
        console.log(`[PortfolioProvider] Position not found for withdrawal from poolId ${poolId}`);
        return currentState;
      }
      
      let updatedPositions = [...currentState.positions];
      let updatedTotalValue = currentState.totalValue;
      
      if (position) {
        // Update existing position
        if (isWithdrawal) {
          // For withdrawals
          // Calculate LP amount using the position's current ratio or use provided lpAmount
          const estimatedLpAmount = lpAmount || (position.balance > 0 ? 
            (amount / position.currentValue) * position.balance : amount * 0.95);
          
          const newBalance = Math.max(0, position.balance - estimatedLpAmount);
          const newValue = Math.max(0, position.currentValue - amount);
          
          console.log(`[PortfolioProvider] Optimistically updating position ${poolId} for withdrawal:`, {
            oldBalance: position.balance,
            newBalance,
            oldValue: position.currentValue,
            newValue,
            estimatedLpAmount
          });
          
          const updatedPosition = {
            ...position,
            balance: newBalance,
            currentValue: newValue
          };
          
          // Update position in state and cache
          updatedPositions = currentState.positions.map(p => 
            p.poolId === poolId ? updatedPosition : p
          );
          
          positionsCache.current[poolId] = updatedPosition;
          
          updatedTotalValue = Math.max(0, currentState.totalValue - amount);
        } else {
          // For deposits to existing positions
          // Use provided LP amount or estimate based on the current ratio
          const estimatedLpAmount = lpAmount || (position.balance > 0 && position.currentValue > 0 ?
            (amount / position.currentValue) * position.balance : amount * 0.95);
            
          const newBalance = position.balance + estimatedLpAmount;
          const newValue = position.currentValue + amount;
          
          console.log(`[PortfolioProvider] Optimistically updating position ${poolId} for deposit:`, {
            oldBalance: position.balance,
            newBalance,
            oldValue: position.currentValue,
            newValue,
            estimatedLpAmount
          });
          
          const updatedPosition = {
            ...position,
            balance: newBalance,
            currentValue: newValue
          };
          
          // Update position in state and cache
          updatedPositions = currentState.positions.map(p => 
            p.poolId === poolId ? updatedPosition : p
          );
          
          positionsCache.current[poolId] = updatedPosition;
          
          updatedTotalValue = currentState.totalValue + amount;
        }
      } else {
        // Position doesn't exist, creating a new one for a deposit
        // We need to find the pool details first
        getPools().then(pools => {
          const pool = pools.find(p => p.id === poolId);
          if (pool && pool.contract_address) {
            const estimatedLpAmount = lpAmount || amount * 0.95;
            
            const newPosition: UserPoolPosition = {
              poolId: pool.id,
              poolName: pool.name,
              symbol: pool.metadata?.symbol || 'LP',
              contractAddress: pool.contract_address,
              balance: estimatedLpAmount,
              currentValue: amount,
              status: pool.status as 'warm-up' | 'active' | 'cooldown' | 'withdrawal',
              apy: pool.apy
            };
            
            console.log(`[PortfolioProvider] Adding new position for poolId ${poolId}:`, newPosition);
            
            // Update state with the new position
            setState(prevState => ({
              ...prevState,
              positions: [...prevState.positions, newPosition],
              totalValue: prevState.totalValue + amount,
              hasPositions: true,
              lastUpdated: Date.now()
            }));
            
            // Update cache
            positionsCache.current[poolId] = newPosition;
          }
        }).catch(err => {
          console.error(`Error creating new position for pool ${poolId}:`, err);
        });
      }
      
      // Create and emit transaction event
      const transactionId = `manual-tx-${Date.now()}`;
      const poolAddress = position?.contractAddress;
      
      if (poolAddress) {
        emitCacheUpdate(EVENTS.TRANSACTION_COMPLETED, {
          type: isWithdrawal ? TRANSACTION_TYPES.WITHDRAW : TRANSACTION_TYPES.SUPPLY,
          amount: amount,
          lpAmount: lpAmount || (amount * 0.95),
          poolContractAddress: poolAddress,
          timestamp: Date.now(),
          isUserAction: true,
          transactionId
        });
      }
      
      // Schedule clearing the optimistic flag after some time
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = window.setTimeout(() => {
        console.log(`[PortfolioProvider] Clearing optimistic update flag for pool ${poolId}`);
        optimisticUpdatesActive.current.delete(poolId);
        
        // Only reset auto-refresh disable if all optimistic updates are done
        if (optimisticUpdatesActive.current.size === 0) {
          console.log(`[PortfolioProvider] All optimistic updates cleared, re-enabling auto-refresh`);
          // Wait 5 minutes before re-enabling auto-refresh
          setTimeout(() => {
            disableAutoRefresh.current = false;
          }, 300000); // 5 minutes
        }
        
        refreshTimeoutRef.current = null;
      }, 30000); // Longer delay before clearing optimistic state
      
      return {
        ...currentState,
        positions: updatedPositions,
        totalValue: updatedTotalValue,
        hasPositions: updatedPositions.some(p => p.balance > 0),
        lastUpdated: Date.now()
      };
    });
  }, []);

  // Listen for transaction events
  useCacheListener(EVENTS.TRANSACTION_COMPLETED, (data) => {
    if (!data || !walletAddress) return;
    
    // Skip if we've already processed this transaction
    if (data.transactionId && processedTransactions.current.has(data.transactionId)) {
      console.log('[PortfolioProvider] Skipping already processed transaction:', data.transactionId);
      return;
    }
    
    // Track processed transactions to avoid duplicates
    if (data.transactionId) {
      console.log('[PortfolioProvider] Processing transaction:', data.transactionId);
      processedTransactions.current.add(data.transactionId);
      
      // Disable auto-refresh when processing a transaction
      disableAutoRefresh.current = true;
    }
    
    console.log('[PortfolioProvider] Transaction event received:', data);
    
    // Find the affected position by contract address
    setState(currentState => {
      const affectedPosition = currentState.positions.find(
        p => p.contractAddress === data.poolContractAddress
      );
      
      if (!affectedPosition) return currentState;
      
      // Find pool ID for this contract address
      const poolId = affectedPosition.poolId;
      
      // Set the optimistic update flag
      optimisticUpdateTimestampRef.current = Date.now();
      optimisticUpdatesActive.current.add(poolId);
      
      let updatedPosition: UserPoolPosition;
      let updatedTotalValue = currentState.totalValue;
      
      if (data.type === TRANSACTION_TYPES.SUPPLY && data.amount) {
        const lpAmount = data.lpAmount || data.amount * 0.95;
        const newBalance = affectedPosition.balance + lpAmount;
        const newValue = affectedPosition.currentValue + data.amount;
        
        updatedPosition = {
          ...affectedPosition,
          balance: newBalance,
          currentValue: newValue
        };
        
        updatedTotalValue += data.amount;
        
        // Update cache
        positionsCache.current[poolId] = updatedPosition;
        
        console.log(`[PortfolioProvider] Updating position ${affectedPosition.poolId} for supply:`, {
          oldBalance: affectedPosition.balance,
          newBalance,
          oldValue: affectedPosition.currentValue,
          newValue
        });
      } 
      else if (data.type === TRANSACTION_TYPES.WITHDRAW && data.amount) {
        const lpAmount = data.lpAmount || (affectedPosition.balance > 0 ? 
          (data.amount / affectedPosition.currentValue) * affectedPosition.balance : data.amount * 0.95);
          
        const newBalance = Math.max(0, affectedPosition.balance - lpAmount);
        const newValue = Math.max(0, affectedPosition.currentValue - data.amount);
        
        updatedPosition = {
          ...affectedPosition,
          balance: newBalance,
          currentValue: newValue
        };
        
        updatedTotalValue -= data.amount;
        
        // Update cache
        positionsCache.current[poolId] = updatedPosition;
        
        console.log(`[PortfolioProvider] Updating position ${affectedPosition.poolId} for withdrawal:`, {
          oldBalance: affectedPosition.balance,
          newBalance,
          oldValue: affectedPosition.currentValue,
          newValue,
          lpAmount
        });
      }
      else {
        return currentState;
      }
      
      // Update position in state
      const updatedPositions = currentState.positions.map(p => 
        p.poolId === affectedPosition.poolId ? updatedPosition : p
      );
      
      // Schedule clearing the optimistic flag after some time
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = window.setTimeout(() => {
        console.log(`[PortfolioProvider] Clearing optimistic update flag for pool ${poolId}`);
        optimisticUpdatesActive.current.delete(poolId);
        
        // Only re-enable auto-refresh if all optimistic updates are done
        if (optimisticUpdatesActive.current.size === 0) {
          console.log(`[PortfolioProvider] All optimistic updates cleared, scheduling re-enabling of auto-refresh`);
          // Wait 5 minutes before re-enabling auto-refresh
          setTimeout(() => {
            disableAutoRefresh.current = false;
          }, 300000); // 5 minutes
        }
        
        refreshTimeoutRef.current = null;
      }, 30000); // Longer delay before clearing optimistic state
      
      return {
        ...currentState,
        positions: updatedPositions,
        totalValue: updatedTotalValue,
        hasPositions: updatedPositions.some(p => p.balance > 0),
        lastUpdated: Date.now()
      };
    });
  });

  const contextValue: PortfolioContextType = {
    state,
    refreshPortfolio,
    updatePositionOptimistically,
  };

  return (
    <PortfolioContext.Provider value={contextValue}>
      {children}
    </PortfolioContext.Provider>
  );
}

// Custom hook to use the portfolio context
export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

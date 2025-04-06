
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
  refreshPortfolio: () => void;
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
  const fetchPortfolio = useCallback(async (avoidOptimisticOverwrite = false) => {
    if (!walletAddress) {
      setState(prev => ({ ...prev, loading: false, positions: [], hasPositions: false }));
      return;
    }
    
    // Prevent multiple concurrent fetches
    if (isFetchingRef.current) {
      console.log('[PortfolioProvider] Already fetching data, skipping this request');
      return;
    }
    
    // Set the fetching flag
    isFetchingRef.current = true;
    
    // Record fetch start time to avoid race conditions
    const fetchStartTime = Date.now();

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      console.log('[PortfolioProvider] Fetching fresh portfolio data');

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

        try {
          // Always fetch fresh data - no caching
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
          
          // Update local reference only (no cache)
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
      
      const newTotalValue = validPositions.reduce((sum, position) => sum + position.currentValue, 0);

      console.log('[PortfolioProvider] Fetched positions:', validPositions);
      console.log('[PortfolioProvider] New total value:', newTotalValue);
      
      // Check if we should avoid overwriting optimistic updates
      // Only apply the fetched data if it's newer than the last optimistic update
      // or if we explicitly want to overwrite optimistic updates
      if (!avoidOptimisticOverwrite && fetchStartTime < optimisticUpdateTimestampRef.current) {
        console.log('[PortfolioProvider] Skipping update as there was a more recent optimistic update');
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
      fetchPortfolio();
    }
    
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [walletAddress, fetchPortfolio]);

  // Force refresh function
  const refreshPortfolio = useCallback(() => {
    console.log('[PortfolioProvider] Manually refreshing portfolio');
    
    // Clear any pending refresh to avoid multiple refreshes
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Set a short timeout to avoid multiple rapid refreshes
    refreshTimeoutRef.current = window.setTimeout(() => {
      fetchPortfolio(true); // Force overwrite any optimistic updates
      refreshTimeoutRef.current = null;
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
    
    // Set the optimistic update timestamp
    optimisticUpdateTimestampRef.current = Date.now();
    
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
          
          // Update position in state
          updatedPositions = currentState.positions.map(p => 
            p.poolId === poolId ? updatedPosition : p
          );
          
          updatedTotalValue = currentState.totalValue - amount;
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
          
          // Update position in state
          updatedPositions = currentState.positions.map(p => 
            p.poolId === poolId ? updatedPosition : p
          );
          
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
      
      // Schedule a fresh data fetch after a delay
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = window.setTimeout(() => {
        console.log(`[PortfolioProvider] Fetching real data after optimistic update delay`);
        fetchPortfolio();
        refreshTimeoutRef.current = null;
      }, 5000); // Longer delay before fetching the real data
      
      return {
        ...currentState,
        positions: updatedPositions,
        totalValue: updatedTotalValue,
        hasPositions: updatedPositions.some(p => p.balance > 0),
        lastUpdated: Date.now()
      };
    });
  }, [fetchPortfolio]);

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
    }
    
    console.log('[PortfolioProvider] Transaction event received:', data);
    
    // Find the affected position by contract address
    setState(currentState => {
      const affectedPosition = currentState.positions.find(
        p => p.contractAddress === data.poolContractAddress
      );
      
      if (!affectedPosition) return currentState;
      
      // Set the optimistic update timestamp
      optimisticUpdateTimestampRef.current = Date.now();
      
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
      
      // Schedule a fresh data fetch after a delay
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = window.setTimeout(() => {
        console.log(`[PortfolioProvider] Fetching real data after transaction delay`);
        fetchPortfolio();
        refreshTimeoutRef.current = null;
      }, 5000); // Longer delay before fetching the real data
      
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

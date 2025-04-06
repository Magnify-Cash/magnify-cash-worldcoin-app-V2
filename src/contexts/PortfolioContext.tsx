
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

  // Fetch portfolio data
  const fetchPortfolio = useCallback(async () => {
    if (!walletAddress) {
      setState(prev => ({ ...prev, loading: false, positions: [], hasPositions: false }));
      return;
    }

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
          lastUpdated: Date.now()
        }));
        return;
      }

      const positionPromises = pools.map(async (pool) => {
        if (!pool.contract_address) return null;

        try {
          // Use cache key for each position
          const cacheKey = `user_position_${walletAddress}_${pool.contract_address}`;
          
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
          
          // Update local cache reference
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
      
      setState({
        positions: validPositions,
        totalValue: newTotalValue,
        loading: false,
        error: null,
        hasPositions: validPositions.length > 0,
        lastUpdated: Date.now()
      });
    } catch (err) {
      console.error("Error fetching portfolio data:", err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Failed to load your portfolio data. Please try again later.",
        lastUpdated: Date.now()
      }));
      toast({
        title: "Error",
        description: "Failed to load your portfolio data. Please try again later.",
        variant: "destructive",
      });
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
      fetchPortfolio();
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
    
    setState(currentState => {
      const position = currentState.positions.find(p => p.poolId === poolId);
      if (!position) {
        console.log(`[PortfolioProvider] Position not found for poolId ${poolId}`);
        return currentState;
      }
      
      let updatedPosition: UserPoolPosition;
      let updatedTotalValue = currentState.totalValue;
      
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
        
        updatedPosition = {
          ...position,
          balance: newBalance,
          currentValue: newValue
        };
        
        updatedTotalValue = currentState.totalValue - amount;
      } else {
        // For deposits
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
        
        updatedPosition = {
          ...position,
          balance: newBalance,
          currentValue: newValue
        };
        
        updatedTotalValue = currentState.totalValue + amount;
      }
      
      // Update position in state
      const updatedPositions = currentState.positions.map(p => 
        p.poolId === poolId ? updatedPosition : p
      );
      
      // Also simulate transaction event
      const transactionId = `manual-tx-${Date.now()}`;
      emitCacheUpdate(EVENTS.TRANSACTION_COMPLETED, {
        type: isWithdrawal ? TRANSACTION_TYPES.WITHDRAW : TRANSACTION_TYPES.SUPPLY,
        amount: amount,
        lpAmount: lpAmount || (amount * 0.95),
        poolContractAddress: position.contractAddress,
        timestamp: Date.now(),
        isUserAction: true,
        transactionId
      });
      
      // Update cache for the position
      if (walletAddress) {
        const cacheKey = `user_position_${walletAddress}_${position.contractAddress}`;
        Cache.set(cacheKey, { 
          balance: updatedPosition.balance, 
          currentValue: updatedPosition.currentValue 
        }, 5, true);
      }
      
      return {
        ...currentState,
        positions: updatedPositions,
        totalValue: updatedTotalValue,
        hasPositions: updatedPositions.some(p => p.balance > 0),
        lastUpdated: Date.now()
      };
    });
  }, [walletAddress]);

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
      
      // Update cache
      const cacheKey = `user_position_${walletAddress}_${affectedPosition.contractAddress}`;
      Cache.set(cacheKey, { 
        balance: updatedPosition.balance, 
        currentValue: updatedPosition.currentValue 
      }, 5, true);
      
      // Schedule a fresh data fetch after a delay
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      refreshTimeoutRef.current = window.setTimeout(() => {
        fetchPortfolio();
        refreshTimeoutRef.current = null;
      }, 3000);
      
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

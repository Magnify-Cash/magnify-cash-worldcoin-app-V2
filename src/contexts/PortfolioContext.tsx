import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Cache } from '@/utils/cacheUtils';
import { useCacheListener, EVENTS, TRANSACTION_TYPES, emitCacheUpdate } from '@/hooks/useCacheListener';
import { UserPoolPosition } from '@/hooks/useUserPoolPositions';
import { getPools } from '@/lib/poolRequests';
import { getUserLPBalance, previewRedeem } from '@/lib/backendRequests';

const MIN_POSITION_VALUE_USD = 0.1;

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
  
  useEffect(() => {
    const ls_wallet = localStorage.getItem("ls_wallet_address");
    if (!ls_wallet) {
      navigate("/welcome");
      return;
    }
    setWalletAddress(ls_wallet);
  }, [navigate]);

  const fetchPortfolio = useCallback(async (forceRefresh = false) => {
    if (!walletAddress) {
      setState(prev => ({ ...prev, loading: false, positions: [], hasPositions: false }));
      return;
    }
    
    if (isFetchingRef.current) {
      console.log('[PortfolioProvider] Already fetching data, skipping this request');
      return;
    }
    
    if (!forceRefresh) {
      if (Date.now() - optimisticUpdateTimestampRef.current < 30000 && 
          optimisticUpdatesActive.current.size > 0) {
        console.log('[PortfolioProvider] Skipping fetch due to recent optimistic updates');
        return;
      }
      
      if (disableAutoRefresh.current) {
        console.log('[PortfolioProvider] Skipping fetch due to disabled auto-refresh');
        return;
      }
    }
    
    isFetchingRef.current = true;
    
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
        
        if (!forceRefresh && optimisticUpdatesActive.current.has(pool.id)) {
          console.log(`[PortfolioProvider] Skipping fetch for pool ${pool.id} due to active optimistic update`);
          const cachedPosition = positionsCache.current[pool.id];
          return cachedPosition || null;
        }

        try {
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
          
          positionsCache.current[pool.id] = position;

          return position;
        } catch (err) {
          console.error(`Error fetching position for pool ${pool.id}:`, err);
          return positionsCache.current[pool.id] || null;
        }
      });

      const resolvedPositions = await Promise.all(positionPromises);
      
      const validPositions = resolvedPositions
        .filter((position): position is UserPoolPosition => position !== null)
        .filter(position => position.currentValue >= MIN_POSITION_VALUE_USD);
      
      const newTotalValue = validPositions.reduce((sum, position) => sum + position.currentValue, 0);
      
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

  const refreshPortfolio = useCallback((forceRefresh = true) => {
    console.log('[PortfolioProvider] Refreshing portfolio. Force refresh:', forceRefresh);
    
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    if (forceRefresh) {
      disableAutoRefresh.current = false;
    }
    
    refreshTimeoutRef.current = window.setTimeout(() => {
      fetchPortfolio(forceRefresh);
      refreshTimeoutRef.current = null;
      
      if (forceRefresh) {
        disableAutoRefresh.current = true;
        
        setTimeout(() => {
          console.log('[PortfolioProvider] Re-enabling auto-refresh after timeout');
          disableAutoRefresh.current = false;
        }, 300000);
      }
    }, 100);
  }, [fetchPortfolio]);

  const updatePositionOptimistically = useCallback((
    poolId: number, 
    amount: number, 
    isWithdrawal: boolean = false,
    lpAmount?: number
  ) => {
    console.log(`[PortfolioProvider] Optimistically updating poolId ${poolId} with amount ${amount}, isWithdrawal: ${isWithdrawal}`);
    
    optimisticUpdateTimestampRef.current = Date.now();
    optimisticUpdatesActive.current.add(poolId);
    
    disableAutoRefresh.current = true;
    
    setState(currentState => {
      const position = currentState.positions.find(p => p.poolId === poolId);
      
      if (!position && isWithdrawal) {
        console.log(`[PortfolioProvider] Position not found for withdrawal from poolId ${poolId}`);
        return currentState;
      }
      
      let updatedPositions = [...currentState.positions];
      let updatedTotalValue = currentState.totalValue;
      
      if (position) {
        if (isWithdrawal) {
          const estimatedLpAmount = lpAmount || (position.balance > 0 ? 
            (amount / position.currentValue) * position.balance : amount * 0.95);
          
          const newBalance = Math.max(0, position.balance - estimatedLpAmount);
          const newValue = Math.max(0, position.currentValue - amount);
          
          if (newValue < MIN_POSITION_VALUE_USD) {
            updatedPositions = currentState.positions.filter(p => p.poolId !== poolId);
            console.log(`[PortfolioProvider] Removing position ${poolId} as value is below minimum threshold`);
          } else {
            const updatedPosition = {
              ...position,
              balance: newBalance,
              currentValue: newValue
            };
            
            updatedPositions = currentState.positions.map(p => 
              p.poolId === poolId ? updatedPosition : p
            );
            
            positionsCache.current[poolId] = updatedPosition;
          }
          
          updatedTotalValue = Math.max(0, currentState.totalValue - amount);
        } else {
          const estimatedLpAmount = lpAmount || (position.balance > 0 && position.currentValue > 0 ?
            (amount / position.currentValue) * position.balance : amount * 0.95);
            
          const newBalance = position.balance + estimatedLpAmount;
          const newValue = position.currentValue + amount;
          
          const updatedPosition = {
            ...position,
            balance: newBalance,
            currentValue: newValue
          };
          
          updatedPositions = currentState.positions.map(p => 
            p.poolId === poolId ? updatedPosition : p
          );
          
          positionsCache.current[poolId] = updatedPosition;
          
          updatedTotalValue = currentState.totalValue + amount;
        }
      } else {
        getPools().then(pools => {
          const pool = pools.find(p => p.id === poolId);
          if (pool && pool.contract_address) {
            const estimatedLpAmount = lpAmount || amount * 0.95;
            
            if (amount >= MIN_POSITION_VALUE_USD) {
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
              
              setState(prevState => ({
                ...prevState,
                positions: [...prevState.positions, newPosition],
                totalValue: prevState.totalValue + amount,
                hasPositions: true,
                lastUpdated: Date.now()
              }));
              
              positionsCache.current[poolId] = newPosition;
            } else {
              console.log(`[PortfolioProvider] Not adding position for poolId ${poolId} as value is below minimum threshold`);
            }
          }
        }).catch(err => {
          console.error(`Error creating new position for pool ${poolId}:`, err);
        });
      }
      
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
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = window.setTimeout(() => {
        console.log(`[PortfolioProvider] Clearing optimistic update flag for pool ${poolId}`);
        optimisticUpdatesActive.current.delete(poolId);
        
        if (optimisticUpdatesActive.current.size === 0) {
          console.log(`[PortfolioProvider] All optimistic updates cleared, re-enabling auto-refresh`);
          setTimeout(() => {
            disableAutoRefresh.current = false;
          }, 300000);
        }
        
        refreshTimeoutRef.current = null;
      }, 30000);
      
      return {
        ...currentState,
        positions: updatedPositions,
        totalValue: updatedTotalValue,
        hasPositions: updatedPositions.some(p => p.balance > 0),
        lastUpdated: Date.now()
      };
    });
  }, []);

  useCacheListener(EVENTS.TRANSACTION_COMPLETED, (data) => {
    if (!data || !walletAddress) return;
    
    if (data.transactionId && processedTransactions.current.has(data.transactionId)) {
      console.log('[PortfolioProvider] Skipping already processed transaction:', data.transactionId);
      return;
    }
    
    if (data.transactionId) {
      console.log('[PortfolioProvider] Processing transaction:', data.transactionId);
      processedTransactions.current.add(data.transactionId);
      
      disableAutoRefresh.current = true;
    }
    
    console.log('[PortfolioProvider] Transaction event received:', data);
    
    setState(currentState => {
      const affectedPosition = currentState.positions.find(
        p => p.contractAddress === data.poolContractAddress
      );
      
      if (!affectedPosition) return currentState;
      
      const poolId = affectedPosition.poolId;
      
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
      
      const updatedPositions = currentState.positions.map(p => 
        p.poolId === affectedPosition.poolId ? updatedPosition : p
      );
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = window.setTimeout(() => {
        console.log(`[PortfolioProvider] Clearing optimistic update flag for pool ${poolId}`);
        optimisticUpdatesActive.current.delete(poolId);
        
        if (optimisticUpdatesActive.current.size === 0) {
          console.log(`[PortfolioProvider] All optimistic updates cleared, scheduling re-enabling of auto-refresh`);
          setTimeout(() => {
            disableAutoRefresh.current = false;
          }, 300000);
        }
        
        refreshTimeoutRef.current = null;
      }, 30000);
      
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

export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};


import { useCallback } from 'react';
import { usePortfolio } from '@/contexts/PortfolioContext';

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

// This hook now serves as a compatibility layer that uses the PortfolioContext under the hood
export const useUserPoolPositions = (
  walletAddress: string,
  updateTrigger: number = 0
): UseUserPoolPositionsResult => {
  const { state, refreshPortfolio, updatePositionOptimistically } = usePortfolio();
  
  // Forward the portfolio context data
  const { positions, totalValue, loading, error, hasPositions } = state;
  
  // Call refreshPortfolio when updateTrigger changes
  useCallback(() => {
    if (updateTrigger > 0) {
      console.log('[useUserPoolPositions] Refresh triggered by updateTrigger:', updateTrigger);
      refreshPortfolio(false); // Don't force refresh to avoid overwriting optimistic updates
    }
  }, [updateTrigger, refreshPortfolio]);
  
  // Adapter for the old API
  const updateUserPositionOptimistically = useCallback((
    poolId: number, 
    amount: number, 
    isWithdrawal: boolean = false
  ) => {
    console.log(`[useUserPoolPositions] Optimistically updating pool ${poolId} with amount ${amount}, isWithdrawal: ${isWithdrawal}`);
    updatePositionOptimistically(poolId, amount, isWithdrawal);
  }, [updatePositionOptimistically]);

  return { 
    positions, 
    totalValue, 
    loading, 
    error, 
    hasPositions,
    refreshPositions: () => refreshPortfolio(false), // Don't force refresh by default
    updateUserPositionOptimistically
  };
};

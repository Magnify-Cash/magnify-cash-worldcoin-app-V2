
import { useModalContext } from "@/contexts/ModalContext";
import { Cache } from "@/utils/cacheUtils";
import { UserPositionData } from "@/types/user";
import { LiquidityPool } from "@/types/supabase/liquidity";
import { emitCacheUpdate, EVENTS, TRANSACTION_TYPES } from "@/hooks/useCacheListener";
import { useUserPoolPositions } from "@/hooks/useUserPoolPositions";

export const usePoolModals = () => {
  const { openModal, closeModal, setTransactionPending, setTransactionMessage } = useModalContext();

  // Function to update user position data in cache after a successful supply
  const updateUserPositionCache = (
    poolContractAddress: string | undefined,
    walletAddress: string | undefined,
    supplyAmount: number,
    lpAmount: number
  ) => {
    if (!poolContractAddress || !walletAddress || isNaN(supplyAmount) || isNaN(lpAmount) || supplyAmount <= 0 || lpAmount <= 0) {
      console.error("[usePoolModals] Invalid parameters for updateUserPositionCache:", {
        poolContractAddress,
        walletAddress,
        supplyAmount,
        lpAmount
      });
      return;
    }
    
    console.log("[usePoolModals] Updating user position cache after supply:", {
      poolContractAddress,
      walletAddress,
      supplyAmount,
      lpAmount
    });
    
    // Create a cache key for this specific user position
    const userPositionCacheKey = `user_position_${walletAddress}_${poolContractAddress}`;
    
    // Update the user position in cache with proper type annotation
    Cache.update<UserPositionData>(userPositionCacheKey, (position) => {
      if (!position) {
        // If no position exists yet, create a new one
        const newPosition: UserPositionData = {
          balance: lpAmount,
          currentValue: supplyAmount,
          loading: false,
          error: null
        };
        
        return newPosition;
      }
      
      // Update existing position
      return {
        ...position,
        balance: position.balance + lpAmount,
        currentValue: position.currentValue + supplyAmount,
      };
    }, true); // Mark as user action
    
    // Also update the pool data to reflect the new deposit
    updatePoolCache(poolContractAddress, supplyAmount);
    
    // Emit a clear transaction event with detailed information
    emitCacheUpdate(EVENTS.TRANSACTION_COMPLETED, {
      type: TRANSACTION_TYPES.SUPPLY,
      amount: supplyAmount,
      lpAmount: lpAmount,
      poolContractAddress: poolContractAddress,
      timestamp: Date.now(),
      action: 'deposit',
      isUserAction: true
    });
  };
  
  // Function to update user position data in cache after a successful withdrawal
  const updateUserPositionCacheAfterWithdraw = (
    poolContractAddress: string | undefined,
    walletAddress: string | undefined,
    withdrawAmount: number,
    lpAmount: number
  ) => {
    if (!poolContractAddress || !walletAddress || isNaN(withdrawAmount) || isNaN(lpAmount) || withdrawAmount <= 0 || lpAmount <= 0) {
      console.error("[usePoolModals] Invalid parameters for updateUserPositionCacheAfterWithdraw:", {
        poolContractAddress,
        walletAddress,
        withdrawAmount,
        lpAmount
      });
      return;
    }
    
    console.log("[usePoolModals] Updating user position cache after withdrawal:", {
      poolContractAddress,
      walletAddress,
      withdrawAmount,
      lpAmount
    });
    
    // Create a cache key for this specific user position
    const userPositionCacheKey = `user_position_${walletAddress}_${poolContractAddress}`;
    
    // Update the user position in cache with proper type annotation
    Cache.update<UserPositionData>(userPositionCacheKey, (position) => {
      if (!position) return position; // Should not happen in withdrawal case
      
      // Update existing position
      return {
        ...position,
        balance: Math.max(0, position.balance - lpAmount),
        currentValue: Math.max(0, position.currentValue - withdrawAmount),
      };
    }, true); // Mark as user action
    
    // Also update the pool data to reflect the withdrawal
    updatePoolCache(poolContractAddress, -withdrawAmount);
    
    // Emit a clear transaction event with detailed information
    emitCacheUpdate(EVENTS.TRANSACTION_COMPLETED, {
      type: TRANSACTION_TYPES.WITHDRAW,
      amount: withdrawAmount,
      lpAmount: lpAmount,
      poolContractAddress: poolContractAddress,
      timestamp: Date.now(),
      action: 'withdrawal',
      isUserAction: true
    });
  };
  
  // Function to update pool data in cache after a successful supply
  const updatePoolCache = (
    poolContractAddress: string,
    supplyAmount: number
  ) => {
    if (!poolContractAddress || isNaN(supplyAmount) || supplyAmount === 0) {
      console.error("[usePoolModals] Invalid parameters for updatePoolCache:", {
        poolContractAddress,
        supplyAmount
      });
      return;
    }
    
    const poolContractCacheKey = `pool_data_contract_${poolContractAddress}`;
    
    Cache.update<LiquidityPool>(poolContractCacheKey, (pool) => {
      if (!pool) return pool;
      
      const updatedPool = {
        ...pool,
        total_value_locked: pool.total_value_locked + supplyAmount,
        available_liquidity: pool.available_liquidity + supplyAmount,
      };
      
      // Emit event to notify components that pool data has changed
      emitCacheUpdate(EVENTS.POOL_DATA_UPDATED, {
        key: poolContractCacheKey,
        value: updatedPool,
        action: 'update',
        supplyAmount,
        transactionType: supplyAmount > 0 ? 'supply' : 'withdraw',
        isUserAction: true
      });
      
      return updatedPool;
    }, true); // Mark as user action
    
    // Also update the pool in the all pools cache
    const allPoolsCacheKey = 'pool_data_all';
    Cache.update<LiquidityPool[]>(allPoolsCacheKey, (pools) => {
      if (!Array.isArray(pools)) return pools;
      
      const updatedPools = pools.map(pool => {
        if (pool.contract_address === poolContractAddress) {
          return {
            ...pool,
            total_value_locked: pool.total_value_locked + supplyAmount,
            available_liquidity: pool.available_liquidity + supplyAmount,
          };
        }
        return pool;
      });
      
      // Emit event for the all pools cache update
      emitCacheUpdate(EVENTS.POOL_DATA_UPDATED, {
        key: allPoolsCacheKey,
        value: updatedPools,
        action: 'update',
        supplyAmount,
        transactionType: supplyAmount > 0 ? 'supply' : 'withdraw',
        isUserAction: true
      });
      
      return updatedPools;
    }, true); // Mark as user action
  };

  const openSupplyModal = (params: {
    poolId?: number;
    poolContractAddress?: string;
    lpSymbol?: string;
    onSuccessfulSupply?: (amount: number, lpAmount: number) => void;
    refreshPositions?: () => void;
    updateUserPositionOptimistically?: (poolId: number, amount: number) => void;
  }) => {
    const wrappedOnSuccessfulSupply = (amount: number, lpAmount: number) => {
      // Clear the transaction pending state
      setTransactionPending(false);
      setTransactionMessage(undefined);
      
      const walletAddress = localStorage.getItem("ls_wallet_address");
  
      // Optimistically update the user's position
      if (params.poolId && params.updateUserPositionOptimistically) {
        params.updateUserPositionOptimistically(params.poolId, amount);
      }
  
      // Update the user position cache
      updateUserPositionCache(
        params.poolContractAddress,
        walletAddress || undefined,
        amount,
        lpAmount
      );
  
      // Call the original callback if provided
      if (params.onSuccessfulSupply) {
        params.onSuccessfulSupply(amount, lpAmount);
      }
  
      // Trigger refreshPositions to fetch updated data
      if (params.refreshPositions) {
        params.refreshPositions();
      }
    };
  
    openModal("supply", {
      ...params,
      onSuccessfulSupply: wrappedOnSuccessfulSupply,
    });
  };

  const openWithdrawModal = (params: {
    poolId?: number;
    lpBalance?: number;
    lpValue?: number;
    poolContractAddress?: string;
    onSuccessfulWithdraw?: (amount: number, lpAmount: number) => void;
  }) => {
    // Wrap to handle cache updates on successful withdrawal
    const wrappedOnSuccessfulWithdraw = (amount: number, lpAmount: number) => {
      // Clear the transaction pending state
      setTransactionPending(false);
      setTransactionMessage(undefined);
      
      const walletAddress = localStorage.getItem("ls_wallet_address");
      
      // Update the user position cache for withdrawal
      updateUserPositionCacheAfterWithdraw(
        params.poolContractAddress,
        walletAddress || undefined,
        amount,
        lpAmount
      );
      
      // Call the original callback if provided
      if (params.onSuccessfulWithdraw) {
        params.onSuccessfulWithdraw(amount, lpAmount);
      }
    };
    
    openModal("withdraw", {
      ...params,
      onSuccessfulWithdraw: wrappedOnSuccessfulWithdraw
    });
  };

  return {
    openSupplyModal,
    openWithdrawModal,
    closeModal,
    setTransactionPending,
    setTransactionMessage,
  };
};

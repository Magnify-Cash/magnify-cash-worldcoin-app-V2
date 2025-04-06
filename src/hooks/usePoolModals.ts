
import { useModalContext } from "@/contexts/ModalContext";
import { Cache } from "@/utils/cacheUtils";
import { UserPositionData } from "@/types/user";
import { LiquidityPool } from "@/types/supabase/liquidity";
import { emitCacheUpdate, EVENTS } from "@/hooks/useCacheListener";

export const usePoolModals = () => {
  const { openModal, closeModal } = useModalContext();

  // Function to update user position data in cache after a successful supply
  const updateUserPositionCache = (
    poolContractAddress: string | undefined,
    walletAddress: string | undefined,
    supplyAmount: number,
    lpAmount: number
  ) => {
    if (!poolContractAddress || !walletAddress) return;
    
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
    });
    
    // Also update the pool data to reflect the new deposit
    updatePoolCache(poolContractAddress, supplyAmount);
  };
  
  // Function to update pool data in cache after a successful supply
  const updatePoolCache = (
    poolContractAddress: string,
    supplyAmount: number
  ) => {
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
        supplyAmount
      });
      
      return updatedPool;
    });
    
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
        supplyAmount
      });
      
      return updatedPools;
    });
  };

  const openSupplyModal = (params: {
    poolId?: number;
    poolContractAddress?: string;
    lpSymbol?: string;
    onSuccessfulSupply?: (amount: number) => void;
  }) => {
    // We'll wrap the provided onSuccessfulSupply callback to also update our caches
    const wrappedOnSuccessfulSupply = (amount: number) => {
      // Get approximate LP amount (could be refined with actual value)
      const approximateLpAmount = amount * 0.95; // Simple approximation
      const walletAddress = localStorage.getItem("ls_wallet_address");
      
      // Update the user position cache
      updateUserPositionCache(
        params.poolContractAddress, 
        walletAddress || undefined, 
        amount, 
        approximateLpAmount
      );
      
      // Emit a transaction completed event
      emitCacheUpdate(EVENTS.TRANSACTION_COMPLETED, {
        type: 'supply',
        amount: amount,
        lpAmount: approximateLpAmount,
        poolContractAddress: params.poolContractAddress,
        timestamp: Date.now()
      });
      
      // Call the original callback if provided
      if (params.onSuccessfulSupply) {
        params.onSuccessfulSupply(amount);
      }
    };
    
    openModal("supply", {
      ...params,
      onSuccessfulSupply: wrappedOnSuccessfulSupply
    });
  };

  const openWithdrawModal = (params: {
    poolId?: number;
    lpBalance?: number;
    lpValue?: number;
    poolContractAddress?: string;
  }) => {
    openModal("withdraw", params);
  };

  return {
    openSupplyModal,
    openWithdrawModal,
    closeModal,
  };
};

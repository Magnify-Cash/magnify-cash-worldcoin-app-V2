
import { useModalContext } from "@/contexts/ModalContext";
import { Cache } from "@/utils/cacheUtils";

// Define the UserPositionData type for typesafety
interface UserPositionData {
  balance: number;
  depositedValue: number;
  currentValue: number;
  yield: number;
  yieldPercentage: number;
  loading: boolean;
  error: string | null;
}

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
    
    // Create a cache key for this specific user position
    const userPositionCacheKey = `user_position_${walletAddress}_${poolContractAddress}`;
    
    // Update the user position in cache
    Cache.update<UserPositionData>(userPositionCacheKey, (position) => {
      if (!position) {
        // If no position exists yet, create a new one
        return {
          balance: lpAmount,
          depositedValue: supplyAmount,
          currentValue: supplyAmount, // Initially current value equals deposited value
          yield: 0,
          yieldPercentage: 0,
          loading: false,
          error: null
        };
      }
      
      // Update existing position
      return {
        ...position,
        balance: position.balance + lpAmount,
        depositedValue: position.depositedValue + supplyAmount,
        currentValue: position.currentValue + supplyAmount,
        // Recalculate yield metrics
        yield: (position.currentValue + supplyAmount) - (position.depositedValue + supplyAmount),
        yieldPercentage: ((position.currentValue + supplyAmount) - (position.depositedValue + supplyAmount)) / 
                         (position.depositedValue + supplyAmount) * 100
      };
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
      // First update the cache with approximate LP amount (could be refined with actual value)
      const approximateLpAmount = amount * 0.95; // Simple approximation
      const walletAddress = localStorage.getItem("ls_wallet_address");
      
      // Update the user position cache
      updateUserPositionCache(params.poolContractAddress, walletAddress || undefined, amount, approximateLpAmount);
      
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

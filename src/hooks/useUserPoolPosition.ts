
import { useState, useEffect, useCallback } from 'react';
import { getUserLPBalance, previewRedeem } from '@/lib/backendRequests';
import { toast } from '@/components/ui/use-toast';
import { Cache } from '@/utils/cacheUtils';
import { useCacheListener, EVENTS } from './useCacheListener';
import { UserPositionData } from '@/types/user';

const initialState: UserPositionData = {
  balance: 0,
  currentValue: 0,
  loading: true,
  error: null
};

export const useUserPoolPosition = (
  poolContractAddress: string | undefined,
  refreshTrigger: number = 0
): UserPositionData => {
  const [positionData, setPositionData] = useState<UserPositionData>(initialState);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
  // Get wallet address from localStorage
  useEffect(() => {
    const wallet = localStorage.getItem("ls_wallet_address");
    setWalletAddress(wallet);
  }, []);

  const fetchPositionData = useCallback(async (
    poolAddress: string,
    userWallet: string,
    cacheKey: string
  ) => {
    try {
      console.log(`[useUserPoolPosition] Fetching fresh position data for ${poolAddress}`);
      const { balance } = await getUserLPBalance(userWallet, poolAddress);

      let currentValue = 0;
      if (balance > 0) {
        const { usdcAmount } = await previewRedeem(balance, poolAddress);
        currentValue = usdcAmount;
      }

      const newPositionData = {
        balance,
        currentValue,
        loading: false,
        error: null
      };

      setPositionData(newPositionData);
      Cache.set(cacheKey, newPositionData, 5);
    } catch (error) {
      console.error('Error fetching user position data:', error);
      setPositionData({
        ...initialState,
        loading: false,
        error: 'Failed to load your position data'
      });

      toast({
        title: "Error",
        description: "Failed to load your position data. Please try again later.",
        variant: "destructive",
      });
    }
  }, []);

  // Listen for relevant transaction events with improved logging
  useCacheListener(EVENTS.TRANSACTION_COMPLETED, (data) => {
    if (data?.poolContractAddress === poolContractAddress && walletAddress && data.isUserAction) {
      // Only process if it's a user-initiated supply or withdraw transaction 
      if ((data.type === 'supply' || data.type === 'withdraw') && data.amount) {
        console.log("[useUserPoolPosition] Received user transaction event, refreshing position data:", data);
        const cacheKey = `user_position_${walletAddress}_${poolContractAddress}`;
        
        // For immediate UI feedback, create an optimistic update
        if (data.type === 'supply' && data.amount) {
          Cache.update<UserPositionData>(cacheKey, (current) => {
            if (!current) {
              // If no position exists yet, create a new one
              return {
                balance: data.lpAmount || data.amount * 0.95,
                currentValue: data.amount,
                loading: false,
                error: null
              };
            }
            
            // Use actual LP amount if available
            const lpIncrease = data.lpAmount || data.amount * 0.95; 
            const newBalance = current.balance + lpIncrease;
            const newValue = current.currentValue + data.amount;
            
            console.log("[useUserPoolPosition] Optimistically updating position for supply:", { 
              oldBalance: current.balance,
              newBalance,
              oldValue: current.currentValue,
              newValue,
              actualLpAmount: data.lpAmount
            });
            
            return {
              ...current,
              balance: newBalance,
              currentValue: newValue
            };
          });
        } else if (data.type === 'withdraw' && data.amount) {
          Cache.update<UserPositionData>(cacheKey, (current) => {
            if (!current) return current;
            
            // Use provided LP amount or approximate it
            const lpAmount = data.lpAmount || data.amount * 0.95;
            const newBalance = Math.max(0, current.balance - lpAmount);
            const newValue = Math.max(0, current.currentValue - data.amount);
            
            console.log("[useUserPoolPosition] Optimistically updating position for withdraw:", { 
              oldBalance: current.balance,
              newBalance,
              oldValue: current.currentValue,
              newValue
            });
            
            return {
              ...current,
              balance: newBalance,
              currentValue: newValue
            };
          });
        }
        
        // Get latest data after a short delay to allow blockchain to update
        setTimeout(() => {
          fetchPositionData(poolContractAddress, walletAddress, cacheKey);
        }, 1000); // Slightly longer delay for blockchain confirmation
      }
    }
  });

  // Listen for user position cache updates with improved logging
  useCacheListener(EVENTS.USER_POSITION_UPDATED, (data) => {
    if (walletAddress && poolContractAddress && 
        data.key === `user_position_${walletAddress}_${poolContractAddress}` &&
        data.isUserAction) {
      // Only log and update if there's an actual change in the position data
      if (data.value && 
          (data.value.balance !== positionData.balance || 
           data.value.currentValue !== positionData.currentValue)) {
        console.log("[useUserPoolPosition] Received user position cache update:", data);
        setPositionData(data.value);
      }
    }
  });

  useEffect(() => {
    const fetchUserPosition = async () => {
      if (!poolContractAddress || !walletAddress) {
        setPositionData({ ...initialState, loading: false });
        return;
      }

      const cacheKey = `user_position_${walletAddress}_${poolContractAddress}`;
      
      const cachedPosition = Cache.get<UserPositionData>(cacheKey);
      if (cachedPosition) {
        console.log(`[useUserPoolPosition] Using cached position data for ${poolContractAddress}`);
        setPositionData(cachedPosition);

        // Only refresh in background if this wasn't triggered by a user action (refreshTrigger)
        // This avoids double-fetching when a transaction just occurred
        if (refreshTrigger === 0) {
          setTimeout(() => {
            fetchPositionData(poolContractAddress, walletAddress, cacheKey);
          }, 300);
        }
        return;
      }

      fetchPositionData(poolContractAddress, walletAddress, cacheKey);
    };

    fetchUserPosition();
  }, [poolContractAddress, walletAddress, refreshTrigger, fetchPositionData]);

  return positionData;
};

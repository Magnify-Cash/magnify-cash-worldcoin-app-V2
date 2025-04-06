
import { useState, useEffect, useCallback } from 'react';
import { getUserLPBalance, previewRedeem } from '@/lib/backendRequests';
import { toast } from '@/components/ui/use-toast';
import { Cache } from '@/utils/cacheUtils';
import { useCacheListener, EVENTS } from './useCacheListener';

interface UserPositionData {
  balance: number;
  currentValue: number;
  loading: boolean;
  error: string | null;
}

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

  // Listen for relevant transaction events
  useCacheListener(EVENTS.TRANSACTION_COMPLETED, (data) => {
    if (data.poolContractAddress === poolContractAddress && walletAddress) {
      console.log("[useUserPoolPosition] Received transaction event, refreshing position data");
      const cacheKey = `user_position_${walletAddress}_${poolContractAddress}`;
      fetchPositionData(poolContractAddress, walletAddress, cacheKey);
    }
  });

  // Listen for user position cache updates
  useCacheListener(EVENTS.USER_POSITION_UPDATED, (data) => {
    if (walletAddress && poolContractAddress && 
        data.key === `user_position_${walletAddress}_${poolContractAddress}`) {
      console.log("[useUserPoolPosition] Received position cache update");
      if (data.value) {
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

        // Refresh in background
        setTimeout(() => {
          fetchPositionData(poolContractAddress, walletAddress, cacheKey);
        }, 300);
        return;
      }

      fetchPositionData(poolContractAddress, walletAddress, cacheKey);
    };

    fetchUserPosition();
  }, [poolContractAddress, walletAddress, refreshTrigger, fetchPositionData]);

  return positionData;
};

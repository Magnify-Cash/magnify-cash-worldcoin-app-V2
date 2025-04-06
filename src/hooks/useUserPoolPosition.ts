
import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserLPBalance, previewRedeem } from '@/lib/backendRequests';
import { toast } from '@/components/ui/use-toast';
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
  const processedTransactions = useRef<Set<string>>(new Set());
  const lastFetchTimeRef = useRef<number>(0);
  const optimisticUpdatesRef = useRef<{
    pending: boolean;
    data: UserPositionData | null;
    timestamp: number;
    transactionId: string | null;
  }>({
    pending: false,
    data: null,
    timestamp: 0,
    transactionId: null
  });
  
  // Get wallet address from localStorage
  useEffect(() => {
    const wallet = localStorage.getItem("ls_wallet_address");
    setWalletAddress(wallet);
  }, []);

  const fetchPositionData = useCallback(async (
    poolAddress: string,
    userWallet: string,
    force: boolean = false
  ) => {
    try {
      console.log(`[useUserPoolPosition] Fetching position data for ${poolAddress}`);
      
      // Set a timestamp for this fetch to prevent race conditions
      const fetchTimestamp = Date.now();
      lastFetchTimeRef.current = fetchTimestamp;
      
      // Skip if there's a pending optimistic update and we're not forcing
      if (!force && optimisticUpdatesRef.current.pending && 
          optimisticUpdatesRef.current.timestamp > lastFetchTimeRef.current - 10000) {
        console.log("[useUserPoolPosition] Skipping fetch as there's a recent optimistic update");
        return;
      }
      
      const { balance } = await getUserLPBalance(userWallet, poolAddress);

      let currentValue = 0;
      if (balance > 0) {
        const { usdcAmount } = await previewRedeem(balance, poolAddress);
        currentValue = usdcAmount;
      }

      // Don't update if this is an older fetch than an optimistic update
      if (optimisticUpdatesRef.current.pending && 
          optimisticUpdatesRef.current.timestamp > fetchTimestamp && 
          !force) {
        console.log("[useUserPoolPosition] Not applying fetch results because there's a newer optimistic update");
        return;
      }
      
      const newPositionData = {
        balance,
        currentValue,
        loading: false,
        error: null
      };

      console.log("[useUserPoolPosition] Updated position with fresh data:", newPositionData);
      setPositionData(newPositionData);
      
      // Clear optimistic flag only if this data is newer than the optimistic update
      // or if we're forcing a refresh
      if (force || !optimisticUpdatesRef.current.pending || 
          fetchTimestamp > optimisticUpdatesRef.current.timestamp) {
        optimisticUpdatesRef.current.pending = false;
      }
    } catch (error) {
      console.error('Error fetching user position data:', error);
      
      // Only update error state if there's no pending optimistic update
      if (!optimisticUpdatesRef.current.pending) {
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
    }
  }, []);

  // Listen for relevant transaction events with improved logging
  useCacheListener(EVENTS.TRANSACTION_COMPLETED, (data) => {
    // Skip if no relevant data or not for this pool
    if (!data || !poolContractAddress || data?.poolContractAddress !== poolContractAddress || !walletAddress) {
      return;
    }
    
    // Skip if we've already processed this transaction
    if (data.transactionId && processedTransactions.current.has(data.transactionId)) {
      console.log("[useUserPoolPosition] Skipping already processed transaction:", data.transactionId);
      return;
    }
    
    // Add to processed transactions if it has an ID
    if (data.transactionId) {
      console.log("[useUserPoolPosition] Processing transaction:", data.transactionId);
      processedTransactions.current.add(data.transactionId);
    }
    
    // Only process if it's a user-initiated supply or withdraw transaction 
    if ((data.type === 'supply' || data.type === 'withdraw') && data.amount && data.isUserAction) {
      console.log("[useUserPoolPosition] Received user transaction event, optimistically updating position data:", data);
      
      // Mark that we have a pending optimistic update
      const updateTimestamp = Date.now();
      optimisticUpdatesRef.current = {
        pending: true,
        data: null,
        timestamp: updateTimestamp,
        transactionId: data.transactionId || null
      };
      
      // For immediate UI feedback, create an optimistic update
      if (data.type === 'supply' && data.amount) {
        setPositionData(current => {
          if (!current) {
            // If no position exists yet, create a new one
            const newPosition = {
              balance: data.lpAmount || data.amount * 0.95,
              currentValue: data.amount,
              loading: false,
              error: null
            };
            
            optimisticUpdatesRef.current.data = newPosition;
            return newPosition;
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
          
          const updatedPosition = {
            ...current,
            balance: newBalance,
            currentValue: newValue
          };
          
          optimisticUpdatesRef.current.data = updatedPosition;
          return updatedPosition;
        });
      } else if (data.type === 'withdraw' && data.amount) {
        setPositionData(current => {
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
          
          const updatedPosition = {
            ...current,
            balance: newBalance,
            currentValue: newValue
          };
          
          optimisticUpdatesRef.current.data = updatedPosition;
          return updatedPosition;
        });
      }
      
      // The key change: We no longer automatically fetch real data after 
      // an optimistic update. This prevents overwriting our optimistic data.
    }
  });

  useEffect(() => {
    const fetchUserPosition = async () => {
      if (!poolContractAddress || !walletAddress) {
        setPositionData({ ...initialState, loading: false });
        return;
      }

      // Check if we have a recent optimistic update (less than 10 seconds old)
      if (optimisticUpdatesRef.current.pending && 
          Date.now() - optimisticUpdatesRef.current.timestamp < 10000) {
        console.log("[useUserPoolPosition] Skipping fetch as there's a recent optimistic update");
        return;
      }

      // Only fetch fresh data if triggered with refreshTrigger > 0 or no optimistic update
      if (refreshTrigger > 0) {
        setPositionData(prev => ({ ...prev, loading: true }));
        fetchPositionData(poolContractAddress, walletAddress, true); // Force refresh
      } else if (!optimisticUpdatesRef.current.pending) {
        setPositionData(prev => ({ ...prev, loading: true }));
        fetchPositionData(poolContractAddress, walletAddress);
      }
    };

    fetchUserPosition();
  }, [poolContractAddress, walletAddress, refreshTrigger, fetchPositionData]);

  return positionData;
};

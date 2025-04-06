
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
  }>({
    pending: false,
    data: null,
    timestamp: 0
  });
  
  // Get wallet address from localStorage
  useEffect(() => {
    const wallet = localStorage.getItem("ls_wallet_address");
    setWalletAddress(wallet);
  }, []);

  const fetchPositionData = useCallback(async (
    poolAddress: string,
    userWallet: string
  ) => {
    try {
      console.log(`[useUserPoolPosition] Fetching fresh position data for ${poolAddress}`);
      
      // Set a timestamp for this fetch to prevent race conditions
      const fetchTimestamp = Date.now();
      lastFetchTimeRef.current = fetchTimestamp;
      
      const { balance } = await getUserLPBalance(userWallet, poolAddress);

      let currentValue = 0;
      if (balance > 0) {
        const { usdcAmount } = await previewRedeem(balance, poolAddress);
        currentValue = usdcAmount;
      }

      // Only update if this is still the latest fetch or if there's no pending optimistic update
      if (fetchTimestamp >= lastFetchTimeRef.current) {
        // If there's a more recent optimistic update, don't overwrite it
        if (optimisticUpdatesRef.current.pending && 
            optimisticUpdatesRef.current.timestamp > fetchTimestamp) {
          console.log("[useUserPoolPosition] Skipping update as there's a more recent optimistic update");
          return;
        }
        
        const newPositionData = {
          balance,
          currentValue,
          loading: false,
          error: null
        };

        setPositionData(newPositionData);
        console.log("[useUserPoolPosition] Updated position with fresh data:", newPositionData);
      } else {
        console.log("[useUserPoolPosition] Ignoring outdated fetch result");
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
        timestamp: updateTimestamp
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
      
      // After the optimistic update is applied, we can fetch the real data
      // but we'll do it with a longer delay to avoid race conditions
      setTimeout(() => {
        // Only fetch if this is still the most recent update
        if (optimisticUpdatesRef.current.timestamp === updateTimestamp) {
          optimisticUpdatesRef.current.pending = false;
          if (poolContractAddress && walletAddress) {
            console.log("[useUserPoolPosition] Fetching actual data after optimistic update");
            fetchPositionData(poolContractAddress, walletAddress);
          }
        }
      }, 3000); // Wait longer before fetching real data
    }
  });

  useEffect(() => {
    const fetchUserPosition = async () => {
      if (!poolContractAddress || !walletAddress) {
        setPositionData({ ...initialState, loading: false });
        return;
      }

      // If we have a pending optimistic update, don't overwrite it
      if (optimisticUpdatesRef.current.pending) {
        console.log("[useUserPoolPosition] Skipping fetch as there's a pending optimistic update");
        return;
      }

      // Always fetch fresh data
      setPositionData(prev => ({ ...prev, loading: true }));
      fetchPositionData(poolContractAddress, walletAddress);
    };

    fetchUserPosition();
  }, [poolContractAddress, walletAddress, refreshTrigger, fetchPositionData]);

  return positionData;
};


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
      console.log("[useUserPoolPosition] Received user transaction event, refreshing position data:", data);
      
      // For immediate UI feedback, create an optimistic update
      if (data.type === 'supply' && data.amount) {
        setPositionData(current => {
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
          
          return {
            ...current,
            balance: newBalance,
            currentValue: newValue
          };
        });
      }
      
      // Get latest data after a short delay to allow blockchain to update
      setTimeout(() => {
        if (poolContractAddress && walletAddress) {
          fetchPositionData(poolContractAddress, walletAddress);
        }
      }, 1000); // Slightly longer delay for blockchain confirmation
    }
  });

  useEffect(() => {
    const fetchUserPosition = async () => {
      if (!poolContractAddress || !walletAddress) {
        setPositionData({ ...initialState, loading: false });
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

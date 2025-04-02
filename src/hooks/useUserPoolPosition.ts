
import { useState, useEffect } from 'react';
import { getUserLPBalance, previewRedeem } from '@/lib/backendRequests';
import { toast } from '@/components/ui/use-toast';

// Mock API for deposited value (as requested)
const getMockDepositedValue = async (): Promise<number> => {
  // Simulate network call
  await new Promise(resolve => setTimeout(resolve, 100));
  return 1200;
};

interface UserPositionData {
  balance: number;
  depositedValue: number;
  currentValue: number;
  yield: number;
  yieldPercentage: number;
  loading: boolean;
  error: string | null;
}

const initialState: UserPositionData = {
  balance: 0,
  depositedValue: 0,
  currentValue: 0,
  yield: 0,
  yieldPercentage: 0,
  loading: true,
  error: null
};

export const useUserPoolPosition = (poolContractAddress: string | undefined): UserPositionData => {
  const [positionData, setPositionData] = useState<UserPositionData>(initialState);

  useEffect(() => {
    const fetchUserPosition = async () => {
      if (!poolContractAddress) {
        setPositionData({ ...initialState, loading: false });
        return;
      }

      try {
        // Make all API calls in parallel for optimization
        // TODO: Change the demo-wallet to the actual wallet address of the user
        const [lpBalanceResponse, depositedValueResponse] = await Promise.all([
          getUserLPBalance('0x6835939032900e5756abFF28903d8A5E68CB39dF', poolContractAddress),
          getMockDepositedValue()
        ]);

        const balance = lpBalanceResponse.balance;
        const depositedValue = depositedValueResponse;

        // If user has a balance, get the current value via previewRedeem
        let currentValue = 0;
        if (balance > 0) {
          const redeemPreview = await previewRedeem(balance.toString(), poolContractAddress);
          // Convert string to number for computation
          currentValue = parseFloat(redeemPreview.usdcAmount);
        }

        // Calculate yield metrics
        const yieldValue = currentValue - depositedValue;
        const yieldPercentage = depositedValue > 0 ? (yieldValue / depositedValue) * 100 : 0;

        setPositionData({
          balance,
          depositedValue,
          currentValue,
          yield: yieldValue,
          yieldPercentage,
          loading: false,
          error: null
        });
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
    };

    fetchUserPosition();
  }, [poolContractAddress]);

  return positionData;
};

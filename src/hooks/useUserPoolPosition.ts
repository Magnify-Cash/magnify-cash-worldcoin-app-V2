
import { useState, useCallback, useEffect } from 'react';
import { getUserPoolPosition, previewRedeem } from '@/lib/backendRequests';
import { ethers } from 'ethers';

interface UseUserPoolPositionResult {
  balance: number;
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage a user's position in a specific pool
 */
export function useUserPoolPosition(
  poolContractAddress: string,
  userAddress: string
): UseUserPoolPositionResult {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchPosition = useCallback(async () => {
    if (!poolContractAddress || !userAddress) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Call API to get user's position in this specific pool
      const response = await getUserPoolPosition(poolContractAddress, userAddress);

      if (!response || response.error) {
        throw new Error(response?.error || 'Failed to fetch pool position');
      }

      // Parse the balance as a number to ensure type safety
      const parsedBalance = parseFloat(response.balance);
      
      if (isNaN(parsedBalance)) {
        throw new Error('Invalid balance received from API');
      }
      
      setBalance(parsedBalance);

      // Get estimated redemption value if needed
      if (parsedBalance > 0) {
        try {
          // Convert balance to string for the API call
          const balanceAsString = parsedBalance.toString();
          const redeemPreview = await previewRedeem(poolContractAddress, balanceAsString);
          console.log('Redeem preview:', redeemPreview);
          // Additional processing if needed
        } catch (redeemError) {
          console.error('Error previewing redemption:', redeemError);
          // Don't fail the whole request if just the preview fails
        }
      }
    } catch (err) {
      console.error('Error fetching pool position:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [poolContractAddress, userAddress]);

  // Initial fetch
  useEffect(() => {
    fetchPosition();
  }, [fetchPosition]);

  return {
    balance,
    loading,
    error,
    refetch: fetchPosition,
  };
}

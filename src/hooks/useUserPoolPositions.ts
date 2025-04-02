
import { useState, useEffect, useCallback } from 'react';
import { getUserPoolPositions, previewRedeem } from '@/lib/backendRequests';
import { ethers } from 'ethers';

export interface PoolPosition {
  poolId: number;
  contractAddress: string;
  name: string;
  symbol: string;
  balance: number;
  balanceUsd: number;
  apy: number;
  redeemableAmount?: number; // Optional preview of what user can redeem
}

interface UseUserPoolPositionsResult {
  positions: PoolPosition[];
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
  totalInvested: number;
}

/**
 * Custom hook to fetch and manage a user's positions across all pools
 */
export function useUserPoolPositions(
  userAddress: string
): UseUserPoolPositionsResult {
  const [positions, setPositions] = useState<PoolPosition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [totalInvested, setTotalInvested] = useState<number>(0);

  const fetchPositions = useCallback(async () => {
    if (!userAddress) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Call API to get all user's positions
      const response = await getUserPoolPositions(userAddress);

      if (!response || response.error) {
        throw new Error(response?.error || 'Failed to fetch pool positions');
      }

      const positionsWithRedeemValues = await Promise.all(
        response.positions.map(async (position) => {
          if (position.balance > 0) {
            try {
              // Convert balance to string for the API call
              const balanceAsString = position.balance.toString();
              const redeemPreview = await previewRedeem(position.contractAddress, balanceAsString);
              
              return {
                ...position,
                redeemableAmount: redeemPreview ? parseFloat(redeemPreview.amount) : undefined,
              };
            } catch (err) {
              console.error(`Failed to get redeem preview for ${position.symbol}:`, err);
              return position;
            }
          }
          return position;
        })
      );

      setPositions(positionsWithRedeemValues);
      
      // Calculate total value of all positions
      const total = positionsWithRedeemValues.reduce(
        (sum, position) => sum + position.balanceUsd, 
        0
      );
      setTotalInvested(total);
    } catch (err) {
      console.error('Error fetching pool positions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setPositions([]);
      setTotalInvested(0);
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  // Initial fetch
  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  return {
    positions,
    loading,
    error,
    refetch: fetchPositions,
    totalInvested,
  };
}

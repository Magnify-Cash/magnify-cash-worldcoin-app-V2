
import { useState, useCallback, useEffect } from 'react';
import { getUserPoolPosition, getUserPoolPositions, previewRedeem } from '@/lib/backendRequests';

export interface UserPosition {
  poolId: number;
  contractAddress: string;
  name: string;
  symbol: string;
  balance: number;
  depositedValue: number;
  currentValue: number;
  earnings: number;
  status: 'warm-up' | 'active' | 'cooldown' | 'withdrawal';
  poolName?: string;
  yieldPercentage?: number;
}

interface UseUserPositionsOptions {
  fetchOnMount?: boolean;
}

interface UseUserPositionsResult {
  positions: UserPosition[];
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
  totalInvested: number;
  hasPositions: boolean;
}

/**
 * Custom hook to fetch and manage user positions in liquidity pools
 * Can fetch a single position or all positions based on the parameters provided
 */
export function useUserPositions(
  userAddress: string,
  poolContractAddress?: string,
  options: UseUserPositionsOptions = { fetchOnMount: true }
): UseUserPositionsResult {
  const [positions, setPositions] = useState<UserPosition[]>([]);
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

      // If poolContractAddress is provided, fetch a single position
      if (poolContractAddress) {
        const response = await getUserPoolPosition(poolContractAddress, userAddress);

        if (!response || response.error) {
          throw new Error(response?.error || 'Failed to fetch pool position');
        }

        // Get pool details to enrich position data
        const parsedBalance = parseFloat(response.balance);
        const estimatedValue = parsedBalance * 1.1; // This should come from API
        const depositValue = parsedBalance; // This should come from API
        const earnings = estimatedValue - depositValue;
        
        const position: UserPosition = {
          poolId: response.poolId || 1,
          contractAddress: poolContractAddress,
          name: response.name || 'Unknown Pool',
          symbol: response.symbol || 'LP',
          balance: parsedBalance,
          depositedValue: depositValue,
          currentValue: estimatedValue,
          earnings: earnings,
          status: response.status || 'active',
          yieldPercentage: (earnings / depositValue) * 100
        };

        setPositions([position]);
        setTotalInvested(estimatedValue);
      } else {
        // Fetch all positions
        const response = await getUserPoolPositions(userAddress);

        if (!response || response.error) {
          throw new Error(response?.error || 'Failed to fetch pool positions');
        }

        const enrichedPositions = response.positions.map(position => {
          const earnings = position.balanceUsd - (position.originalValueUsd || position.balanceUsd);
          return {
            poolId: position.poolId,
            contractAddress: position.contractAddress,
            name: position.name,
            symbol: position.symbol,
            balance: position.balance,
            depositedValue: position.originalValueUsd || position.balanceUsd,
            currentValue: position.balanceUsd,
            earnings: earnings,
            status: position.status || 'active',
            poolName: position.name,
            yieldPercentage: position.originalValueUsd ? (earnings / position.originalValueUsd) * 100 : 0
          };
        });

        setPositions(enrichedPositions);
        
        // Calculate total value
        const total = enrichedPositions.reduce(
          (sum, position) => sum + position.currentValue, 
          0
        );
        setTotalInvested(total);
      }
    } catch (err) {
      console.error('Error fetching positions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setPositions([]);
      setTotalInvested(0);
    } finally {
      setLoading(false);
    }
  }, [userAddress, poolContractAddress]);

  // Initial fetch if fetchOnMount is true
  useEffect(() => {
    if (options.fetchOnMount) {
      fetchPositions();
    }
  }, [fetchPositions, options.fetchOnMount]);

  return {
    positions,
    loading,
    error,
    refetch: fetchPositions,
    totalInvested,
    hasPositions: positions.length > 0,
  };
}

/**
 * Helper hook specifically for a single pool position
 * This is a convenience wrapper around useUserPositions
 */
export function useUserPoolPosition(
  poolContractAddress: string,
  userAddress: string = "0x6835939032900e5756abFF28903d8A5E68CB39dF"
) {
  const {
    positions,
    loading,
    error,
    refetch,
    totalInvested
  } = useUserPositions(userAddress, poolContractAddress);

  // Get the first (and only) position
  const position = positions[0] || {
    poolId: 0,
    contractAddress: poolContractAddress,
    name: '',
    symbol: 'LP',
    balance: 0,
    depositedValue: 0,
    currentValue: 0,
    earnings: 0,
    status: 'active' as const,
    yieldPercentage: 0
  };

  return {
    ...position,
    loading,
    error,
    refetch,
    yield: position.earnings,
    yieldPercentage: position.yieldPercentage || 0
  };
}

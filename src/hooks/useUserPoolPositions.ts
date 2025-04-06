import { useState, useEffect } from 'react';
import { getPools } from '@/lib/poolRequests';
import { getUserLPBalance, previewRedeem } from '@/lib/backendRequests';
import { toast } from '@/components/ui/use-toast';

export interface UserPoolPosition {
  poolId: number;
  poolName: string;
  symbol: string;
  contractAddress: string;
  balance: number;
  currentValue: number;
  status: 'warm-up' | 'active' | 'cooldown' | 'withdrawal';
  apy: number;
}

interface UseUserPoolPositionsResult {
  positions: UserPoolPosition[];
  totalValue: number;
  loading: boolean;
  error: string | null;
  hasPositions: boolean;
  refreshPositions: () => void;
  updateUserPositionOptimistically: (poolId: number, amount: number) => void;
}

export const useUserPoolPositions = (
  walletAddress: string
): UseUserPoolPositionsResult => {
  const [positions, setPositions] = useState<UserPoolPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchPositions = async () => {
      if (!walletAddress) {
        setPositions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const pools = await getPools();
        if (!pools || pools.length === 0) {
          setPositions([]);
          setLoading(false);
          return;
        }

        const positionPromises = pools.map(async (pool) => {
          if (!pool.contract_address) return null;

          try {
            const lpBalance = await getUserLPBalance(walletAddress, pool.contract_address);

            if (lpBalance.balance <= 0) return null;

            const redeemPreview = await previewRedeem(lpBalance.balance, pool.contract_address);

            return {
              poolId: pool.id,
              poolName: pool.name,
              symbol: pool.metadata?.symbol || 'LP',
              contractAddress: pool.contract_address,
              balance: lpBalance.balance,
              currentValue: redeemPreview.usdcAmount,
              status: pool.status,
              apy: pool.apy
            };
          } catch (err) {
            console.error(`Error fetching position for pool ${pool.id}:`, err);
            return null;
          }
        });

        const resolvedPositions = await Promise.all(positionPromises);
        const validPositions = resolvedPositions.filter(
          (position): position is UserPoolPosition => position !== null
        );

        setPositions(validPositions);
      } catch (err) {
        console.error("Error fetching user positions:", err);
        setError("Failed to load your portfolio data. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load your portfolio data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [walletAddress, refreshTrigger]);

  const totalValue = positions.reduce((sum, position) => sum + position.currentValue, 0);
  const hasPositions = positions.length > 0;

  const refreshPositions = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const updateUserPositionOptimistically = (poolId: number, amount: number) => {
    setPositions((prevPositions) =>
      prevPositions.map((position) =>
        position.poolId === poolId
          ? { ...position, balance: position.balance + amount }
          : position
      )
    );
  };

  return { 
    positions, 
    totalValue, 
    loading, 
    error, 
    hasPositions,
    refreshPositions,
    updateUserPositionOptimistically
  };
};

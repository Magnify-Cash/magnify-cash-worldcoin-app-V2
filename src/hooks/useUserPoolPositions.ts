
import { useState, useEffect } from 'react';
import { getPools } from '@/lib/poolRequests';
import { getUserLPBalance, previewRedeem } from '@/lib/backendRequests';
import { toast } from '@/components/ui/use-toast';
import { LiquidityPool } from '@/types/supabase/liquidity';

export interface UserPoolPosition {
  poolId: number;
  poolName: string;
  symbol: string;
  contractAddress: string;
  balance: number;
  depositedValue: number; // Using hardcoded values for now
  currentValue: number;
  earnings: number;
  status: 'warm-up' | 'active' | 'cooldown' | 'withdrawal';
  apy: number;
}

interface UseUserPoolPositionsResult {
  positions: UserPoolPosition[];
  totalValue: number;
  totalEarnings: number;
  loading: boolean;
  error: string | null;
  hasPositions: boolean;
  refreshPositions: () => void;
}

// Mock deposited values for now (real API would track this)
const mockDepositedValues: Record<number, number> = {
  1: 1200,
  2: 500,
  3: 300,
  4: 800,
  5: 600
};

export const useUserPoolPositions = (
  walletAddress = '0x6835939032900e5756abFF28903d8A5E68CB39dF'
): UseUserPoolPositionsResult => {
  const [positions, setPositions] = useState<UserPoolPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First, fetch all pools
        const pools = await getPools();
        if (!pools || pools.length === 0) {
          console.log("No pools available");
          setPositions([]);
          setLoading(false);
          return;
        }

        // For each pool, check if user has a position
        const positionPromises = pools.map(async (pool) => {
          if (!pool.contract_address) {
            console.log(`Pool ${pool.id} has no contract address`);
            return null;
          }

          try {
            // Get LP balance
            const lpBalance = await getUserLPBalance(walletAddress, pool.contract_address);
            
            // If user doesn't have any LP tokens, they don't have a position
            if (lpBalance.balance <= 0) {
              return null;
            }
            
            // Use the mock deposited value for now
            const depositedValue = mockDepositedValues[pool.id] || lpBalance.balance;
            
            // Get the current value by previewing redemption
            const redeemPreview = await previewRedeem(lpBalance.balance, pool.contract_address);
            const currentValue = redeemPreview.usdcAmount;
            
            // Calculate earnings
            const earnings = currentValue - depositedValue;
            
            // Create the position object
            return {
              poolId: pool.id,
              poolName: pool.name,
              symbol: pool.metadata?.symbol || 'LP',
              contractAddress: pool.contract_address,
              balance: lpBalance.balance,
              depositedValue,
              currentValue,
              earnings,
              status: pool.status,
              apy: pool.apy
            };
          } catch (err) {
            console.error(`Error fetching position for pool ${pool.id}:`, err);
            return null;
          }
        });

        // Wait for all position promises to resolve
        const resolvedPositions = await Promise.all(positionPromises);
        
        // Filter out null positions (where user doesn't have a balance)
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

  // Calculate totals
  const totalValue = positions.reduce((sum, position) => sum + position.currentValue, 0);
  const totalEarnings = positions.reduce((sum, position) => sum + position.earnings, 0);
  const hasPositions = positions.length > 0;

  const refreshPositions = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return { 
    positions, 
    totalValue, 
    totalEarnings, 
    loading, 
    error, 
    hasPositions,
    refreshPositions
  };
};

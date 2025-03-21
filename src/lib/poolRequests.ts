
import backendRequest from "@/lib/request";
import { LiquidityPool, UserPoolPosition } from "@/types/supabase/liquidity";

export const getPools = async (): Promise<LiquidityPool[]> => {
  // For demo purposes, returning mock data
  // In a real app, would fetch from backend using:
  // const response = await backendRequest<LiquidityPool[]>("GET", "getPools");
  
  // Mock data
  const mockPools: LiquidityPool[] = [
    {
      id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      name: "USDC Pool",
      token_a: "USDC",
      token_b: "LP",
      token_a_amount: 2450000,
      token_b_amount: 2450000,
      apy: 8.5,
      total_value_locked: 2450000,
      available_liquidity: 185000,
      status: "active",
      metadata: {
        description: "Main USDC lending pool",
        minDeposit: 10,
        maxDeposit: 1000000
      }
    },
    {
      id: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      name: "ETH Pool",
      token_a: "ETH",
      token_b: "LP",
      token_a_amount: 1200000,
      token_b_amount: 1200000,
      apy: 6.2,
      total_value_locked: 1200000,
      available_liquidity: 75000,
      status: "warm-up",
      metadata: {
        description: "Ethereum lending pool",
        minDeposit: 0.01,
        maxDeposit: 100
      }
    },
    {
      id: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      name: "WBTC Pool",
      token_a: "WBTC",
      token_b: "LP",
      token_a_amount: 3500000,
      token_b_amount: 3500000,
      apy: 4.8,
      total_value_locked: 3500000,
      available_liquidity: 220000,
      status: "completed",
      metadata: {
        description: "Wrapped Bitcoin lending pool",
        minDeposit: 0.001,
        maxDeposit: 10
      }
    }
  ];
  
  return mockPools;
};

export const getPoolById = async (id: number): Promise<LiquidityPool | null> => {
  // In a real app, would fetch from backend using:
  // const response = await backendRequest<LiquidityPool>("GET", "getPool", { id });
  
  const pools = await getPools();
  return pools.find(pool => pool.id === id) || null;
};

export const getUserPoolPosition = async (poolId: number): Promise<UserPoolPosition | null> => {
  // In a real app, would fetch from backend using:
  // const response = await backendRequest<UserPoolPosition>("GET", "getUserPoolPosition", { poolId });
  
  // Mock user position for demo purposes
  if (poolId === 1) {
    return {
      id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: "user123",
      pool_id: poolId,
      token_a_amount: 1200,
      token_b_amount: 1200,
      total_value_locked: 1250.75
    };
  }
  
  return null;
};

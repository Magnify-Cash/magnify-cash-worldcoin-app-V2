
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
      token_a_amount: 24500,
      token_b_amount: 24500,
      apy: 8.5,
      total_value_locked: 24500,
      available_liquidity: 18500,
      status: "active",
      metadata: {
        description: "Main USDC lending pool",
        minDeposit: 10,
        maxDeposit: 30000
      }
    },
    {
      id: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      name: "ETH Pool",
      token_a: "ETH",
      token_b: "LP",
      token_a_amount: 12000,
      token_b_amount: 12000,
      apy: 6.2,
      total_value_locked: 12000,
      available_liquidity: 7500,
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
      token_a_amount: 30000,
      token_b_amount: 30000,
      apy: 4.8,
      total_value_locked: 30000,
      available_liquidity: 22000,
      status: "withdrawal",
      metadata: {
        description: "Wrapped Bitcoin lending pool",
        minDeposit: 0.001,
        maxDeposit: 10
      }
    },
    {
      id: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      name: "DAI Pool",
      token_a: "DAI",
      token_b: "LP",
      token_a_amount: 18000,
      token_b_amount: 18000,
      apy: 5.6,
      total_value_locked: 18000,
      available_liquidity: 9000,
      status: "cooldown",
      metadata: {
        description: "DAI lending pool",
        minDeposit: 5,
        maxDeposit: 10000
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

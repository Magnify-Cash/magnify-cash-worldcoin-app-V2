
import { 
  getSoulboundPoolAddresses, 
  getPoolName, 
  getPoolStatus, 
  getPoolDeactivationDate, 
  getPoolActivationDate, 
  getPoolLPSymbol,
  getPoolUSDCBalance,
  getPoolLiquidity
} from "@/lib/backendRequests";
import { LiquidityPool, UserPoolPosition } from "@/types/supabase/liquidity";
import { format, differenceInDays, parseISO } from "date-fns";

export const getPools = async (): Promise<LiquidityPool[]> => {
  try {
    // Fetch all pool addresses
    const poolAddresses = await getSoulboundPoolAddresses();
    
    if (!poolAddresses.length) {
      console.log("No pool addresses found");
      return [];
    }
    
    // For each pool address, fetch details in parallel
    const poolDataPromises = poolAddresses.map(async (contract, index) => {
      try {
        // Fetch all pool data in parallel
        const [
          nameResponse, 
          statusResponse, 
          deactivationResponse, 
          activationResponse,
          symbolResponse,
          liquidityResponse,
          balanceResponse
        ] = await Promise.all([
          getPoolName(contract),
          getPoolStatus(contract),
          getPoolDeactivationDate(contract),
          getPoolActivationDate(contract),
          getPoolLPSymbol(contract),
          getPoolLiquidity(contract),
          getPoolUSDCBalance(contract)
        ]);
        
        // Parse dates for calculating lock duration
        const activationDate = parseISO(activationResponse.timestamp);
        const deactivationDate = parseISO(deactivationResponse.timestamp);
        
        // Calculate lock duration in days
        const lockDurationDays = differenceInDays(deactivationDate, activationDate);
        
        // Map API status to UI status
        const statusMap: Record<string, 'warm-up' | 'active' | 'cooldown' | 'withdrawal'> = {
          isWarmup: 'warm-up',
          isActive: 'active',
          isCooldown: 'cooldown',
          isExpired: 'withdrawal'
        };
        
        return {
          id: index + 1, // Use index + 1 as ID for now
          contract_address: contract, // Store contract address for reference
          created_at: activationResponse.timestamp,
          updated_at: new Date().toISOString(),
          name: nameResponse.name,
          token_a: "USDC",
          token_b: symbolResponse.symbol,
          token_a_amount: balanceResponse.totalAssets,
          token_b_amount: balanceResponse.totalAssets,
          apy: 8.5, // Fixed APY as per requirement
          total_value_locked: balanceResponse.totalAssets,
          available_liquidity: liquidityResponse.liquidity,
          status: statusMap[statusResponse.status] || 'active',
          metadata: {
            description: `${nameResponse.name} lending pool`,
            minDeposit: 10,
            maxDeposit: 30000,
            lockDurationDays,
            activationTimestamp: activationResponse.timestamp,
            activationFormattedDate: activationResponse.formattedDate,
            deactivationTimestamp: deactivationResponse.timestamp,
            deactivationFormattedDate: deactivationResponse.formattedDate,
            symbol: symbolResponse.symbol
          }
        };
      } catch (error) {
        console.error(`Error fetching details for pool ${contract}:`, error);
        return null;
      }
    });
    
    // Wait for all promises to resolve
    const poolsData = await Promise.all(poolDataPromises);
    
    // Filter out any failed pool fetches and return the successful ones
    return poolsData.filter(Boolean) as LiquidityPool[];
  } catch (error) {
    console.error("Error fetching pools:", error);
    throw error;
  }
};

export const getPoolById = async (id: number): Promise<LiquidityPool | null> => {
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

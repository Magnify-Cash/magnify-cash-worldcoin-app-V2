
import { 
  getSoulboundPoolAddresses, 
  getPoolName, 
  getPoolStatus, 
  getPoolDeactivationDate, 
  getPoolActivationDate, 
  getPoolLPSymbol,
  getPoolUSDCBalance,
  getPoolLiquidity,
  getPoolLoanDuration,
  getPoolLoanInterestRate
} from "@/lib/backendRequests";
import { LiquidityPool, UserPoolPosition } from "@/types/supabase/liquidity";
import { format, differenceInDays, parseISO } from "date-fns";
import { retry } from "@/utils/retryUtils";
import { Cache } from "@/utils/cacheUtils";

// Cache keys
const POOLS_CACHE_KEY = 'pool_data_all';
const poolCacheKey = (id: number) => `pool_data_${id}`;

export const getPools = async (): Promise<LiquidityPool[]> => {
  try {
    // Check cache first
    const cachedPools = Cache.get<LiquidityPool[]>(POOLS_CACHE_KEY);
    if (cachedPools && cachedPools.length > 0) {
      console.log("Using cached pool data");
      return cachedPools;
    }
    
    // Fetch all pool addresses with retry
    const poolAddresses = await retry(
      () => getSoulboundPoolAddresses(),
      3,
      1000,
      (error, retriesLeft) => console.warn(`Error fetching pool addresses, retries left: ${retriesLeft}`, error)
    );
    
    if (!poolAddresses.length) {
      console.log("No pool addresses found");
      return [];
    }
    
    // For each pool address, fetch details in parallel
    const poolDataPromises = poolAddresses.map(async (contract, index) => {
      try {
        // Check for individual pool cache
        const poolId = index + 1;
        const cachedPool = Cache.get<LiquidityPool>(poolCacheKey(poolId));
        if (cachedPool) {
          return cachedPool;
        }
        
        // Fetch all pool data in parallel with retries
        const [
          nameResponse, 
          statusResponse, 
          deactivationResponse, 
          activationResponse,
          symbolResponse,
          liquidityResponse,
          balanceResponse
        ] = await Promise.all([
          retry(() => getPoolName(contract), 3),
          retry(() => getPoolStatus(contract), 3, 1000, () => ({ status: 'isActive' })), // Default to active on failure
          retry(() => getPoolDeactivationDate(contract), 3, 1000, () => ({ 
            timestamp: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), 
            formattedDate: 'N/A' 
          })),
          retry(() => getPoolActivationDate(contract), 3, 1000, () => ({ 
            timestamp: new Date().toISOString(), 
            formattedDate: 'N/A' 
          })),
          retry(() => getPoolLPSymbol(contract), 3, 1000, () => ({ symbol: 'LP' })),
          retry(() => getPoolLiquidity(contract), 3, 1000, () => ({ liquidity: 0 })),
          retry(() => getPoolUSDCBalance(contract), 3, 1000, () => ({ totalAssets: 0 }))
        ]);
        
        // Parse dates for calculating lock duration
        let lockDurationDays = 180; // Default fallback
        try {
          const activationDate = parseISO(activationResponse.timestamp);
          const deactivationDate = parseISO(deactivationResponse.timestamp);
          lockDurationDays = differenceInDays(deactivationDate, activationDate);
          if (isNaN(lockDurationDays) || lockDurationDays <= 0) {
            lockDurationDays = 180; // Fallback if calculation fails
          }
        } catch (error) {
          console.error('Error calculating lock duration:', error);
        }
        
        // Map API status to UI status
        const statusMap: Record<string, 'warm-up' | 'active' | 'cooldown' | 'withdrawal'> = {
          isWarmup: 'warm-up',
          isActive: 'active',
          isCooldown: 'cooldown',
          isExpired: 'withdrawal'
        };
        
        const pool: LiquidityPool = {
          id: index + 1, // Use index + 1 as ID for now
          contract_address: contract, // Store contract address for reference
          created_at: activationResponse.timestamp,
          updated_at: new Date().toISOString(),
          name: nameResponse.name || `Pool ${index + 1}`,
          token_a: "USDC",
          token_b: symbolResponse.symbol || 'LP',
          token_a_amount: balanceResponse.totalAssets || 0,
          token_b_amount: balanceResponse.totalAssets || 0,
          apy: 8.5, // Fixed APY as per requirement
          total_value_locked: balanceResponse.totalAssets || 0,
          available_liquidity: liquidityResponse.liquidity || 0,
          status: statusMap[statusResponse.status] || 'active',
          metadata: {
            description: `${nameResponse.name || 'Lending'} pool`,
            minDeposit: 10,
            maxDeposit: 30000,
            lockDurationDays,
            activationTimestamp: activationResponse.timestamp,
            activationFormattedDate: activationResponse.formattedDate || 'N/A',
            deactivationTimestamp: deactivationResponse.timestamp,
            deactivationFormattedDate: deactivationResponse.formattedDate || 'N/A',
            symbol: symbolResponse.symbol || 'LP'
          }
        };
        
        // Cache the individual pool
        Cache.set(poolCacheKey(poolId), pool, 15);
        
        return pool;
      } catch (error) {
        console.error(`Error fetching details for pool ${contract}:`, error);
        // Return default pool object on error
        return {
          id: index + 1,
          contract_address: contract,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          name: `Pool ${index + 1}`,
          token_a: "USDC",
          token_b: "LP",
          token_a_amount: 0,
          token_b_amount: 0,
          apy: 8.5,
          total_value_locked: 0,
          available_liquidity: 0,
          status: 'active' as 'warm-up' | 'active' | 'cooldown' | 'withdrawal',
          metadata: {
            description: "Lending pool",
            minDeposit: 10,
            maxDeposit: 30000,
            lockDurationDays: 180,
            activationTimestamp: new Date().toISOString(),
            activationFormattedDate: 'N/A',
            deactivationTimestamp: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
            deactivationFormattedDate: 'N/A',
            symbol: 'LP'
          }
        };
      }
    });
    
    // Wait for all promises to resolve
    const poolsData = await Promise.all(poolDataPromises);
    
    // Filter out any failed pool fetches and return the successful ones
    const validPools = poolsData.filter(Boolean) as LiquidityPool[];
    
    // Cache the complete pools data
    if (validPools.length > 0) {
      Cache.set(POOLS_CACHE_KEY, validPools, 15);
    }
    
    return validPools;
  } catch (error) {
    console.error("Error fetching pools:", error);
    
    // Return cached data if available, even if it's expired
    try {
      const cachedPools = Cache.get<LiquidityPool[]>(POOLS_CACHE_KEY);
      if (cachedPools && cachedPools.length > 0) {
        console.log("Using expired cached data as fallback");
        return cachedPools;
      }
    } catch (e) {
      console.error("Error retrieving fallback cache:", e);
    }
    
    // If all else fails, return empty array
    return [];
  }
};

export const invalidatePoolsCache = (): void => {
  Cache.clearPoolCache();
};

export const getPoolById = async (id: number): Promise<LiquidityPool | null> => {
  try {
    // Check for individual pool cache first
    const cachedPool = Cache.get<LiquidityPool>(poolCacheKey(id));
    if (cachedPool) {
      return cachedPool;
    }
    
    // If not in cache, get all pools and find by id
    const pools = await getPools();
    const pool = pools.find(pool => pool.id === id) || null;
    
    // If pool found, fetch additional borrower information
    if (pool && pool.contract_address) {
      try {
        // Fetch loan period - with retry mechanism
        const loanDuration = await retry(
          () => getPoolLoanDuration(pool.contract_address!),
          3,
          1000,
          (error, retriesLeft) => console.warn(`Error fetching loan duration, retries left: ${retriesLeft}`, error)
        );
        
        // Fetch interest rate - with retry mechanism
        const interestRate = await retry(
          () => getPoolLoanInterestRate(pool.contract_address!),
          3,
          1000,
          (error, retriesLeft) => console.warn(`Error fetching interest rate, retries left: ${retriesLeft}`, error)
        );
        
        // Add borrower info to pool object
        pool.borrower_info = {
          loanPeriodDays: Math.ceil(loanDuration.days),
          interestRate: interestRate.interestRate ? 
            (parseFloat(interestRate.interestRate) / 100).toFixed(1) + '%' : 
            '8.5%', // Fallback value
          loanAmount: '$10 - $30', // Placeholder as specified
          originationFee: '10%', // Placeholder as specified
          warmupPeriod: '14 days' // Placeholder as specified
        };
      } catch (error) {
        console.error('Error fetching borrower information:', error);
        // Provide fallback values if fetching fails
        pool.borrower_info = {
          loanPeriodDays: 30,
          interestRate: '8.5%',
          loanAmount: '$10 - $30',
          originationFee: '10%',
          warmupPeriod: '14 days'
        };
      }
    }
    
    // Cache this pool if found
    if (pool) {
      Cache.set(poolCacheKey(id), pool, 15);
    }
    
    return pool;
  } catch (error) {
    console.error(`Error fetching pool with ID ${id}:`, error);
    return null;
  }
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

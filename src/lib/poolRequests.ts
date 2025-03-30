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
  getPoolLoanInterestRate,
  getWarmupPeriod,
  getPoolLoanAmount,
  getPoolOriginationFee
} from "@/lib/backendRequests";
import { LiquidityPool, UserPoolPosition } from "@/types/supabase/liquidity";
import { format, differenceInDays, parseISO } from "date-fns";
import { retry } from "@/utils/retryUtils";
import { Cache } from "@/utils/cacheUtils";

// Cache keys
const POOLS_CACHE_KEY = 'pool_data_all';
const poolCacheKey = (id: number) => `pool_data_${id}`;
const borrowerInfoCacheKey = (contractAddress: string) => `borrower_info_${contractAddress}`;

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
          // Convert timestamp strings to milliseconds (from seconds) for Date objects
          const activationTimestamp = activationResponse.timestamp ? 
            parseInt(activationResponse.timestamp) * 1000 : Date.now();
          const deactivationTimestamp = deactivationResponse.timestamp ? 
            parseInt(deactivationResponse.timestamp) * 1000 : Date.now() + 180 * 24 * 60 * 60 * 1000;
          
          const activationDate = new Date(activationTimestamp);
          const deactivationDate = new Date(deactivationTimestamp);
          
          lockDurationDays = differenceInDays(deactivationDate, activationDate);
          if (isNaN(lockDurationDays) || lockDurationDays <= 0) {
            console.log("Invalid lock duration calculation", { 
              activationTimestamp, 
              deactivationTimestamp, 
              activationDate, 
              deactivationDate 
            });
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

        // Calculate warmup start time (for now using hardcoded timestamp)
        // This will be replaced by a backend call when available
        // Convert the timestamp to milliseconds (from seconds)
        const hardcodedWarmupStart = new Date(1743324320 * 1000); // Convert unix timestamp to Date
        const warmupStartFormattedDate = format(hardcodedWarmupStart, 'MMM d, yyyy');
        
        const pool: LiquidityPool = {
          id: index + 1, // Use index + 1 as ID for now
          contract_address: contract, // Store contract address for reference
          created_at: activationResponse.timestamp ? 
            new Date(parseInt(activationResponse.timestamp) * 1000).toISOString() : new Date().toISOString(),
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
            // Store the raw timestamp for later use, also add a timestamp in milliseconds
            activationTimestamp: activationResponse.timestamp || '',
            activationTimestampMs: activationResponse.timestamp ? 
              (parseInt(activationResponse.timestamp) * 1000).toString() : '',
            activationFormattedDate: activationResponse.formattedDate || 'N/A',
            deactivationTimestamp: deactivationResponse.timestamp || '',
            deactivationTimestampMs: deactivationResponse.timestamp ? 
              (parseInt(deactivationResponse.timestamp) * 1000).toString() : '',
            deactivationFormattedDate: deactivationResponse.formattedDate || 'N/A',
            warmupStartTimestamp: (hardcodedWarmupStart.getTime() / 1000).toString(), // Store as seconds
            warmupStartTimestampMs: hardcodedWarmupStart.getTime().toString(), // Store as milliseconds
            warmupStartFormattedDate: warmupStartFormattedDate,
            symbol: symbolResponse.symbol || 'LP'
          },
          borrower_info: {
            loanPeriodDays: 30,
            interestRate: '8.5%',
            loanAmount: '$10',
            originationFee: '10%',
            warmupPeriod: '14 days'
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
            warmupStartTimestamp: new Date().toISOString(),
            warmupStartFormattedDate: 'N/A',
            symbol: 'LP'
          },
          borrower_info: {
            loanPeriodDays: 30,
            interestRate: '8.5%',
            loanAmount: '$10',
            originationFee: '10%',
            warmupPeriod: '14 days'
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
    let pool: LiquidityPool | null = null;
    
    if (cachedPool) {
      console.log("Using cached pool data for pool ID:", id);
      pool = { ...cachedPool }; // Create a copy to avoid modifying the cached object directly
    } else {
      // If not in cache, get all pools and find by id
      const pools = await getPools();
      pool = pools.find(p => p.id === id) || null;
      
      // If pool not found, return null
      if (!pool) {
        return null;
      }
    }
    
    // Fetch borrower information only if the pool is found
    if (pool && pool.contract_address) {
      // First check if we have cached borrower info
      const cachedBorrowerInfo = Cache.get<LiquidityPool['borrower_info']>(
        borrowerInfoCacheKey(pool.contract_address)
      );
      
      if (cachedBorrowerInfo) {
        console.log(`Using cached borrower info for pool ID ${id}`);
        pool.borrower_info = cachedBorrowerInfo;
      } else {
        try {
          console.log(`Fetching detailed borrower info for pool ID ${id}...`);
          
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
          
          // Fetch loan amount - with retry mechanism
          const loanAmount = await retry(
            () => getPoolLoanAmount(pool.contract_address!),
            3,
            1000,
            (error, retriesLeft) => console.warn(`Error fetching loan amount, retries left: ${retriesLeft}`, error)
          );
          
          // Fetch origination fee - with retry mechanism
          const originationFee = await retry(
            () => getPoolOriginationFee(pool.contract_address!),
            3,
            1000,
            (error, retriesLeft) => console.warn(`Error fetching origination fee, retries left: ${retriesLeft}`, error)
          );
          
          // Fetch warmup period - with retry mechanism
          const warmupPeriod = await retry(
            () => getWarmupPeriod(pool.contract_address!),
            3,
            1000,
            (error, retriesLeft) => console.warn(`Error fetching warmup period, retries left: ${retriesLeft}`, error)
          );
          
          // Initialize the borrower_info object with real data from API
          const borrowerInfo = {
            loanPeriodDays: Math.ceil(loanDuration.days),
            interestRate: interestRate.interestRate ? 
              interestRate.interestRate + '%' : '8.5%', // Add % symbol if needed
            loanAmount: loanAmount && typeof loanAmount.loanAmount === 'number' ? 
              `$${loanAmount.loanAmount}` : '$10', // Format loan amount with $ symbol
            originationFee: originationFee && typeof originationFee.originationFee === 'number' ? 
              `${originationFee.originationFee}%` : '10%', // Format origination fee with % symbol
            warmupPeriod: warmupPeriod.warmupPeriod || '14 days'
          };
          
          // Update the pool object
          pool.borrower_info = borrowerInfo;
          
          // Cache the borrower info separately with a longer expiration (60 minutes since it rarely changes)
          Cache.set(borrowerInfoCacheKey(pool.contract_address), borrowerInfo, 60);
          
          console.log(`Successfully fetched borrower info for pool ID ${id}:`, pool.borrower_info);
        } catch (error) {
          console.error('Error fetching borrower information:', error);
          // Provide fallback values if fetching fails
          pool.borrower_info = {
            loanPeriodDays: 30,
            interestRate: '8.5%',
            loanAmount: '$10',
            originationFee: '10%',
            warmupPeriod: '14 days'
          };
        }
      }
    }
    
    // Update timestamps in metadata if they exist
    if (pool && pool.metadata) {
      // Make sure we have milliseconds versions of timestamps for easier Date usage
      if (pool.metadata.activationTimestamp && !pool.metadata.activationTimestampMs) {
        pool.metadata.activationTimestampMs = (parseInt(pool.metadata.activationTimestamp) * 1000).toString();
      }
      
      if (pool.metadata.deactivationTimestamp && !pool.metadata.deactivationTimestampMs) {
        pool.metadata.deactivationTimestampMs = (parseInt(pool.metadata.deactivationTimestamp) * 1000).toString();
      }
      
      if (pool.metadata.warmupStartTimestamp && !pool.metadata.warmupStartTimestampMs) {
        pool.metadata.warmupStartTimestampMs = (parseInt(pool.metadata.warmupStartTimestamp) * 1000).toString();
      }
    }
    
    // Cache this pool with the enriched data if found (with standard 15 minute expiration)
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

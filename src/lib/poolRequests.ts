
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
  getPoolLoanAmount,
  getPoolOriginationFee,
  getPoolWarmupPeriod
} from "@/lib/backendRequests";
import { LiquidityPool, UserPoolPosition } from "@/types/supabase/liquidity";
import { format, differenceInDays, parseISO } from "date-fns";
import { retry } from "@/utils/retryUtils";
import { Cache } from "@/utils/cacheUtils";

// Cache keys
const POOLS_CACHE_KEY = 'pool_data_all';
const poolContractCacheKey = (contract: string) => `pool_data_contract_${contract}`;
const borrowerInfoCacheKey = (contractAddress: string) => `borrower_info_${contractAddress}`;
const ID_TO_CONTRACT_CACHE_KEY = 'pool_id_to_contract_map';

// Helper function to create a mapping of pool IDs to contract addresses
const createIdToContractMapping = (pools: LiquidityPool[]): Record<number, string> => {
  const mapping: Record<number, string> = {};
  
  pools.forEach(pool => {
    if (pool.id && pool.contract_address) {
      mapping[pool.id] = pool.contract_address;
    }
  });
  
  // Cache this mapping for future lookups
  Cache.set(ID_TO_CONTRACT_CACHE_KEY, mapping, 60); // Cache for 60 minutes
  
  return mapping;
};

// Helper function to get a contract address from a pool ID using the cached mapping
const getContractAddressFromId = async (id: number): Promise<string | null> => {
  // Check if we have a cached mapping
  const cachedMapping = Cache.get<Record<number, string>>(ID_TO_CONTRACT_CACHE_KEY);
  
  if (cachedMapping && cachedMapping[id]) {
    return cachedMapping[id];
  }
  
  // If not found in cache, try to get all pools and create a mapping
  try {
    const pools = await getPools();
    const mapping = createIdToContractMapping(pools);
    return mapping[id] || null;
  } catch (error) {
    console.error(`Failed to get contract address for pool ID ${id}:`, error);
    return null;
  }
};

export const getPools = async (): Promise<LiquidityPool[]> => {
  try {
    // Check cache first
    const cachedPools = Cache.get<LiquidityPool[]>(POOLS_CACHE_KEY);
    if (cachedPools && cachedPools.length > 0) {
      console.log("[poolRequests] Using cached pool data");
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
        // Check for individual pool cache by contract address
        const contractCached = Cache.get<LiquidityPool>(poolContractCacheKey(contract));
        if (contractCached) {
          return contractCached;
        }
        
        // Fetch all pool data in parallel with retries
        const [
          nameResponse, 
          statusResponse, 
          deactivationResponse, 
          activationResponse,
          symbolResponse,
          liquidityResponse,
          balanceResponse,
          warmupPeriodResponse
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
          retry(() => getPoolUSDCBalance(contract), 3, 1000, () => ({ totalAssets: 0 })),
          retry(() => getPoolWarmupPeriod(contract), 3, 1000, () => ({ warmupPeriodDays: 14 }))
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
        
        // Calculate warmup start time based on the activation date and warmup period
        const warmupPeriodDays = warmupPeriodResponse.warmupPeriodDays || 14; // Default to 14 days if API fails
        
        // Get activation timestamp in milliseconds
        const activationTimestamp = activationResponse.timestamp ? 
          parseInt(activationResponse.timestamp) * 1000 : Date.now();
          
        // Calculate warmup start by subtracting warmup period from activation date
        const activationDate = new Date(activationTimestamp);
        const warmupStartDate = new Date(activationDate);
        warmupStartDate.setDate(activationDate.getDate() - warmupPeriodDays);
        const warmupStartFormattedDate = format(warmupStartDate, 'MMM d, yyyy');
        
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
            lockDurationDays: lockDurationDays || 1800,
            // Store the raw timestamp for later use, also add a timestamp in milliseconds
            activationTimestamp: activationResponse.timestamp || '',
            activationTimestampMs: activationResponse.timestamp ? 
              (parseInt(activationResponse.timestamp) * 1000).toString() : '',
            activationFormattedDate: activationResponse.formattedDate || 'N/A',
            deactivationTimestamp: deactivationResponse.timestamp || '',
            deactivationTimestampMs: deactivationResponse.timestamp ? 
              (parseInt(deactivationResponse.timestamp) * 1000).toString() : '',
            deactivationFormattedDate: deactivationResponse.formattedDate || 'N/A',
            warmupStartTimestamp: (warmupStartDate.getTime() / 1000).toString(), // Store as seconds
            warmupStartTimestampMs: warmupStartDate.getTime().toString(), // Store as milliseconds
            warmupStartFormattedDate: warmupStartFormattedDate,
            symbol: symbolResponse.symbol || 'LP'
          },
          // Initialize with placeholder borrower info that will be updated later
          borrower_info: {
            loanPeriodDays: 0,
            interestRate: '0%',
            loanAmount: '$0',
            originationFee: '0%',
            warmupPeriod: `${warmupPeriodDays} days`
          }
        };
        
        // Cache the individual pool by contract
        Cache.set(poolContractCacheKey(contract), pool, 15);
        
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
            loanPeriodDays: 0,
            interestRate: '0%',
            loanAmount: '$0',
            originationFee: '0%',
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
      // Also create and cache the ID to contract mapping
      createIdToContractMapping(validPools);
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
    // First try to get the contract address for this ID
    const contractAddress = await getContractAddressFromId(id);
    
    if (contractAddress) {
      // If we found a contract address, use getPoolByContract
      return getPoolByContract(contractAddress);
    }
    
    // If we couldn't find a contract, get all pools and find by id
    const pools = await getPools();
    const pool = pools.find(p => p.id === id) || null;
    
    // If pool not found, return null
    if (!pool) {
      return null;
    }
    
    return enhancePoolWithBorrowerInfo(pool);
  } catch (error) {
    console.error(`Error fetching pool with ID ${id}:`, error);
    return null;
  }
};

export const getPoolByContract = async (contractAddress: string): Promise<LiquidityPool | null> => {
  try {
    // Check for individual pool cache by contract address
    const cachedPool = Cache.get<LiquidityPool>(poolContractCacheKey(contractAddress));
    if (cachedPool) {
      console.log("[poolRequests] Using cached pool data for contract:", contractAddress);
      return enhancePoolWithBorrowerInfo(cachedPool);
    }
    
    // If not in cache, get all pools and find by contract
    const pools = await getPools();
    const pool = pools.find(p => p.contract_address === contractAddress) || null;
    
    // If pool not found, return null
    if (!pool) {
      return null;
    }
    
    return enhancePoolWithBorrowerInfo(pool);
  } catch (error) {
    console.error(`Error fetching pool with contract ${contractAddress}:`, error);
    return null;
  }
};

// Helper function to fetch and add borrower info to pool data
async function enhancePoolWithBorrowerInfo(pool: LiquidityPool): Promise<LiquidityPool> {
  if (!pool.contract_address) {
    return pool;
  }
  
  // First check if we have cached borrower info
  const cachedBorrowerInfo = Cache.get<LiquidityPool['borrower_info']>(
    borrowerInfoCacheKey(pool.contract_address)
  );
  
  if (cachedBorrowerInfo) {
    console.log(`[poolRequests] Using cached borrower info for pool ID ${pool.id}`);
    
    // Update the pool with the cached borrower info
    return {
      ...pool,
      borrower_info: cachedBorrowerInfo
    };
  }
  
  try {
    console.log(`[poolRequests] Fetching detailed borrower info for pool ID ${pool.id}...`);
    
    // Fetch loan related data with retry mechanism
    const loanDuration = await retry(
      () => getPoolLoanDuration(pool.contract_address!),
      3,
      1000,
      (error, retriesLeft) => console.warn(`Error fetching loan duration, retries left: ${retriesLeft}`, error)
    );
    
    const interestRate = await retry(
      () => getPoolLoanInterestRate(pool.contract_address!),
      3,
      1000,
      (error, retriesLeft) => console.warn(`Error fetching interest rate, retries left: ${retriesLeft}`, error)
    );
    
    const loanAmount = await retry(
      () => getPoolLoanAmount(pool.contract_address!),
      3,
      1000,
      (error, retriesLeft) => console.warn(`Error fetching loan amount, retries left: ${retriesLeft}`, error)
    );
    
    const originationFee = await retry(
      () => getPoolOriginationFee(pool.contract_address!),
      3,
      1000,
      (error, retriesLeft) => console.warn(`Error fetching origination fee, retries left: ${retriesLeft}`, error)
    );
    
    // Fetch warmup period - with retry mechanism
    const warmupPeriod = await retry(
      () => getPoolWarmupPeriod(pool.contract_address!),
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
      warmupPeriod: `${warmupPeriod.warmupPeriodDays} days`
    };
    
    // Create a copy of the pool with updated borrower info
    const enhancedPool = {
      ...pool,
      borrower_info: borrowerInfo
    };
    
    // Cache the borrower info separately with a longer expiration (60 minutes since it rarely changes)
    Cache.set(borrowerInfoCacheKey(pool.contract_address), borrowerInfo, 60);
    
    // Update the existing pool cache with the enhanced pool
    Cache.update<LiquidityPool>(
      poolContractCacheKey(pool.contract_address),
      (currentPool) => ({
        ...currentPool,
        borrower_info: borrowerInfo
      })
    );
    
    // Also update the pool in the all pools cache if it exists
    const allPoolsCache = Cache.get<LiquidityPool[]>(POOLS_CACHE_KEY);
    if (allPoolsCache) {
      const updatedAllPools = allPoolsCache.map(p => 
        p.contract_address === pool.contract_address ? 
          { ...p, borrower_info: borrowerInfo } : p
      );
      Cache.set(POOLS_CACHE_KEY, updatedAllPools, 15);
    }
    
    // Update cooldown start time based on deactivation date and loan duration
    if (enhancedPool.metadata?.deactivationTimestamp) {
      try {
        // Get deactivation timestamp in seconds
        const deactivationTimestampSeconds = parseInt(enhancedPool.metadata.deactivationTimestamp);
        
        // Convert loan duration from seconds to milliseconds
        const loanDurationSeconds = parseInt(loanDuration.seconds.toString(), 10);
        
        // Calculate cooldown start timestamp (deactivation timestamp - loan duration in seconds)
        const cooldownStartTimestampSeconds = deactivationTimestampSeconds - loanDurationSeconds;
        const cooldownStartTimestampMs = cooldownStartTimestampSeconds * 1000;
        
        // Format the cooldown start date
        const cooldownStartDate = new Date(cooldownStartTimestampMs);
        const cooldownStartFormattedDate = format(cooldownStartDate, 'MMM d, yyyy');
        
        // Store all versions of the cooldown timestamp in a copy of the metadata to avoid mutation
        enhancedPool.metadata = {
          ...enhancedPool.metadata,
          cooldownStartTimestamp: cooldownStartTimestampSeconds.toString(),
          cooldownStartTimestampMs: cooldownStartTimestampMs.toString(),
          cooldownStartFormattedDate: cooldownStartFormattedDate
        };
        
        console.log(`[poolRequests] Calculated cooldown start for pool ${pool.id}:`, {
          deactivationTimestamp: deactivationTimestampSeconds,
          loanDurationSeconds,
          cooldownStartTimestamp: cooldownStartTimestampSeconds,
          formattedDate: cooldownStartFormattedDate
        });
      } catch (error) {
        console.error('Error calculating cooldown start date:', error);
      }
    }
    
    return enhancedPool;
  } catch (error) {
    console.error('Error fetching borrower information:', error);
    // Return the original pool object if enhancement fails
    return pool;
  }
}

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

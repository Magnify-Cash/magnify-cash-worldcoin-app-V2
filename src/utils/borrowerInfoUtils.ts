
import { 
  getPoolLoanDuration, 
  getPoolLoanInterestRate, 
  getPoolLoanAmount, 
  getPoolOriginationFee 
} from "@/lib/backendRequests";
import { Cache } from "@/utils/cacheUtils";
import { retry } from "@/utils/retryUtils";

// Cache key generator for borrower info
export const borrowerInfoCacheKey = (contractAddress: string) => `borrower_info_${contractAddress}`;
const poolContractCacheKey = (contract: string) => `pool_data_contract_${contract}`;
const POOLS_CACHE_KEY = 'pool_data_all';

// Longer cache duration for borrower info (in minutes) - This data rarely changes
const BORROWER_INFO_CACHE_DURATION = 60;

// Track which contract addresses are currently being fetched to prevent duplicate calls
const inFlightRequests: Record<string, Promise<BorrowerInfo>> = {};

export interface BorrowerInfo {
  loanPeriodDays: number;
  interestRate: number;
  loanAmount: number;
  originationFee: number;
}

/**
 * Fetches borrower information for a pool from the API or cache
 * @param contractAddress The pool contract address
 * @param forceRefresh Whether to bypass cache and force a refresh from API
 * @returns Processed borrower information with numeric values
 * @throws Error if data cannot be fetched
 */
export const fetchBorrowerInfo = async (
  contractAddress: string, 
  forceRefresh: boolean = false
): Promise<BorrowerInfo> => {
  try {
    // If there's already an in-flight request for this address, return that promise
    if (inFlightRequests[contractAddress]) {
      console.log(`[BorrowerInfo] Reusing in-flight request for ${contractAddress}`);
      return inFlightRequests[contractAddress];
    }
    
    console.log(`[BorrowerInfo] Fetching detailed borrower info for pool contract: ${contractAddress}`);
    
    // Check cache first (unless force refresh requested)
    if (!forceRefresh) {
      const cachedBorrowerInfo = Cache.get<BorrowerInfo>(borrowerInfoCacheKey(contractAddress));
      if (cachedBorrowerInfo) {
        console.log(`[BorrowerInfo] Using cached borrower info for ${contractAddress}`);
        
        // Also update pool cache with this borrower info if needed
        updatePoolCacheWithBorrowerInfo(contractAddress, cachedBorrowerInfo);
        
        return processBorrowerInfo(cachedBorrowerInfo);
      }
    }
    
    // Create a new promise for this fetch request
    const fetchPromise = (async () => {
      try {
        // Fetch all data in parallel with retries for better reliability
        const results = await Promise.all([
          retry(() => getPoolLoanDuration(contractAddress), 3),
          retry(() => getPoolLoanInterestRate(contractAddress), 3),
          retry(() => getPoolLoanAmount(contractAddress), 3),
          retry(() => getPoolOriginationFee(contractAddress), 3)
        ]);
        
        const [loanDuration, interestRate, loanAmount, originationFee] = results;
        
        // Validate that we got actual data for all requests
        // If any key fields are missing or invalid, throw an error
        if (!loanDuration?.days || !interestRate?.interestRate || !loanAmount?.loanAmount) {
          throw new Error("Missing critical borrower information from API response");
        }
        
        // Create and format the borrower info
        const borrowerInfo = {
          loanPeriodDays: Math.ceil(loanDuration.days),
          interestRate: extractNumericValue(interestRate.interestRate, 0),
          loanAmount: loanAmount && typeof loanAmount.loanAmount === 'number' ? 
            loanAmount.loanAmount : 0,
          originationFee: originationFee && typeof originationFee.originationFee === 'number' ? 
            originationFee.originationFee : 0,
        };
        
        // Validate that the values make sense
        if (borrowerInfo.interestRate <= 0 || borrowerInfo.loanAmount <= 0) {
          throw new Error("Invalid borrower information values from API");
        }
        
        // Cache the result for future use (with longer expiration since this data rarely changes)
        Cache.set(borrowerInfoCacheKey(contractAddress), borrowerInfo, BORROWER_INFO_CACHE_DURATION);
        
        // Also update pool cache with this borrower info
        updatePoolCacheWithBorrowerInfo(contractAddress, borrowerInfo);
        
        console.log(`[BorrowerInfo] Successfully fetched and cached borrower info for ${contractAddress}:`, borrowerInfo);
        return processBorrowerInfo(borrowerInfo);
      } finally {
        // Remove this request from in-flight tracking once completed (success or error)
        delete inFlightRequests[contractAddress];
      }
    })();
    
    // Store the promise for this contract address
    inFlightRequests[contractAddress] = fetchPromise;
    
    // Return the promise
    return fetchPromise;
  } catch (error) {
    console.error('[BorrowerInfo] Error fetching borrower information:', error);
    delete inFlightRequests[contractAddress];
    // Instead of returning fallback values, propagate the error
    throw new Error(`Failed to fetch borrower information: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Updates the pool caches with the latest borrower info
 */
const updatePoolCacheWithBorrowerInfo = (contractAddress: string, borrowerInfo: BorrowerInfo): void => {
  try {
    // Format the borrower info for the pool cache
    const formattedBorrowerInfo = {
      loanPeriodDays: borrowerInfo.loanPeriodDays,
      interestRate: `${borrowerInfo.interestRate}%`,
      loanAmount: `$${borrowerInfo.loanAmount}`,
      originationFee: `${borrowerInfo.originationFee}%`,
      warmupPeriod: '14 days' // Default
    };
    
    // Update the individual pool cache if it exists
    Cache.update<any>(
      poolContractCacheKey(contractAddress),
      (pool) => {
        if (!pool) return pool;
        return {
          ...pool,
          borrower_info: formattedBorrowerInfo
        };
      }
    );
    
    // Also update the pool in the all pools cache if it exists
    const allPoolsCache = Cache.get<any[]>(POOLS_CACHE_KEY);
    if (allPoolsCache) {
      const updatedAllPools = allPoolsCache.map(pool => 
        pool.contract_address === contractAddress ? 
          { ...pool, borrower_info: formattedBorrowerInfo } : pool
      );
      Cache.set(POOLS_CACHE_KEY, updatedAllPools, 15);
    }
  } catch (error) {
    console.error('[BorrowerInfo] Error updating pool cache with borrower info:', error);
  }
};

/**
 * Checks if borrower info is available in cache for given contract address
 * @param contractAddress The pool contract address
 * @returns True if cache exists, false otherwise
 */
export const hasBorrowerInfoCache = (contractAddress: string): boolean => {
  return Cache.exists(borrowerInfoCacheKey(contractAddress));
};

/**
 * Pre-fetches borrower info for multiple pools in parallel
 * @param contractAddresses Array of pool contract addresses to prefetch
 */
export const prefetchBorrowerInfo = async (contractAddresses: string[]): Promise<void> => {
  try {
    console.log(`[BorrowerInfo] Pre-fetching borrower info for ${contractAddresses.length} pools...`);
    
    // Filter out addresses that already have cached data
    const addressesToFetch = contractAddresses.filter(address => 
      !hasBorrowerInfoCache(address) && address && address !== 'custom'
    );
    
    if (addressesToFetch.length === 0) {
      console.log('[BorrowerInfo] All pool data already cached, skipping prefetch');
      return;
    }
    
    // Fetch in parallel but limit concurrency to avoid overwhelming the API (max 3 at a time)
    const batchSize = 3;
    for (let i = 0; i < addressesToFetch.length; i += batchSize) {
      const batch = addressesToFetch.slice(i, i + batchSize);
      
      console.log(`[BorrowerInfo] Fetching batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(addressesToFetch.length/batchSize)}`);
      
      const batchPromises = batch.map(address => 
        fetchBorrowerInfo(address).catch(error => {
          console.error(`[BorrowerInfo] Failed to prefetch borrower info for ${address}:`, error);
          return null;
        })
      );
      
      await Promise.all(batchPromises);
    }
    
    console.log(`[BorrowerInfo] Prefetch complete for borrower info`);
  } catch (error) {
    console.error('[BorrowerInfo] Error during prefetch of borrower info:', error);
  }
};

/**
 * Processes borrower info to ensure all values are numeric
 * @param rawInfo Raw borrower info which may have string values
 * @returns Borrower info with all numeric values
 */
export const processBorrowerInfo = (rawInfo: any): BorrowerInfo => {
  return {
    loanPeriodDays: extractNumericValue(rawInfo.loanPeriodDays, 0),
    interestRate: extractNumericValue(rawInfo.interestRate, 0),
    loanAmount: extractNumericValue(rawInfo.loanAmount, 0),
    originationFee: extractNumericValue(rawInfo.originationFee, 0)
  };
};

/**
 * Extracts a numeric value from a potentially string input
 * @param value Input value which could be string or number
 * @param defaultValue Default value to use if conversion fails
 * @returns Extracted numeric value
 */
export const extractNumericValue = (value: string | number | undefined, defaultValue: number): number => {
  if (value === undefined || value === null) return defaultValue;
  
  if (typeof value === 'number') return value;
  
  // Remove any non-numeric characters except dots (for decimals)
  const numericString = String(value).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(numericString);
  
  return isNaN(parsed) ? defaultValue : parsed;
};

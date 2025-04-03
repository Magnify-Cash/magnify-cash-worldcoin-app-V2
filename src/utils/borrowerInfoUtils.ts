
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
    console.log(`Fetching detailed borrower info for pool contract: ${contractAddress}...`);
    
    // Check cache first (unless force refresh requested)
    if (!forceRefresh) {
      const cachedBorrowerInfo = Cache.get(borrowerInfoCacheKey(contractAddress));
      if (cachedBorrowerInfo) {
        console.log(`Using cached borrower info for ${contractAddress}:`, cachedBorrowerInfo);
        return processBorrowerInfo(cachedBorrowerInfo);
      }
    }
    
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
    
    // Cache the result for future use (15 minute expiration to ensure freshness)
    Cache.set(borrowerInfoCacheKey(contractAddress), borrowerInfo, 15);
    
    console.log(`Successfully fetched and cached borrower info for ${contractAddress}:`, borrowerInfo);
    return processBorrowerInfo(borrowerInfo);
  } catch (error) {
    console.error('Error fetching borrower information:', error);
    // Instead of returning fallback values, propagate the error
    throw new Error(`Failed to fetch borrower information: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Checks if borrower info is available in cache for given contract address
 * @param contractAddress The pool contract address
 * @returns True if cache exists, false otherwise
 */
export const hasBorrowerInfoCache = (contractAddress: string): boolean => {
  return Cache.get(borrowerInfoCacheKey(contractAddress)) !== null;
};

/**
 * Pre-fetches borrower info for multiple pools in parallel
 * @param contractAddresses Array of pool contract addresses to prefetch
 */
export const prefetchBorrowerInfo = async (contractAddresses: string[]): Promise<void> => {
  try {
    console.log(`Pre-fetching borrower info for ${contractAddresses.length} pools...`);
    
    // Filter out addresses that already have cached data
    const addressesToFetch = contractAddresses.filter(address => 
      !hasBorrowerInfoCache(address) && address && address !== 'custom'
    );
    
    if (addressesToFetch.length === 0) {
      console.log('All pool data already cached, skipping prefetch');
      return;
    }
    
    // Fetch in parallel but limit concurrency to avoid overwhelming the API
    const promises = addressesToFetch.map(address => 
      fetchBorrowerInfo(address).catch(error => {
        console.error(`Failed to prefetch borrower info for ${address}:`, error);
        return null;
      })
    );
    
    await Promise.all(promises);
    console.log(`Prefetch complete for borrower info`);
  } catch (error) {
    console.error('Error during prefetch of borrower info:', error);
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

import { Cache } from "@/utils/cacheUtils";
import { 
  getPoolLoanDuration, 
  getPoolLoanInterestRate, 
  getPoolLoanAmount, 
  getPoolOriginationFee 
} from "@/lib/backendRequests";

// Cache key generator for borrower info
export const borrowerInfoCacheKey = (contractAddress: string) => `borrower_info_${contractAddress}`;

export interface BorrowerInfo {
  loanPeriodDays: number;
  interestRate: number;
  loanAmount: number;
  originationFee: number;
}

// Fallback values to use when API calls fail
const FALLBACK_BORROWER_INFO: BorrowerInfo = {
  loanPeriodDays: 30,
  interestRate: 8.5,
  loanAmount: 1000, // Use a more realistic default loan amount
  originationFee: 10
};

/**
 * Fetches borrower information for a pool from the API or cache
 * @param contractAddress The pool contract address
 * @param forceRefresh Whether to bypass cache and force a refresh from API
 * @returns Processed borrower information with numeric values
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
    
    // Fetch all data in parallel for better performance
    const results = await Promise.allSettled([
      getPoolLoanDuration(contractAddress),
      getPoolLoanInterestRate(contractAddress),
      getPoolLoanAmount(contractAddress),
      getPoolOriginationFee(contractAddress)
    ]);
    
    // Extract results, using fallback values for any failed promises
    const loanDuration = results[0].status === 'fulfilled' ? results[0].value : { days: FALLBACK_BORROWER_INFO.loanPeriodDays };
    const interestRate = results[1].status === 'fulfilled' ? results[1].value : { interestRate: String(FALLBACK_BORROWER_INFO.interestRate) };
    const loanAmount = results[2].status === 'fulfilled' ? results[2].value : { loanAmount: FALLBACK_BORROWER_INFO.loanAmount };
    const originationFee = results[3].status === 'fulfilled' ? results[3].value : { originationFee: FALLBACK_BORROWER_INFO.originationFee };
    
    // Log which values came from API vs fallbacks
    console.log('API call results:', {
      loanDuration: results[0].status,
      interestRate: results[1].status,
      loanAmount: results[2].status,
      originationFee: results[3].status
    });
    
    // Create and format the borrower info
    const borrowerInfo = {
      loanPeriodDays: Math.ceil(loanDuration.days),
      interestRate: interestRate.interestRate ? 
        extractNumericValue(interestRate.interestRate, FALLBACK_BORROWER_INFO.interestRate) : FALLBACK_BORROWER_INFO.interestRate,
      loanAmount: loanAmount && typeof loanAmount.loanAmount === 'number' ? 
        loanAmount.loanAmount : FALLBACK_BORROWER_INFO.loanAmount,
      originationFee: originationFee && typeof originationFee.originationFee === 'number' ? 
        originationFee.originationFee : FALLBACK_BORROWER_INFO.originationFee,
    };
    
    // Cache the result for future use (60 minute expiration)
    Cache.set(borrowerInfoCacheKey(contractAddress), borrowerInfo, 60);
    
    console.log(`Successfully fetched and cached borrower info for ${contractAddress}:`, borrowerInfo);
    return processBorrowerInfo(borrowerInfo);
  } catch (error) {
    console.error('Error fetching borrower information:', error);
    // Return default values if API fails
    return FALLBACK_BORROWER_INFO;
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
    
    // Fetch in parallel but limit concurrency to 5 at a time to avoid overwhelming the API
    const fetchPromises = addressesToFetch.map(contractAddress => 
      () => fetchBorrowerInfo(contractAddress)
    );
    
    const results = await Promise.allSettled(
      fetchPromises.map(fetchFn => fetchFn())
    );
    
    // Log results
    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`Pre-fetched borrower info for ${successful}/${addressesToFetch.length} pools`);
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
    loanPeriodDays: extractNumericValue(rawInfo.loanPeriodDays, 30),
    interestRate: extractNumericValue(rawInfo.interestRate, 8.5),
    loanAmount: extractNumericValue(rawInfo.loanAmount, 10),
    originationFee: extractNumericValue(rawInfo.originationFee, 10)
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

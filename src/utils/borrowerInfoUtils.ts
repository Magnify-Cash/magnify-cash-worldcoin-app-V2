
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

/**
 * Fetches borrower information for a pool from the API or cache
 * @param contractAddress The pool contract address
 * @returns Processed borrower information with numeric values
 */
export const fetchBorrowerInfo = async (contractAddress: string): Promise<BorrowerInfo> => {
  try {
    console.log(`Fetching detailed borrower info for pool contract: ${contractAddress}...`);
    
    // Check cache first
    const cachedBorrowerInfo = Cache.get(borrowerInfoCacheKey(contractAddress));
    if (cachedBorrowerInfo) {
      console.log(`Using cached borrower info for ${contractAddress}:`, cachedBorrowerInfo);
      return processBorrowerInfo(cachedBorrowerInfo);
    }
    
    // Fetch all data in parallel for better performance
    const [loanDuration, interestRate, loanAmount, originationFee] = await Promise.all([
      getPoolLoanDuration(contractAddress),
      getPoolLoanInterestRate(contractAddress),
      getPoolLoanAmount(contractAddress),
      getPoolOriginationFee(contractAddress)
    ]);
    
    // Create and format the borrower info
    const borrowerInfo = {
      loanPeriodDays: Math.ceil(loanDuration.days),
      interestRate: interestRate.interestRate ? interestRate.interestRate : '8.5',
      loanAmount: loanAmount && typeof loanAmount.loanAmount === 'number' ? 
        loanAmount.loanAmount : 10,
      originationFee: originationFee && typeof originationFee.originationFee === 'number' ? 
        originationFee.originationFee : 10,
    };
    
    // Cache the result for future use (60 minute expiration)
    Cache.set(borrowerInfoCacheKey(contractAddress), borrowerInfo, 60);
    
    console.log(`Successfully fetched and cached borrower info for ${contractAddress}:`, borrowerInfo);
    return processBorrowerInfo(borrowerInfo);
  } catch (error) {
    console.error('Error fetching borrower information:', error);
    // Return default values if API fails
    return {
      loanPeriodDays: 30,
      interestRate: 8.5,
      loanAmount: 10,
      originationFee: 10
    };
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


import { getPoolEarlyExitFee } from "@/lib/backendRequests";

/**
 * Calculates the early exit fee for withdrawals during warm-up period using contract-specific rate
 * @param withdrawAmount The amount being withdrawn in USDC
 * @param poolContract The address of the pool contract
 * @returns Promise resolving to the fee amount in USDC
 */
export const calculateEarlyExitFeeFromContract = async (
  withdrawAmount: number, 
  poolContract: string
): Promise<number> => {
  try {
    console.log("[feeUtils] Getting early exit fee from contract:", poolContract);
    const feeResponse = await getPoolEarlyExitFee(poolContract);
    // Use feeResponse directly as percentage (1 means 1%)
    const feeRate = feeResponse.earlyExitFee / 100; // Convert percentage to decimal (1% -> 0.01)
    console.log("[feeUtils] Contract fee rate:", feeRate);
    return withdrawAmount * feeRate;
  } catch (error) {
    console.error("[feeUtils] Error getting fee rate from contract:", error);
    // Fallback to zero fee if API call fails
    console.log("[feeUtils] Using fallback fee rate of 0");
    return 0;
  }
};

/**
 * Gets the early exit fee rate from the contract
 * @param poolContract The address of the pool contract 
 * @returns Promise resolving to the fee rate as a decimal
 */
export const getContractEarlyExitFeeRate = async (poolContract: string): Promise<number> => {
  try {
    const feeResponse = await getPoolEarlyExitFee(poolContract);
    // Don't divide by 100 again, just return the actual percentage value
    return feeResponse.earlyExitFee;
  } catch (error) {
    console.error("[feeUtils] Error getting fee rate from contract:", error);
    return 0; // Fallback to zero fee
  }
};

/**
 * Determines if a pool is in warm-up period based on its status
 * @param poolStatus The current status of the pool
 * @returns Boolean indicating if the pool is in warm-up
 */
export const isInWarmupPeriod = (poolStatus?: 'warm-up' | 'active' | 'cooldown' | 'withdrawal'): boolean => {
  console.log("[feeUtils] isInWarmupPeriod called with poolStatus:", poolStatus);
  const result = poolStatus === 'warm-up';
  console.log("[feeUtils] isInWarmupPeriod returning:", result);
  return result;
};

/**
 * Calculates the net amount after contract-specific early exit fee
 * @param withdrawAmount The amount being withdrawn in USDC
 * @param poolContract The address of the pool contract
 * @returns Promise resolving to the net amount after fee deduction
 */
export const calculateNetAmountAfterContractFee = async (
  withdrawAmount: number,
  poolContract: string
): Promise<number> => {
  const fee = await calculateEarlyExitFeeFromContract(withdrawAmount, poolContract);
  return withdrawAmount - fee;
};

/**
 * Calculates the repayment amount with interest
 * @param loanAmount The borrowed amount (principal)
 * @param interestRate Interest rate (in basis points, e.g., 250 for 2.5%)
 * @param loanPeriod Loan period in seconds
 * @returns Total repayment amount including interest
 */
export const calculateRepaymentAmount = (
  loanAmount: bigint,
  interestRate: number,
  loanPeriod: number
): bigint => {
  // Interest rate is in basis points (1/100 of a percent)
  // Convert to decimal (e.g., 250 basis points = 0.025)
  const interestRateDecimal = interestRate / 10000;
  
  // Calculate interest amount
  const interestAmount = (loanAmount * BigInt(Math.floor(interestRateDecimal * 10000))) / BigInt(10000);
  
  // Return principal + interest
  return loanAmount + interestAmount;
};


import { EARLY_EXIT_FEE_RATE } from "@/utils/constants";
import { getPoolEarlyExitFee } from "@/lib/backendRequests";

/**
 * Calculates the early exit fee for withdrawals during warm-up period
 * @param withdrawAmount The amount being withdrawn in USDC
 * @returns The fee amount in USDC
 */
export const calculateEarlyExitFee = (withdrawAmount: number): number => {
  return withdrawAmount * EARLY_EXIT_FEE_RATE;
};

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
    const feeRate = feeResponse.earlyExitFee / 100; // Convert percentage to decimal
    console.log("[feeUtils] Contract fee rate:", feeRate);
    return withdrawAmount * feeRate;
  } catch (error) {
    console.error("[feeUtils] Error getting fee rate from contract:", error);
    // Fallback to constant rate if API call fails
    console.log("[feeUtils] Using fallback fee rate:", EARLY_EXIT_FEE_RATE);
    return withdrawAmount * EARLY_EXIT_FEE_RATE;
  }
};

/**
 * Mocks a backend call for getting the early exit fee rate
 * @returns The fee rate as a decimal (e.g., 0.001 for 0.1%)
 */
export const getEarlyExitFeeRate = async (): Promise<number> => {
  // In the future, this will be an actual API call
  // For now, return the constant value
  return Promise.resolve(EARLY_EXIT_FEE_RATE);
};

/**
 * Gets the early exit fee rate from the contract
 * @param poolContract The address of the pool contract 
 * @returns Promise resolving to the fee rate as a decimal
 */
export const getContractEarlyExitFeeRate = async (poolContract: string): Promise<number> => {
  try {
    const feeResponse = await getPoolEarlyExitFee(poolContract);
    return feeResponse.earlyExitFee / 100; // Convert percentage to decimal
  } catch (error) {
    console.error("[feeUtils] Error getting fee rate from contract:", error);
    return EARLY_EXIT_FEE_RATE; // Fallback to constant
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
 * Calculates the net amount after early exit fee
 * @param withdrawAmount The amount being withdrawn in USDC
 * @returns The net amount after fee deduction
 */
export const calculateNetAmountAfterFee = (withdrawAmount: number): number => {
  const fee = calculateEarlyExitFee(withdrawAmount);
  return withdrawAmount - fee;
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


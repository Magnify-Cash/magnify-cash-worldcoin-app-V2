
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
    return feeResponse.earlyExitFee / 100; // Convert percentage to decimal (1% -> 0.01)
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

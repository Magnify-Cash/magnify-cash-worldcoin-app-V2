
import { EARLY_EXIT_FEE_RATE } from "@/utils/constants";

/**
 * Calculates the early exit fee for withdrawals during warm-up period
 * @param withdrawAmount The amount being withdrawn in USDC
 * @returns The fee amount in USDC
 */
export const calculateEarlyExitFee = (withdrawAmount: number): number => {
  return withdrawAmount * EARLY_EXIT_FEE_RATE;
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
 * Determines if a pool is in warm-up period based on its status
 * @param poolStatus The current status of the pool
 * @returns Boolean indicating if the pool is in warm-up
 */
export const isInWarmupPeriod = (poolStatus?: 'warm-up' | 'active' | 'cooldown' | 'withdrawal'): boolean => {
  return poolStatus === 'warm-up';
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


/**
 * This file contains constants for pool-specific values.
 */

/**
 * Pool APY Mapping - Maps pool IDs or addresses to specific APY values
 * This overrides the default 8.5% APY value in the display
 */

type APYMapping = {
  [key: string]: number; // Either a pool ID (number as string) or contract address
};

// Pool APY values (in percentage)
export const POOL_APY_VALUES: APYMapping = {
  // By pool ID
  "1": 10.5,
  "2": 8.5,
  "3": 12.0,
  "4": 9.2,
  // Can also use contract addresses
  "0x93dbB2d447F0086aF60B2becc66598fe3D9135A1": 11.3,
  "0xF3b2F1Bdb5f622CB08171707673252C222734Ca3": 9.8,
};

/**
 * Get the APY for a specific pool based on its ID or contract address
 * Falls back to the default 8.5% if not found
 */
export const getPoolAPY = (poolIdOrAddress: string | number, defaultAPY: number = 8.5): number => {
  const key = poolIdOrAddress.toString();
  return POOL_APY_VALUES[key] !== undefined ? POOL_APY_VALUES[key] : defaultAPY;
};

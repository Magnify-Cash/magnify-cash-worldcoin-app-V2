type APYMapping = {
  [key: string]: number;
};

// Pool APY values (in percentage)
export const POOL_APY_VALUES: APYMapping = {
  "0x75e0b3e2c5de6abeb77c3e0e143d8e6158daf4d5": 11.3,
  "0x6d92a3aaadf838ed13cb8697eb9d35fcf6c4dba9": 9.8,
};

/**
 * Get the APY for a specific pool based on its ID or contract address
 * Falls back to the default 8.5% if not found
 */
export const getPoolAPY = (poolIdOrAddress: string | number | undefined, defaultAPY: number = 8.5): number => {
  // Handle undefined or null values
  if (!poolIdOrAddress) {
    console.log("[getPoolAPY] No pool ID or address provided, returning default:", defaultAPY);
    return defaultAPY;
  }
  
  const key = poolIdOrAddress.toString().toLowerCase();
  console.log("[getPoolAPY] Looking up APY for:", key, "in mapping:", POOL_APY_VALUES);
  
  // Check if we have a mapping for this key
  if (POOL_APY_VALUES[key] !== undefined) {
    console.log("[getPoolAPY] Found APY value:", POOL_APY_VALUES[key]);
    return POOL_APY_VALUES[key];
  }
  
  console.log("[getPoolAPY] No APY found for key, returning default:", key, defaultAPY);
  return defaultAPY;
};

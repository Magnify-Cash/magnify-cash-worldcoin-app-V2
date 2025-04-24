type APYMapping = {
  [key: string]: number;
};

/**
 * * Mapping of pool IDs or contract addresses to their respective APY values.
 * @description This mapping is used to retrieve the APY for a specific pool based on its ID or contract address.
 * Change APY values here to update the APY for specific pools.
 * POOL APY
 */
export const POOL_APY_VALUES: APYMapping = {
  "0xd4f5c1e55075e8a3d2a4295431e5fe7a1c37325b": 16.0,
  "0x459fef6c1e96979de24f7f79f61c7ef874f911a1": 19.2,
  "0xfe1cc23a7d1940b3a09ae045e173dc39adaaa8c4": 19.2,
};

/**
 * Get the APY for a specific pool based on its ID or contract address
 * Falls back to the default 8.5% if not found
 */
export const getPoolAPY = (
  poolIdOrAddress: string | number | undefined,
  defaultAPY: number = 8.5
): number => {
  // Handle undefined or null values
  if (!poolIdOrAddress) {
    console.log(
      "[getPoolAPY] No pool ID or address provided, returning default:",
      defaultAPY
    );
    return defaultAPY;
  }

  const key = poolIdOrAddress.toString().toLowerCase();
  console.log(
    "[getPoolAPY] Looking up APY for:",
    key,
    "in mapping:",
    POOL_APY_VALUES
  );

  // Check if we have a mapping for this key
  if (POOL_APY_VALUES[key] !== undefined) {
    console.log("[getPoolAPY] Found APY value:", POOL_APY_VALUES[key]);
    return POOL_APY_VALUES[key];
  }

  console.log(
    "[getPoolAPY] No APY found for key, returning default:",
    key,
    defaultAPY
  );
  return defaultAPY;
};

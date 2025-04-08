type APYMapping = {
  [key: string]: number;
};

// Pool APY values (in percentage)
export const POOL_APY_VALUES: APYMapping = {
  "0x75E0B3E2c5de6Abeb77C3e0e143D8e6158Daf4d5": 11.3,
  "0x6D92A3aaADf838Ed13cB8697eb9d35fcF6c4dBa9": 9.8,
};

/**
 * Get the APY for a specific pool based on its ID or contract address
 * Falls back to the default 8.5% if not found
 */
export const getPoolAPY = (poolIdOrAddress: string | number, defaultAPY: number = 8.5): number => {
  const key = poolIdOrAddress.toString();
  return POOL_APY_VALUES[key] !== undefined ? POOL_APY_VALUES[key] : defaultAPY;
};

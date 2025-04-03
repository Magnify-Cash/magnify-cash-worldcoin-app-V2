
export const WORLDCOIN_TOKEN_COLLATERAL = "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1";
export const WORLDCOIN_CLIENT_ID = import.meta.env.VITE_WORLDCOIN_CLIENT_ID;
export const MAGNIFY_WORLD_ADDRESS = "0x2c3e09032bF439a863FC7E262D24AD45CF7f70EA" as `0x${string}`;
export const MAGNIFY_WORLD_ADDRESS_V1 = "0x4E52d9e8d2F70aD1805084BA4fa849dC991E7c88";
export const MAGNIFY_WORLD_ADDRESS_V3 = "0x2c3e09032bF439a863FC7E262D24AD45CF7f70EA" as `0x${string}`;
export const WORLDCHAIN_RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public";

// Use default fallback value for backend URL if environment variable is not available
// This helps with local development and prevents undefined URLs
const DEFAULT_BACKEND_URL = "https://dev-magnify-cash-worldid-backend.kevin8396.workers.dev";
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL;

export const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || "development";
export const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

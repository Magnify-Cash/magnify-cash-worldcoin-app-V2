import backendRequest from "@/lib/request";
import { MAX_UINT256 } from "@/utils/constants";
import { 
  BackendResponse, 
  TokenMetadata, 
  WalletData, 
  TransactionData, 
  WalletTokens,
  PreviewMintResponse,
  PreviewDepositResponse,
  LoanHistoryEntry,
  ActiveLoanData,
  PreviewWithdrawResponse,
  PreviewRedeemResponse,
  AllLoansEntry,
  PoolBalanceUSDCResponse,
  PoolTreasuryFeeResponse,
  PoolLPBalanceResponse,
  PoolActivationResponse,
  PoolLoanDurationResponse,
  PoolLoanInterestResponse,
  PoolStatusResponse,
  PoolSymbolResponse,
  PoolTierResponse,
  UserMaxDataParsed,
  UserMaxField,
  SoulboundDataResponse,
  SoulboundLoanHistoryDetailedResponse,
  SoulboundLoanHistoryResponse,
  SoulboundPoolAddressesResponse,
  SoulboundTokenURIResponse,
  SoulboundUserNFTResponse,
  PoolLiquidityResponse,
  PoolDeactivationResponse,
  PoolNameResponse,
  PoolLoanAmountResponse,
  PoolOriginationFeeResponse,
  PoolWarmupPeriodResponse,
 } from "@/utils/types";
import { ISuccessResult } from "@worldcoin/minikit-js";

export const getETHBalance = async (wallet: string): Promise<number> => {
  const response = await backendRequest<{ ethBalance: number }>("GET", "getEthBalance", { wallet });

  if (!response.data || typeof response.data.ethBalance !== "number") {
    console.error(`Invalid ETH balance response:`, response);
    return 0;
  }

  return response.data.ethBalance;
};


export const getUSDCBalance = async (wallet: string): Promise<number> => {
  const response = await backendRequest<{ usdcBalance: number }>("GET", "getUSDCBalance", { wallet });

  if (!response.data || typeof response.data.usdcBalance !== "number") {
    console.error(`Failed to fetch USDC balance. Status: ${response.status}, Message: ${response.message}`);
    return 0;
  }

  return response.data.usdcBalance;
};

export const getWalletTokens = async (wallet: string): Promise<WalletTokens[]> => {
  const response = await backendRequest<WalletTokens[]>("GET", "getWalletTokens", { wallet });

  if (!response.data || !Array.isArray(response.data)) {
    throw new Error(`Failed to fetch token balance. Status: ${response.status}, Message: ${response.message}`);
  }

  return response.data.length > 0 ? response.data : [];
};

export const getTokenMetadata = async (tokenAddress: string): Promise<TokenMetadata> => {
  const response = await backendRequest<TokenMetadata>("GET", "getTokenMetadata", { tokenAddress });

  if (!response.data || !response.data.metadata) {
    throw new Error(`Failed to fetch token metadata. Status: ${response.status}, Message: ${response.message}`);
  }

  return response.data;
};

export const checkWallet = async (wallet: string): Promise<boolean> => {
  const response = await backendRequest<{ exists: boolean }>("GET", "checkWallet", { wallet });

  if (!response.data || response.data.exists === undefined) {
    throw new Error(`Failed to fetch wallet existence. Status: ${response.status}, Message: ${response.message}`);
  }

  return response.data.exists;
};

export const saveWallet = async (wallet: string): Promise<WalletData[]> => {
  const response = await backendRequest<WalletData[]>("POST", "saveWallet", { wallet });

  if (!response.data) {
    throw new Error(`Failed to save wallet. Status: ${response.status}, Message: ${response.message}`);
  }

  return response.data;
};

export const getTransactionHistory = async (wallet: string): Promise<TransactionData[]> => {
  const response = await backendRequest<TransactionData[]>("GET", "getTransactionHistory", { wallet });

  if (!response.data) {
    throw new Error(`Failed to fetch transaction history. Status: ${response.status}, Message: ${response.message}`);
  }

  return response.data;
};

export const verify = async (
  finalPayload: ISuccessResult,
  verificationStatus: { claimAction?: string; upgradeAction?: string },
  ls_wallet: string,
  tokenId?: string
): Promise<boolean> => {
  const requestBody: Record<string, any> = {
    payload: finalPayload,
    action: verificationStatus.claimAction || verificationStatus.upgradeAction,
    signal: ls_wallet,
  };

  if (tokenId) {
    requestBody.tokenId = tokenId;
  }

  const response = await backendRequest<BackendResponse<any>>("POST", "verify", requestBody);

  if (response.status === 200) {
    return true;
  } else {
    throw new Error(`Verification failed with status: ${response.status}, Message: ${response.message}`);
  }
};

//v3 backend

export const previewMint = async (
  shares: number,
  contract: string
): Promise<PreviewMintResponse> => {
  const response = await backendRequest<PreviewMintResponse>(
    "GET",
    "v3/preview/mint",
    { shares, contract }
  );

  if (!response.data || typeof response.data.lpAmount !== "string") {
    throw new Error(
      `Failed to preview mint. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const previewDeposit = async (
  assets: number,
  contract: string
): Promise<PreviewDepositResponse> => {
  const response = await backendRequest<PreviewDepositResponse>(
    "GET",
    "v3/preview/deposit",
    { assets, contract }
  );

  if (!response.data || typeof response.data.usdcAmount !== "string") {
    throw new Error(
      `Failed to preview deposit. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const previewRedeem = async (
  shares: number,
  contract: string
): Promise<PreviewRedeemResponse> => {
  const response = await backendRequest<PreviewRedeemResponse>(
    "GET",
    "v3/preview/redeem",
    { shares, contract }
  );

  if (!response.data || typeof response.data.usdcAmount !== "string") {
    throw new Error(
      `Failed to preview redeem. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};


export const previewWithdraw = async (
  assets: number,
  contract: string
): Promise<PreviewWithdrawResponse> => {
  const response = await backendRequest<PreviewWithdrawResponse>(
    "GET",
    "v3/preview/withdraw",
    { assets, contract }
  );

  if (!response.data || typeof response.data.lpAmount !== "string") {
    throw new Error(
      `Failed to preview withdraw. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const getActiveLoan = async (
  wallet: string,
  contract: string
): Promise<ActiveLoanData> => {
  const response = await backendRequest<ActiveLoanData>(
    "GET",
    "loan/active",
    { wallet, contract }
  );

  if (!response.data || typeof response.data !== "object") {
    throw new Error(
      `Failed to fetch active loan. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

//TODO: Add type for LoanHistoryEntry
export const getLoanHistory = async (
  wallet: string,
  contract: string
): Promise<LoanHistoryEntry> => {
  const response = await backendRequest<LoanHistoryEntry>(
    "GET",
    "loan/history",
    { wallet, contract }
  );

  if (!response.data || !Array.isArray(response.data)) {
    throw new Error(
      `Failed to fetch loan history. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

//TODO: Add type for AllLoansEntry
export const getAllLoans = async (
  contract: string
): Promise<AllLoansEntry> => {
  const response = await backendRequest<AllLoansEntry>(
    "GET",
    "loans",
    { contract }
  );

  if (!response.data || !Array.isArray(response.data)) {
    throw new Error(
      `Failed to fetch all loans. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const getPoolUSDCBalance = async (
  contract: string
): Promise<PoolBalanceUSDCResponse> => {
  const response = await backendRequest<PoolBalanceUSDCResponse>(
    "GET",
    "v3/pool/balance/usdc",
    { contract }
  );

  if (
    !response.data ||
    typeof response.data.totalAssets !== "number"
  ) {
    throw new Error(
      `Failed to fetch USDC pool balance. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const getPoolTreasuryFee = async (
  contract: string
): Promise<PoolTreasuryFeeResponse> => {
  const response = await backendRequest<PoolTreasuryFeeResponse>(
    "GET",
    "v3/pool/fee/treasury",
    { contract }
  );

  if (!response.data || typeof response.data.treasuryFee !== "string") {
    throw new Error(
      `Failed to fetch treasury fee. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const getPoolLPBalance = async (
  contract: string
): Promise<PoolLPBalanceResponse> => {
  const response = await backendRequest<PoolLPBalanceResponse>(
    "GET",
    "v3/pool/balance/lp",
    { contract }
  );

  if (!response.data || typeof response.data.totalSupply !== "string") {
    throw new Error(
      `Failed to fetch LP pool balance. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const getPoolActivationDate = async (
  contract: string
): Promise<PoolActivationResponse> => {
  const response = await backendRequest<PoolActivationResponse>(
    "GET",
    "v3/pool/activation",
    { contract }
  );

  if (
    !response.data ||
    typeof response.data.timestamp !== "string" ||
    typeof response.data.formattedDate !== "string"
  ) {
    throw new Error(
      `Failed to fetch pool activation date. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const getPoolLPSymbol = async (
  contract: string
): Promise<PoolSymbolResponse> => {
  const response = await backendRequest<PoolSymbolResponse>(
    "GET",
    "v3/pool/symbol",
    { contract }
  );

  if (!response.data || typeof response.data.symbol !== "string") {
    throw new Error(
      `Failed to fetch pool LP symbol. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const getPoolTier = async (
  contract: string
): Promise<PoolTierResponse> => {
  const response = await backendRequest<PoolTierResponse>(
    "GET",
    "v3/pool/tier",
    { contract }
  );

  if (!response.data || typeof response.data.tier !== "number") {
    throw new Error(
      `Failed to fetch pool tier. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const getPoolLoanDuration = async (
  contract: string
): Promise<PoolLoanDurationResponse> => {
  const response = await backendRequest<{ loanDuration: string }>(
    "GET",
    "v3/pool/loan/duration",
    { contract }
  );

  const durationInSeconds = parseInt(response.data?.loanDuration || "0", 10);

  if (isNaN(durationInSeconds)) {
    throw new Error(
      `Invalid loan duration. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return {
    seconds: durationInSeconds,
    minutes: durationInSeconds / 60,
    hours: durationInSeconds / 3600,
    days: durationInSeconds / 86400,
  };
};

export const getPoolLoanInterestRate = async (
  contract: string
): Promise<PoolLoanInterestResponse> => {
  const response = await backendRequest<PoolLoanInterestResponse>(
    "GET",
    "v3/pool/loan/interest",
    { contract }
  );

  if (!response.data || typeof response.data.interestRate !== "string") {
    throw new Error(
      `Failed to fetch loan interest rate. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const getPoolStatus = async (
  contract: string
): Promise<PoolStatusResponse> => {
  const response = await backendRequest<PoolStatusResponse>(
    "GET",
    "v3/pool/status",
    { contract }
  );

  if (!response.data || !["isWarmup", "isActive", "isCooldown", "isExpired"].includes(response.data.status)) {
    throw new Error(
      `Invalid pool status. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const getUserMaxData = async (
  wallet: string,
  contract: string
): Promise<UserMaxDataParsed> => {
  const response = await backendRequest<{
    maxDeposit: string;
    maxMint: string;
    maxRedeem: string;
    maxWithdraw: string;
  }>("GET", "user/max/data", { wallet, contract });

  if (!response.data) {
    throw new Error(
      `Failed to fetch user max data. Status: ${response.status}, Message: ${response.message}`
    );
  }

  const parse = (hex: string): UserMaxField => {
    const value = BigInt(hex);
    return {
      hex,
      value,
      isMax: value === MAX_UINT256,
      isZero: value === 0n,
    };
  };

  return {
    maxDeposit: parse(response.data.maxDeposit),
    maxMint: parse(response.data.maxMint),
    maxRedeem: parse(response.data.maxRedeem),
    maxWithdraw: parse(response.data.maxWithdraw),
  };
};

// Soulbound NFTs

export const getSoulboundData = async (
  tokenId: number
): Promise<SoulboundDataResponse> => {
  const response = await backendRequest<SoulboundDataResponse>(
    "GET",
    "soulbound/data",
    { tokenId }
  );

  if (!response.data) {
    throw new Error(
      `Failed to fetch soulbound data. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const getSoulboundTokenURI = async (
  tokenId: number
): Promise<SoulboundTokenURIResponse> => {
  const response = await backendRequest<SoulboundTokenURIResponse>(
    "GET",
    "soulbound/uri",
    { tokenId }
  );

  if (!response.data || typeof response.data !== "string") {
    throw new Error(
      `Failed to fetch Soulbound token URI. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return { data: response.data };
};

export const getSoulboundLoanHistory = async (
  tokenId: number
): Promise<SoulboundLoanHistoryResponse> => {
  const response = await backendRequest<SoulboundLoanHistoryResponse>(
    "GET",
    "soulbound/loan/history",
    { tokenId }
  );

  if (!response.data || !Array.isArray(response.data)) {
    throw new Error(
      `Failed to fetch Soulbound loan history. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const getSoulboundLoanHistoryDetailed = async (
  tokenId: number
): Promise<SoulboundLoanHistoryDetailedResponse> => {
  const response = await backendRequest<SoulboundLoanHistoryDetailedResponse>(
    "GET",
    "soulbound/loan/history/data",
    { tokenId }
  );

  if (!response.data || !Array.isArray(response.data)) {
    throw new Error(
      `Failed to fetch detailed Soulbound loan history. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const getSoulboundUserNFT = async (
  wallet: string
): Promise<SoulboundUserNFTResponse> => {
  const response = await backendRequest<SoulboundUserNFTResponse>(
    "GET",
    "soulbound/user/nft",
    { wallet }
  );

  if (!response.data || typeof response.data.tokenId !== "string") {
    throw new Error(
      `Failed to fetch user's Soulbound token ID. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const getSoulboundPoolAddresses = async (): Promise<SoulboundPoolAddressesResponse> => {
  const response = await backendRequest<SoulboundPoolAddressesResponse>(
    "GET",
    "soulbound/pools/address"
  );

  if (!response.data || !Array.isArray(response.data)) {
    throw new Error(
      `Failed to fetch Soulbound pool addresses. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const getPoolLiquidity = async (
  contract: string
): Promise<PoolLiquidityResponse> => {
  const response = await backendRequest<PoolLiquidityResponse>(
    "GET",
    "v3/pool/liquidity",
    { contract }
  );

  if (
    !response.data ||
    typeof response.data.liquidity !== "number"
  ) {
    throw new Error(
      `Failed to fetch pool liquidity. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const getPoolName = async (
  contract: string
): Promise<PoolNameResponse> => {
  const response = await backendRequest<PoolNameResponse>(
    "GET",
    "v3/pool/name",
    { contract }
  );

  if (!response.data || typeof response.data.name !== "string") {
    throw new Error(
      `Failed to retrieve pool name. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const getPoolDeactivationDate = async (
  contract: string
): Promise<PoolDeactivationResponse> => {
  const response = await backendRequest<PoolDeactivationResponse>(
    "GET",
    "v3/pool/deactivation",
    { contract }
  );

  if (
    !response.data ||
    typeof response.data.timestamp !== "string" ||
    typeof response.data.formattedDate !== "string"
  ) {
    throw new Error(
      `Failed to fetch pool deactivation date. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const getPoolOriginationFee = async (
  contract: string
): Promise<PoolOriginationFeeResponse> => {
  const response = await backendRequest<PoolOriginationFeeResponse>(
    "GET",
    "v3/pool/fee/origination",
    { contract }
  );

  if (
    !response.data ||
    typeof response.data.originationFee !== "number"
  ) {
    throw new Error(
      `Failed to fetch origination fee. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const getPoolLoanAmount = async (
  contract: string
): Promise<PoolLoanAmountResponse> => {
  const response = await backendRequest<PoolLoanAmountResponse>(
    "GET",
    "v3/pool/loan/amount",
    { contract }
  );

  if (
    !response.data ||
    typeof response.data.loanAmount !== "number"
  ) {
    throw new Error(
      `Failed to fetch loan amount. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

export const getPoolWarmupPeriod = async (
  contract: string
): Promise<PoolWarmupPeriodResponse> => {
  const response = await backendRequest<PoolWarmupPeriodResponse>(
    "GET",
    "v3/pool/warmup",
    { contract }
  );

  if (
    !response.data ||
    typeof response.data.warmupPeriodDays !== "number"
  ) {
    throw new Error(
      `Failed to fetch warmup period. Status: ${response.status}, Message: ${response.message}`
    );
  }

  return response.data;
};

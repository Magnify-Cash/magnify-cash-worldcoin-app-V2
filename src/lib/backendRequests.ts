import backendRequest from "@/lib/request";
import { BackendResponse, TokenMetadata, WalletData, TransactionData, WalletTokens } from "@/utils/types";
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
  ls_wallet: string
): Promise<boolean> => {
  const response = await backendRequest<BackendResponse<any>>("POST", "verify", {
    payload: finalPayload,
    action: verificationStatus.claimAction || verificationStatus.upgradeAction,
    signal: ls_wallet,
  });

  if (response.status === 200) {
    return true;
  } else {
    throw new Error(`Verification failed with status: ${response.status}, Message: ${response.message}`);
  }
};
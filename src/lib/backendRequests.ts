import backendRequest from "@/lib/request";
import { BackendResponse, TokenMetadata, WalletData, TransactionData } from "@/utils/types";

export const getETHBalance = async (wallet: string): Promise<number> => {
  const response = await backendRequest<BackendResponse<{ balance: string }>>("GET", "getEthBalance", { wallet });
  if (!response?.data?.balance) throw new Error("Failed to fetch ETH balance");
  return Number(response.data.balance);
};

export const getUSDCBalance = async (wallet: string): Promise<number> => { 
  const response = await backendRequest<BackendResponse<{ balance: number }>>("GET", "getUSDCBalance", { wallet });
  if (!response?.data?.balance) throw new Error("Failed to fetch USDC balance");
  return response.data.balance;
};

export const getWalletTokens = async (wallet: string, token: string): Promise<number> => {
  const response = await backendRequest<BackendResponse<{ balance: string }>>("GET", "getWalletTokens", { wallet, token });
  if (!response?.data?.balance) throw new Error("Failed to fetch token balance");
  return Number(response.data.balance);
};

export const getTokenMetadata = async (tokenAddress: string): Promise<TokenMetadata> => {
  const response = await backendRequest<BackendResponse<TokenMetadata>>("GET", "getTokenMetadata", { tokenAddress });
  if (!response?.data?.metadata) throw new Error("Failed to fetch token metadata");
  return response.data;
};

export const checkWallet = async (wallet: string): Promise<boolean> => {
  const response = await backendRequest<BackendResponse<{ exists: boolean }>>("GET", "checkWallet", { wallet });
  if (response?.data?.exists === undefined) throw new Error("Failed to fetch wallet existence");
  return response.data.exists;
};

export const saveWallet = async (wallet: string): Promise<WalletData[]> => {
  const response = await backendRequest<BackendResponse<WalletData[]>>("POST", "saveWallet", { wallet });
  if (!response?.data) throw new Error("Failed to save wallet");
  return response.data;
};

export const getTransactionHistory = async (wallet: string): Promise<TransactionData[]> => {
  const response = await backendRequest<BackendResponse<TransactionData[]>>("GET", "getTransactionHistory", { wallet });
  if (!response?.data) throw new Error("Failed to fetch transaction history");
  return response.data;
};
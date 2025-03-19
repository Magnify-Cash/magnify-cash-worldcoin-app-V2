export interface BackendResponse<T> {
  status: number;
  message: string;
  data: T;
}
  
export interface TokenMetadata {
  metadata: {
    tokenName: string;
    tokenSymbol: string;
    tokenDecimals: number;
  };
}

export interface WalletTokens {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenBalance: number;
}

export interface WalletData {
  id: string;
  wallet: string;
  notification: boolean;
  created_at: string;
}

export interface TransactionData {
  transactionHash: string;
  blockNumber: string;
  from: string;
  to: string;
  amount: string;
  timestamp: string;
  status: string;
}

export interface RequestParams {
  [key: string]: string | number | boolean;
}

export type HttpMethod = "GET" | "POST";
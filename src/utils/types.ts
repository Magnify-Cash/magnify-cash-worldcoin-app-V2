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
  [key: string]: string | number | boolean | Record<string, any>;
}

export type HttpMethod = "GET" | "POST";

export interface PreviewMintResponse {
  lpAmount: number;
}

export interface PreviewDepositResponse {
  lpAmount: number;
}

export interface PreviewRedeemResponse {
  usdcAmount: number;
}

export interface PreviewWithdrawResponse {
  lpAmount: number;
}

export interface ActiveLoanData {
  loanID: string;
  tokenId: string;
  loanTimestamp: string;
  repaymentTimestamp: string;
  borrower: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface LoanEntry {
  loanID: string;
  tokenId: string;
  loanTimestamp: string;
  repaymentTimestamp: string;
  borrower: string;
  isDefault: boolean;
  isActive: boolean;
}

export type LoanHistoryEntry = LoanEntry[];

export type AllLoansEntry = LoanEntry[];

export interface PoolBalanceUSDCResponse {
  totalAssets: number;
}

export interface PoolTreasuryFeeResponse {
  treasuryFee: string;
}

export interface PoolLPBalanceResponse {
  totalSupply: string;
}

export interface PoolActivationResponse {
  timestamp: string;
  formattedDate: string;
}

export interface PoolSymbolResponse {
  symbol: string;
}

export interface PoolTierResponse {
  tier: number;
}

export interface PoolLoanDurationResponse {
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
}

export interface PoolLoanInterestResponse {
  interestRate: string;
}

export type PoolStatusType = "isWarmup" | "isActive" | "isCooldown" | "isExpired";

export interface PoolStatusResponse {
  status: PoolStatusType;
}

export interface UserMaxField {
  hex: string;
  value: bigint;
  isMax: boolean;
  isZero: boolean;
}

export interface UserMaxDataParsed {
  maxDeposit: UserMaxField;
  maxMint: UserMaxField;
  maxRedeem: UserMaxField;
  maxWithdraw: UserMaxField;
}

export interface SoulboundDataResponse {
  loansRepaid: string;
  interestPaid: string;      
  loansDefaulted: string;
  owner: string;
  tier: number;
  hasActiveLoan: boolean;
  ongoingLoan: boolean;
  loan?: {
    version: string;
    amount: number;
    startTime: number;
    isActive: boolean;
    interestRate: number;
    loanPeriod: number;
  };
  tiers?: Array<{
    loanAmount: number;
    interestRate: number;
    loanPeriod: number;
    tierId: number;
    verificationStatus?: {
      description: string;
    };
  }>;
}

export interface SoulboundTokenURIResponse {
  data: string;
}

export interface SoulboundLoanHistoryResponse {
  data: any
}

export interface SoulboundLoanHistoryDetailedResponse {
  data: any
}

export interface SoulboundUserNFTResponse {
  tokenId: string; 
}

export type SoulboundPoolAddressesResponse = string[];

export interface PoolLiquidityResponse {
  liquidity: number;
}

export interface PoolNameResponse {
  name: string;
}

export interface PoolDeactivationResponse {
  timestamp: string;
  formattedDate: string;
}

export interface PoolOriginationFeeResponse {
  originationFee: number;
}

export interface PoolLoanAmountResponse {
  loanAmount: number;
}

export interface PoolWarmupPeriodResponse {
  warmupPeriodDays: number; 
}

export interface UserLPBalanceResponse {
  balance: number;
}

export interface LPTokenHistoryResponse {
  token_price: number;
  timestamp: string;
  date: string;
}

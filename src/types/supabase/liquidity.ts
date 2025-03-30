
export interface LiquidityPool {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  token_a: string;
  token_b: string;
  token_a_amount: number;
  token_b_amount: number;
  apy: number;
  total_value_locked: number;
  available_liquidity: number;
  status: 'warm-up' | 'active' | 'cooldown' | 'withdrawal';
  contract_address?: string;
  metadata?: {
    description?: string;
    minDeposit?: number;
    maxDeposit?: number;
    lockDurationDays?: number;
    activationTimestamp?: string;
    activationFormattedDate?: string;
    deactivationTimestamp?: string;
    deactivationFormattedDate?: string;
    symbol?: string;
  };
  borrower_info?: {
    loanPeriodDays?: number;
    interestRate?: string;
    loanAmount?: string;
    originationFee?: string;
    warmupPeriod?: string;
  };
}

export interface UserPoolPosition {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  pool_id: number;
  token_a_amount: number;
  token_b_amount: number;
  total_value_locked: number;
}

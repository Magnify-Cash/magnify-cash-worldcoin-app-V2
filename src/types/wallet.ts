
export interface WalletBalance {
  id: number;
  currency: string;
  symbol: string;
  balance: string;
  updated_at: string;
  user_id?: string;
}

export interface Transaction {
  id: number;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'loan' | 'repayment';
  currency: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

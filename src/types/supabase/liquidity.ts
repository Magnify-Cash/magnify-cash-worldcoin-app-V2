
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
  status: 'warm-up' | 'active' | 'completed';
  metadata?: Record<string, any>;
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


// Types related to user data, balances, and positions
export interface UserPositionData {
  balance: number;
  currentValue: number;
  loading: boolean;
  error: string | null;
}

export interface DetailedUserPositionData extends UserPositionData {
  depositedValue?: number;
  yield?: number;
  yieldPercentage?: number;
}


export interface Loan {
  id: number;
  loan_amount: number;
  amount_due: number;
  interest_rate: number;
  loan_start_date: string;
  loan_end_date: string;
  status?: string;
  user_id?: string;
  token_id?: number;
}

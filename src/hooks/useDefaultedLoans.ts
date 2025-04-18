
import { useCallback, useEffect, useState } from "react";
import { 
  getUserDefaultedLoanPoolData, 
  getUserDefaultedLoanPoolStatus, 
  getSoulboundPoolAddresses, 
  getPoolPenaltyFee,
  getPoolLoanAmount,
  getPoolLoanInterestRate
} from "@/lib/backendRequests";

export interface DefaultedLoanData {
  poolAddress: string;
  loanID: string;
  tokenId: string;
  loanTimestamp: string;
  repaymentTimestamp: string;
  borrower: string;
  isDefault: boolean;
  isActive: boolean;
  // New fields for loan details
  loanAmount: number;
  interestRate: number;
  interestAmount: number;
  penaltyFee: number;
  penaltyAmount: number;
  totalDueAmount: number;
}

export function useDefaultedLoans(walletAddress: string) {
  const [defaultedLoans, setDefaultedLoans] = useState<DefaultedLoanData[]>([]);
  const [hasDefaultedLoan, setHasDefaultedLoan] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDefaultedLoans = useCallback(async () => {
    if (!walletAddress) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get all pool addresses first
      const poolAddresses = await getSoulboundPoolAddresses();
      console.log("[useDefaultedLoans] Found pool addresses:", poolAddresses);

      const defaultedLoansData: DefaultedLoanData[] = [];
      let hasAnyDefaultedLoan = false;

      // Check each pool in parallel
      await Promise.all(
        poolAddresses.map(async (poolAddress) => {
          try {
            // First check if user has a defaulted loan in this pool (faster check)
            const defaultStatus = await getUserDefaultedLoanPoolStatus(walletAddress, poolAddress);
            
            if (defaultStatus.hasDefaultedLoan) {
              hasAnyDefaultedLoan = true;
              
              // Get detailed information about the defaulted loan
              const loanData = await getUserDefaultedLoanPoolData(walletAddress, poolAddress);
              
              // Fetch loan amount for this pool
              let loanAmount = 0;
              try {
                const loanAmountResponse = await getPoolLoanAmount(poolAddress);
                loanAmount = loanAmountResponse.loanAmount;
                console.log(`[useDefaultedLoans] Loan amount for pool ${poolAddress}:`, loanAmount);
              } catch (loanAmountErr) {
                console.error(`[useDefaultedLoans] Error fetching loan amount for pool ${poolAddress}:`, loanAmountErr);
              }
              
              // Fetch interest rate for this pool
              let interestRate = 0;
              try {
                const interestRateResponse = await getPoolLoanInterestRate(poolAddress);
                interestRate = parseFloat(interestRateResponse.interestRate);
                console.log(`[useDefaultedLoans] Interest rate for pool ${poolAddress}:`, interestRate);
              } catch (interestErr) {
                console.error(`[useDefaultedLoans] Error fetching interest rate for pool ${poolAddress}:`, interestErr);
              }
              
              // Fetch penalty fee for this pool
              let penaltyFee = 0;
              try {
                const penaltyFeeResponse = await getPoolPenaltyFee(poolAddress);
                penaltyFee = Number(penaltyFeeResponse.defaultPenalty);
                console.log(`[useDefaultedLoans] Penalty fee for pool ${poolAddress}:`, penaltyFee);
              } catch (penaltyErr) {
                console.error(`[useDefaultedLoans] Error fetching penalty fee for pool ${poolAddress}:`, penaltyErr);
              }
              
              // Calculate interest amount
              const interestAmount = loanAmount * (interestRate / 100);
              
              // Calculate penalty amount
              const penaltyAmount = loanAmount * (penaltyFee / 100);
              
              // Calculate total due amount
              const totalDueAmount = loanAmount + interestAmount + penaltyAmount;
              
              console.log(`[useDefaultedLoans] Calculated amounts for ${poolAddress}:`, {
                loanAmount,
                interestRate,
                interestAmount,
                penaltyFee,
                penaltyAmount,
                totalDueAmount
              });
              
              defaultedLoansData.push({
                ...loanData,
                poolAddress,
                loanAmount,
                interestRate,
                interestAmount,
                penaltyFee,
                penaltyAmount,
                totalDueAmount
              });
            }
          } catch (err) {
            console.error(`[useDefaultedLoans] Error checking pool ${poolAddress}:`, err);
          }
        })
      );

      setDefaultedLoans(defaultedLoansData);
      setHasDefaultedLoan(hasAnyDefaultedLoan);
    } catch (err) {
      console.error("[useDefaultedLoans] Error fetching defaulted loans:", err);
      setError("Failed to fetch defaulted loan information");
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchDefaultedLoans();
  }, [fetchDefaultedLoans]);

  return {
    defaultedLoans,
    hasDefaultedLoan,
    isLoading,
    error,
    refetch: fetchDefaultedLoans
  };
}

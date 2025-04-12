
import { useCallback, useEffect, useState } from "react";
import { getUserDefaultedLoanPoolData, getUserDefaultedLoanPoolStatus, getSoulboundPoolAddresses } from "@/lib/backendRequests";

export interface DefaultedLoanData {
  poolAddress: string;
  loanID: string;
  tokenId: string;
  loanTimestamp: string;
  repaymentTimestamp: string;
  borrower: string;
  isDefault: boolean;
  isActive: boolean;
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
              defaultedLoansData.push({
                ...loanData,
                poolAddress
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

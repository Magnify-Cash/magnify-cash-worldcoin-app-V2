
import { useDemoData } from "@/providers/DemoDataProvider";
import { VERIFICATION_TIERS, VerificationTier, Tier } from "@/hooks/useMagnifyWorld";
import { useEffect, useState } from "react";

// This hook replaces the useMagnifyWorld hook with demo data
export function useDemoMagnifyWorld(walletAddress: `0x${string}`) {
  const { demoData, isLoading, resetSession } = useDemoData();
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Reset error state when dependencies change
    setIsError(false);
  }, [walletAddress, demoData]);

  // Simple refetch function that just resets error state
  const refetch = () => {
    setIsError(false);
  };

  return {
    data: demoData.contractData, // Now this property exists
    isLoading,
    isError,
    refetch,
    resetSession
  };
}

// Demo version of useRequestLoan hook
export function useDemoRequestLoan() {
  const { requestLoan, isLoading } = useDemoData(); // requestLoan now exists
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [loanDetails, setLoanDetails] = useState<{
    amount: number;
    duration: number;
    transactionId: string;
  } | null>(null);

  const requestNewLoan = async (requestedTierId: bigint) => {
    setError(null);
    setTransactionId(null);
    setIsConfirmed(false);
    setLoanDetails(null);
    setIsConfirming(true);

    try {
      const txId = await requestLoan(Number(requestedTierId));
      setTransactionId(txId);
      setIsConfirming(false);
      setIsConfirmed(true);
      setLoanDetails({
        amount: 1000, // Mock value
        duration: 30, // Mock value
        transactionId: txId
      });
    } catch (err) {
      setError(`Transaction failed: ${(err as Error).message}`);
      setIsConfirming(false);
    }
  };

  return {
    requestNewLoan,
    error,
    transactionId,
    isConfirming: isLoading || isConfirming,
    isConfirmed,
    loanDetails
  };
}

// Demo version of useRepayLoan hook
export function useDemoRepayLoan() {
  const { repayLoan, isLoading } = useDemoData(); // repayLoan now exists
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [loanDetails, setLoanDetails] = useState<{
    amount: number;
    interest: number;
    totalDue: number;
    transactionId: string;
  } | null>(null);

  const repayLoanWithPermit2 = async (loanAmount: string, V1OrV2: string) => {
    setError(null);
    setTransactionId(null);
    setIsConfirmed(false);
    setLoanDetails(null);
    setIsConfirming(true);

    try {
      const txId = await repayLoan(loanAmount);
      setTransactionId(txId);
      setIsConfirming(false);
      setIsConfirmed(true);
      
      const amount = parseFloat(loanAmount);
      const interest = amount * 0.025; // 5% interest for demo
      
      setLoanDetails({
        amount,
        interest,
        totalDue: amount + interest,
        transactionId: txId
      });
    } catch (err) {
      setError(`Transaction failed: ${(err as Error).message}`);
      setIsConfirming(false);
    }
  };

  return {
    repayLoanWithPermit2,
    error,
    transactionId,
    isConfirming: isLoading || isConfirming,
    isConfirmed,
    loanDetails
  };
}

// Demo version of useUSDCBalance hook
export function useDemoUSDCBalance() {
  const { demoData, isLoading, refreshBalance } = useDemoData(); // refreshBalance now exists
  
  return {
    usdcBalance: demoData.usdcBalance,
    hasMoreThanOne: demoData.usdcBalance > 1,
    loading: isLoading,
    error: null,
    refreshBalance
  };
}

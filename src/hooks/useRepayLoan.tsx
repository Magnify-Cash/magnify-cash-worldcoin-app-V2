
import { useState } from "react";
import { useDemoData } from "@/providers/DemoDataProvider";

// A simplified hook for demo loan repayment
const useRepayLoan = () => {
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { repayLoan, finalizeLoanRepayment } = useDemoData();

  const repayLoanWithPermit2 = async (amount: string) => {
    try {
      setIsConfirming(true);
      setError(null);
      setTransactionId(null);
      setIsConfirmed(false);

      // Generate transaction ID immediately so UI can show it
      const txId = `tx-${Math.random().toString(36).substring(2, 10)}`;
      setTransactionId(txId);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Process the repayment
      await repayLoan(amount);
      
      // Simulate confirmation delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mark as confirmed after the delay
      setIsConfirmed(true);
      
      // Update the loan status to inactive after confirmation
      await new Promise(resolve => setTimeout(resolve, 1000));
      finalizeLoanRepayment();
      
      setIsConfirming(false);
      return txId;
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err?.message || "Unknown error"));
      setIsConfirming(false);
      throw err;
    }
  };

  return {
    repayLoanWithPermit2,
    transactionId,
    isConfirming,
    isConfirmed,
    error
  };
};

export default useRepayLoan;

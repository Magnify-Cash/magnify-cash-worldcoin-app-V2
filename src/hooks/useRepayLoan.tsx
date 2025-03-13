
import { useState } from "react";
import { useDemoData } from "@/providers/DemoDataProvider";

// A simplified hook for demo loan repayment
const useRepayLoan = () => {
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { repayLoan, finalizeLoanRepayment } = useDemoData();

  // Helper function to generate Ethereum-style transaction hash
  const generateEthereumTxHash = (): string => {
    const characters = '0123456789abcdef';
    let hash = '0x';
    
    // Generate 64 character hex string
    for (let i = 0; i < 64; i++) {
      hash += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return hash;
  };

  const repayLoanWithPermit2 = async (amount: string) => {
    try {
      setIsConfirming(true);
      setError(null);
      setTransactionId(null);
      setIsConfirmed(false);

      // Generate Ethereum-style transaction hash
      const txId = generateEthereumTxHash();
      setTransactionId(txId);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Process the repayment
      await repayLoan(amount);
      
      // Simulate confirmation delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mark as confirmed after the delay
      setIsConfirmed(true);
      
      // Immediately mark the loan as repaid in the data store
      // This is the key change to fix the bug
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
    error,
    finalizeLoanRepayment // Still export this in case it's needed elsewhere
  };
};

export default useRepayLoan;

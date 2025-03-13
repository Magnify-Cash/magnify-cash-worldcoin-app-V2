
import { useState } from "react";
import { useDemoData } from "@/providers/DemoDataProvider";

// A simplified hook for demo loan requests
const useRequestLoan = () => {
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { requestLoan } = useDemoData();

  const requestNewLoan = async (tierId: number) => {
    try {
      setIsConfirming(true);
      setError(null);
      
      // Simulate network delay
      const txId = await requestLoan(tierId);
      
      // Set transaction ID
      setTransactionId(txId);
      
      // Simulate confirmation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsConfirmed(true);
      setIsConfirming(false);
      return txId;
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err?.message || "Unknown error"));
      setIsConfirming(false);
      throw err;
    }
  };

  return {
    requestNewLoan,
    transactionId,
    isConfirming,
    isConfirmed,
    error
  };
};

export default useRequestLoan;

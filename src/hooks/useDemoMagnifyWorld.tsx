import { useDemoData } from "@/providers/DemoDataProvider";
import { useEffect, useState } from "react";

// This hook replaces the useMagnifyWorld hook with demo data
export function useDemoMagnifyWorld(walletAddress: `0x${string}`) {
  const { demoData, isLoading, resetSession } = useDemoData();
  const [isError, setIsError] = useState(false);

  // Create loan data based on verification tier
  const getLoanData = () => {
    if (!demoData.hasLoan) return null;
    
    const tierId = demoData.contractData.nftInfo.tier?.tierId || "0";
    const tierIdNumber = Number(tierId);
    
    // Default values
    let loanAmount = 1n * 1000000n; // 1 USDC
    let interestRate = 250n; // 2.5%
    let loanPeriod = 2592000n; // 30 days
    
    // Set loan terms based on tier - giving Device users (tier 1) the same terms as Orb users (tier 2)
    if (tierIdNumber === 1 || tierIdNumber === 2 || tierIdNumber === 3) {
      loanAmount = 10n * 1000000n; // 10 USDC for both Device and Orb users
      interestRate = 250n; // 2.5%
      loanPeriod = 2592000n; // 30 days
    }

    return [
      "v2", // Version of the loan
      {
        amount: loanAmount,
        startTime: BigInt(Math.floor(Date.now() / 1000) - 60 ), // 1 minute ago
        isActive: true,
        interestRate: interestRate,
        loanPeriod: loanPeriod
      }
    ];
  };

  useEffect(() => {
    // Reset error state when dependencies change
    setIsError(false);
  }, [walletAddress, demoData]);

  // Simple refetch function that just resets error state
  const refetch = () => {
    setIsError(false);
  };

  // Create a contract data object that mimics the real data structure
  const contractData = {
    ...demoData.contractData,
    loan: getLoanData(),
    allTiers: {
      1: {
        tierId: 1n,
        loanAmount: 10000000n, // 10 USDC (increased from 1 USDC) to match tier 2
        interestRate: 250n, // 2.5%
        loanPeriod: 2592000n, // 30 days
        verificationStatus: {
          level: "DEVICE",
          verification_level: "device",
          description: "Device Verified Tier"
        }
      },
      2: {
        tierId: 2n,
        loanAmount: 10000000n, // 10 USDC
        interestRate: 250n, // 2.5%
        loanPeriod: 2592000n, // 30 days
        verificationStatus: {
          level: "ORB",
          verification_level: "orb",
          description: "Orb Verified Tier"
        }
      }
    }
  };

  return {
    data: contractData,
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
      const interest = amount * 0.025; // 2.5% interest for demo
      
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

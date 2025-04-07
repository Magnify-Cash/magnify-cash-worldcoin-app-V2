import { useCallback, useState, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { WORLDCOIN_CLIENT_ID, MAGNIFY_WORLD_ADDRESS, MAGNIFY_WORLD_ADDRESS_V1 } from "@/utils/constants";
import { magnifyV1Abi } from "@/utils/magnifyV1Abi";
import { magnifyV2Abi } from "@/utils/magnifyV2Abi";

// Mock readContract function if needed
const readContract = async ({ address, abi, functionName, args }) => {
  console.log(`Mock readContract call to ${address}.${functionName} with args:`, args);
  // Return mock data based on function name
  if (functionName === "userNFT") {
    return BigInt(1); // example tokenId
  }
  if (functionName === "loans") {
    return [BigInt(100), BigInt(Date.now()), true, BigInt(500), BigInt(2592000)]; // example loan data
  }
  // Add more mock implementations as needed
  return null;
};

export interface ActiveLoan {
  loanAmount: number;
  startTimestamp: number;
  isActive: boolean;
  interestRate: number;
  loanPeriod: number;
}

export interface MagnifyWorldResponse {
  hasNFT: boolean;
  activeLoanV1: ActiveLoan | null;
  activeLoanV2: ActiveLoan | null;
  requestLoanV1: () => Promise<void>;
  requestLoanV2: () => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

const useMagnifyWorld = (): MagnifyWorldResponse => {
  const [hasNFT, setHasNFT] = useState<boolean>(false);
  const [activeLoanV1, setActiveLoanV1] = useState<ActiveLoan | null>(null);
  const [activeLoanV2, setActiveLoanV2] = useState<ActiveLoan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const checkUserNFT = useCallback(async (address: string) => {
    try {
      // Mock implementation - replace with actual contract interaction
      const tokenId = await readContract({
        address: MAGNIFY_WORLD_ADDRESS_V1,
        abi: magnifyV1Abi,
        functionName: "userNFT",
        args: [address],
      });

      setHasNFT(tokenId !== null);
      return tokenId !== null;
    } catch (err) {
      console.error("Error checking user NFT", err);
      setError(`Error checking NFT: ${(err as Error).message}`);
      return false;
    }
  }, []);

  const fetchLoanData = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock implementation - replace with actual contract interaction
      const loanData = await readContract({
        address: MAGNIFY_WORLD_ADDRESS_V1,
        abi: magnifyV1Abi,
        functionName: "loans",
        args: [1], // Assuming tokenId is 1 for simplicity
      });

      if (loanData && loanData[2]) {
        setActiveLoanV1({
          loanAmount: Number(loanData[0]),
          startTimestamp: Number(loanData[1]),
          isActive: loanData[2],
          interestRate: Number(loanData[3]),
          loanPeriod: Number(loanData[4]),
        });
      } else {
        setActiveLoanV1(null);
      }
    } catch (err) {
      console.error("Error fetching loan data", err);
      setError(`Error fetching loan: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestLoanV1 = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Mock implementation - replace with actual MiniKit transaction
      console.log("Requesting loan from V1 contract...");
      // const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      //   transaction: [
      //     {
      //       address: MAGNIFY_WORLD_ADDRESS_V1 as `0x${string}`,
      //       abi: magnifyV1Abi,
      //       functionName: "requestLoan",
      //       args: [],
      //     },
      //   ],
      // });

      // if (finalPayload.status === "success") {
      //   console.log("Loan requested successfully", finalPayload);
      // } else {
      //   console.error("Error requesting loan", finalPayload);
      //   setError(
      //     finalPayload.error_code === "user_rejected"
      //       ? `User rejected transaction`
      //       : `Transaction failed`
      //   );
      // }
    } catch (err) {
      console.error("Error sending transaction", err);
      setError(`Transaction failed: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestLoanV2 = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Mock implementation - replace with actual MiniKit transaction
      console.log("Requesting loan from V2 contract...");
      // const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      //   transaction: [
      //     {
      //       address: MAGNIFY_WORLD_ADDRESS as `0x${string}`,
      //       abi: magnifyV2Abi,
      //       functionName: "requestLoan",
      //       args: [],
      //     },
      //   ],
      // });

      // if (finalPayload.status === "success") {
      //   console.log("Loan requested successfully", finalPayload);
      // } else {
      //   console.error("Error requesting loan", finalPayload);
      //   setError(
      //     finalPayload.error_code === "user_rejected"
      //       ? `User rejected transaction`
      //       : `Transaction failed`
      //   );
      // }
    } catch (err) {
      console.error("Error sending transaction", err);
      setError(`Transaction failed: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Replace with actual address retrieval logic
    const userAddress = "0x123...";

    if (userAddress) {
      checkUserNFT(userAddress);
      fetchLoanData(userAddress);
    }
  }, [checkUserNFT, fetchLoanData]);

  return {
    hasNFT,
    activeLoanV1,
    activeLoanV2,
    requestLoanV1,
    requestLoanV2,
    error,
    isLoading,
  };
};

export default useMagnifyWorld;

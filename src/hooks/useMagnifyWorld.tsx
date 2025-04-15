
import { useEffect, useState, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import { getSoulboundUserNFT, getSoulboundData, getSoulboundPoolAddresses, getPoolLoanAmount, getPoolLoanInterestRate, getPoolLoanDuration, getActiveLoan } from "@/lib/backendRequests";
import { readContract } from "@wagmi/core";
import { config } from "@/providers/Wagmi";
import {
  MAGNIFY_WORLD_ADDRESS_V3,
  MAGNIFY_WORLD_ADDRESS_V1,
  MAGNIFY_WORLD_ADDRESS,
} from "@/utils/constants";
import { fetchLoanInfo } from "@/lib/v1LoanRequests";
import { magnifyV1Abi } from "@/utils/magnifyV1Abi";
import { magnifyV2Abi } from "@/utils/magnifyV2Abi";

export const VERIFICATION_TIERS: Record<"NONE" | "ORB", VerificationTier> = {
  NONE: {
    level: "NONE",
    description: "Not Verified",
    color: "text-gray-500",
    message: "You have not been verified yet.",
    claimAction: "",
    upgradeAction: "mint-orb-verified-nft",
    verification_level: "none",
  },
  ORB: {
    level: "ORB",
    description: "Orb Verified",
    color: "text-brand-success",
    message: "You're fully verified and eligible for maximum loan amounts!",
    claimAction: "mint-orb-verified-nft",
    upgradeAction: "",
    verification_level: "orb",
  },
};

export type VerificationLevel = keyof typeof VERIFICATION_TIERS;

export interface VerificationTier {
  level: VerificationLevel;
  description: string;
  color: string;
  message: string;
  claimAction: string;
  upgradeAction: string;
  verification_level: string;
}

export interface SoulboundNFT {
  tokenId: string | null;
  tier: number | null;
  verificationStatus: VerificationTier;
  interestPaid: string;
  loansDefaulted: string;
  loansRepaid: string;
  ongoingLoan: boolean;
  owner: string | null;
}

export interface Loan {
  amount: bigint;
  startTime: number;
  isActive: boolean;
  interestRate: bigint;
  loanPeriod: bigint;
  poolAddress?: string; // Add pool address field for V3 loans
}

export interface ContractData {
  nftInfo: SoulboundNFT;
  hasActiveLoan: boolean;
  loan?: [string, Loan];
  allTiers?: Array<{
    loanAmount: number;
    interestRate: number;
    loanPeriod: number;
    tierId: number;
    verificationStatus?: {
      description: string;
    };
  }>;
}

let globalCache: Record<string, ContractData> = {};

export function invalidateCache(walletAddress: `0x${string}`) {
  delete globalCache[walletAddress];
}

export function useMagnifyWorld(walletAddress: `0x${string}`): {
  data: ContractData | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<ContractData | null>(globalCache[walletAddress] || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    if (!walletAddress) return;

    let loanData: [string, Loan] | undefined = undefined;

    const checkLegacyLoans = async (): Promise<[string, Loan] | null> => {
      try {
        const loanIds = (await readContract(config, {
          address: MAGNIFY_WORLD_ADDRESS_V1,
          abi: magnifyV1Abi,
          functionName: "fetchLoansByAddress",
          args: [walletAddress],
        })) as bigint[];

        if (loanIds.length > 0) {
          const latestLoanId = loanIds[loanIds.length - 1];
          const loanInfo = await fetchLoanInfo(MAGNIFY_WORLD_ADDRESS_V1, latestLoanId);
          
          // Calculate interest rate as percentage
          const amountBorrowed = Number(loanInfo.amountBorrowed);
          const totalDue = Number(loanInfo.totalDue);
          const interestRate = ((totalDue - amountBorrowed) / amountBorrowed) * 100;
          
          const now = BigInt(Math.floor(Date.now() / 1000));
          const isActive = now < loanInfo.dueDate;
          
          return [
            "V1",
            {
              amount: loanInfo.amountBorrowed,
              startTime: Number(loanInfo.dueDate) - (30 * 24 * 60 * 60), // Assuming 30-day loans
              isActive,
              interestRate: BigInt(Math.round(interestRate * 100)), // Convert to basis points
              loanPeriod: BigInt(30 * 24 * 60 * 60), // 30 days in seconds
              poolAddress: MAGNIFY_WORLD_ADDRESS_V1,
            },
          ];
        }
      } catch (err) {
        console.warn("[useMagnifyWorld] Error checking V1 loan:", err);
      }

      try {
        const result = await readContract(config, {
          address: MAGNIFY_WORLD_ADDRESS,
          abi: magnifyV2Abi,
          functionName: "fetchLoanByAddress",
          args: [walletAddress],
        });

        const [loanVersion, rawLoan] = result as [string, any];
        if (rawLoan?.isActive === true) {
          return [
            loanVersion,
            {
              amount: BigInt(rawLoan.amount),
              startTime: Number(rawLoan.startTime),
              isActive: rawLoan.isActive,
              interestRate: BigInt(rawLoan.interestRate),
              loanPeriod: BigInt(rawLoan.loanPeriod),
            },
          ];
        }
      } catch (err) {
        console.warn("[useMagnifyWorld] Error checking V2 loan:", err);
      }

      return null;
    };

    // Check for V3 loans by querying the backend API
    const checkV3Loans = async (): Promise<[string, Loan] | null> => {
      try {
        console.log("[useMagnifyWorld] Checking V3 loans via backend API");
        const poolAddressesResponse = await getSoulboundPoolAddresses();
        
        if (!poolAddressesResponse || !Array.isArray(poolAddressesResponse)) {
          console.warn("[useMagnifyWorld] Failed to get pool addresses");
          return null;
        }
        
        for (const contractAddress of poolAddressesResponse) {
          try {
            const activeLoanData = await getActiveLoan(walletAddress, contractAddress);
            
            if (activeLoanData && activeLoanData.isActive) {
              console.log(`[useMagnifyWorld] Found active V3 loan on contract ${contractAddress}:`, activeLoanData);
              
              // Get loan amount and interest rate from pool
              const loanAmountResponse = await getPoolLoanAmount(contractAddress);
              const interestRateResponse = await getPoolLoanInterestRate(contractAddress);
              const loanDurationResponse = await getPoolLoanDuration(contractAddress);
              
              const amount = BigInt(Math.round((loanAmountResponse?.loanAmount || 0) * 1e6)); // Convert to micros
              const interestRate = BigInt(
                interestRateResponse?.interestRate ? 
                Number(interestRateResponse.interestRate) * 100 : 0
              ); // Convert to basis points (e.g., 5% = 500)
              const loanPeriod = BigInt(loanDurationResponse?.seconds || 0);
              const startTime = Number(activeLoanData.loanTimestamp) || 0;
              
              return [
                "V3",
                {
                  amount,
                  startTime,
                  isActive: true,
                  interestRate,
                  loanPeriod,
                  poolAddress: contractAddress, // Store the pool address for V3 loans
                },
              ];
            }
          } catch (err) {
            console.warn(`[useMagnifyWorld] Error checking contract ${contractAddress}:`, err);
          }
        }
      } catch (err) {
        console.warn("[useMagnifyWorld] Error checking V3 loans:", err);
      }
      
      return null;
    };

    try {
      setIsLoading(true);
      setIsError(false);

      let tierData = null;

      // Check for V1/V2 loans first
      const legacyLoan = await checkLegacyLoans();
      if (legacyLoan) loanData = legacyLoan;

      // If no legacy loan, check for V3 loans
      if (!loanData) {
        const v3Loan = await checkV3Loans();
        if (v3Loan) {
          loanData = v3Loan;
          console.log("[useMagnifyWorld] Using V3 loan:", loanData);
        }
      }

      const nftResponse = await getSoulboundUserNFT(walletAddress);

      let soulboundNFT: SoulboundNFT = {
        tokenId: null,
        tier: null,
        verificationStatus: VERIFICATION_TIERS.NONE,
        interestPaid: "0",
        loansDefaulted: "0",
        loansRepaid: "0",
        ongoingLoan: false,
        owner: null,
      };

      if (nftResponse && nftResponse.tokenId !== "0") {
        const tokenId = parseInt(nftResponse.tokenId);
        const nftData = await getSoulboundData(tokenId);

        soulboundNFT = {
          tokenId: nftResponse.tokenId,
          tier: nftData.tier || null,
          verificationStatus: VERIFICATION_TIERS.ORB,
          interestPaid: nftData.interestPaid || "0",
          loansDefaulted: nftData.loansDefaulted || "0",
          loansRepaid: nftData.loansRepaid || "0",
          ongoingLoan: nftData.ongoingLoan || false,
          owner: nftData.owner || null,
        };

        if ((nftData.hasActiveLoan || nftData.ongoingLoan) && !loanData) {
          // Check if we have complete loan details from the NFT data
          if (nftData.loan && 
              (typeof nftData.loan.amount !== 'undefined' || 
               typeof nftData.loan.interestRate !== 'undefined' ||
               typeof nftData.loan.loanPeriod !== 'undefined')) {
            
            loanData = [
              nftData.loan?.version || "V3",
              {
                amount: BigInt(Math.round((nftData.loan?.amount || 0) * 1e6)),
                startTime: nftData.loan?.startTime || 0,
                isActive: nftData.loan?.isActive ?? true,
                interestRate: BigInt(nftData.loan?.interestRate || 0),
                loanPeriod: BigInt(nftData.loan?.loanPeriod || 0),
                poolAddress: nftData.loan?.poolAddress, // Include pool address if available
              },
            ];
            
            console.log("[useMagnifyWorld] Using NFT data for loan:", loanData);
          } else if (nftData.ongoingLoan && !loanData) {
            // If we know there's an active loan but don't have details, check V3 API again
            const v3Loan = await checkV3Loans();
            if (v3Loan) {
              loanData = v3Loan;
              console.log("[useMagnifyWorld] Retrieved V3 loan data after NFT check:", loanData);
            }
          }
        }

        if (nftData.tiers) tierData = nftData.tiers;
      }

      const newData: ContractData = {
        nftInfo: soulboundNFT,
        hasActiveLoan: Boolean(loanData?.[1]?.isActive || soulboundNFT.ongoingLoan),
        loan: loanData,
        allTiers: tierData || undefined,
      };

      console.log("[useMagnifyWorld] Final contract data:", newData);
      
      globalCache[walletAddress] = newData;
      setData(newData);
    } catch (error) {
      console.error("Error fetching contract data:", error);
      setIsError(true);
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (!globalCache[walletAddress]) fetchData();
    else setData(globalCache[walletAddress]);
  }, [walletAddress, fetchData]);

  const refetch = useCallback(async (): Promise<void> => {
    invalidateCache(walletAddress);
    return fetchData();
  }, [walletAddress, fetchData]);

  return { data, isLoading, isError, refetch };
}

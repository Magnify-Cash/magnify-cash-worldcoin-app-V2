import { useEffect, useState, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import { getSoulboundUserNFT, getSoulboundData } from "@/lib/backendRequests";
import { readContract } from "@wagmi/core";
import { magnifyworldabi } from "@/utils/magnifyworldabi";
import { config } from "@/providers/Wagmi";
import {
  MAGNIFY_WORLD_ADDRESS_V3,
  MAGNIFY_WORLD_ADDRESS_V1,
  MAGNIFY_WORLD_ADDRESS,
} from "@/utils/constants";

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
}

export interface ContractData {
  nftInfo: SoulboundNFT;
  hasActiveLoan: boolean;
  loan?: [string, Loan]; // [version, loan]
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
    if (!walletAddress) {
      console.log("No wallet address provided");
      return;
    }

    const checkLegacyLoans = async (): Promise<[string, Loan] | null> => {
      const contracts = [
        { version: "V1", address: MAGNIFY_WORLD_ADDRESS_V1 },
        { version: "V2", address: MAGNIFY_WORLD_ADDRESS },
      ];

      for (const { version, address } of contracts) {
        try {
          const loanResult = await readContract(config, {
            address: address as `0x${string}`,
            abi: magnifyworldabi,
            functionName: "fetchLoanByAddress",
            args: [walletAddress],
          });

          if (Array.isArray(loanResult) && loanResult[1]?.isActive) {
            const loan: Loan = {
              amount: BigInt(loanResult[1].amount),
              startTime: Number(loanResult[1].startTime),
              isActive: loanResult[1].isActive,
              interestRate: BigInt(loanResult[1].interestRate),
              loanPeriod: BigInt(loanResult[1].loanPeriod),
            };
            return [version, loan];
          }
        } catch (err) {
          console.warn(`[useMagnifyWorld] Error checking ${version} loan:`, err);
        }
      }

      return null;
    };

    try {
      setIsLoading(true);
      setIsError(false);

      let hasActiveLoan = false;
      let loanData: [string, Loan] | undefined = undefined;
      let tierData = null;

      // First check legacy loans
      const legacyLoan = await checkLegacyLoans();
      if (legacyLoan) {
        loanData = legacyLoan;
        hasActiveLoan = true;
      }

      // Then continue with v3 NFT
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

        const nftLoanIsActive = nftData.hasActiveLoan || nftData.ongoingLoan;

        if (!loanData && nftLoanIsActive && nftData.loan) {
          loanData = [
            nftData.loan.version || "V3",
            {
              amount: BigInt(nftData.loan.amount || 0),
              startTime: nftData.loan.startTime || 0,
              isActive: nftData.loan.isActive || true,
              interestRate: BigInt(nftData.loan.interestRate || 0),
              loanPeriod: BigInt(nftData.loan.loanPeriod || 0),
            },
          ];
          hasActiveLoan = true;
        }

        if (nftData.tiers) {
          tierData = nftData.tiers;
        }
      }

      const newData: ContractData = {
        nftInfo: soulboundNFT,
        hasActiveLoan,
      };

      if (loanData) {
        newData.loan = loanData;
      }

      if (tierData) {
        newData.allTiers = tierData;
      }

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
    if (!globalCache[walletAddress]) {
      fetchData();
    } else {
      setData(globalCache[walletAddress]);
    }
  }, [walletAddress, fetchData]);

  const refetch = useCallback(async (): Promise<void> => {
    invalidateCache(walletAddress);
    return fetchData();
  }, [walletAddress, fetchData]);

  return { data, isLoading, isError, refetch };
}

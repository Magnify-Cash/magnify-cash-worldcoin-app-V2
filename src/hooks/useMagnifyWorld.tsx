
import { readContract } from "@wagmi/core";
import { magnifyworldabi } from "@/utils/magnifyworldabi";
import { MAGNIFY_WORLD_ADDRESS } from "@/utils/constants";
import { config } from "@/providers/Wagmi";
import { useEffect, useState, useCallback } from "react";

export const VERIFICATION_TIERS: Record<"NONE" | "DEVICE" | "ORB", VerificationTier> = {
  NONE: {
    level: "NONE",
    description: "Not Verified",
    color: "text-gray-500",
    message: "You have not been verified yet.",
    claimAction: "",
    upgradeAction: "mint-device-verified-nft",
    verification_level: "none",
  },
  DEVICE: {
    level: "DEVICE",
    description: "Device Verified",
    color: "text-brand-info",
    message: "You are Device Verified! Upgrade to ORB for maximum benefits.",
    claimAction: "mint-device-verified-nft",
    upgradeAction: "upgrade-device-verified-nft",
    verification_level: "device",
  },
  ORB: {
    level: "ORB",
    description: "Orb Verified",
    color: "text-brand-success",
    message: "You're fully verified and eligible for maximum loan amounts!",
    claimAction: "mint-orb-verified-nft",
    upgradeAction: "upgrade-orb-verified-nft",
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

export interface Tier {
  loanAmount: bigint;
  interestRate: bigint;
  loanPeriod: bigint;
  tierId: bigint;
  verificationStatus: VerificationTier;
}

export interface Loan {
  amount: bigint;
  startTime: bigint;
  isActive: boolean;
  interestRate: bigint;
  loanPeriod: bigint;
}

export type LoanTuple = [string, Loan | null];

export interface ContractData {
  loanToken: string | null;
  tierCount: number | null;
  nftInfo: {
    tokenId: bigint | null;
    tier: Tier | null;
  };
  loan: LoanTuple; // tuple 
  allTiers: Record<number, Tier> | null;
}

// Global cache for all components
let globalCache: Record<string, ContractData> = {};

// Function to invalidate cache for a specific wallet address
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
    try {
      setIsLoading(true);
      setIsError(false);
  
      const [
        loanToken,
        tierCount,
        userNFTResult,
        loanResult
      ] = await Promise.all([
        readContract(config, { 
          address: MAGNIFY_WORLD_ADDRESS as `0x${string}`, 
          abi: magnifyworldabi, 
          functionName: "loanToken" 
        }),
        readContract(config, { 
          address: MAGNIFY_WORLD_ADDRESS as `0x${string}`, 
          abi: magnifyworldabi, 
          functionName: "tierCount" 
        }),
        readContract(config, { 
          address: MAGNIFY_WORLD_ADDRESS as `0x${string}`, 
          abi: magnifyworldabi, 
          functionName: "userNFT", 
          args: [walletAddress] 
        }),
        readContract(config, { 
          address: MAGNIFY_WORLD_ADDRESS as `0x${string}`, 
          abi: magnifyworldabi, 
          functionName: "fetchLoanByAddress", 
          args: [walletAddress] 
        })
      ]);
  
      let tokenId: bigint | null = null;
      let nftTier: Tier | null = null;
  
      // If user has an NFT, fetch tier info
      if (userNFTResult !== BigInt(0)) {
        tokenId = userNFTResult as bigint;
  
        const [tierId, tierData] = await Promise.all([
          readContract(config, { 
            address: MAGNIFY_WORLD_ADDRESS as `0x${string}`, 
            abi: magnifyworldabi, 
            functionName: "nftToTier", 
            args: [tokenId] 
          }),
          readContract(config, { 
            address: MAGNIFY_WORLD_ADDRESS as `0x${string}`, 
            abi: magnifyworldabi, 
            functionName: "tiers", 
            args: [userNFTResult] 
          })
        ]);
  
        if (tierData) {
          nftTier = {
            loanAmount: tierData[0],
            interestRate: tierData[1],
            loanPeriod: tierData[2],
            tierId: BigInt(tierId as string | number | bigint | boolean),
            verificationStatus: getVerificationStatus(Number(tierId)),
          };
        }
      }
  
      // Fetch all tiers concurrently
      const allTiers = await fetchAllTiers(Number(tierCount));
  
      const loanData: Loan | null = Array.isArray(loanResult) && loanResult.length === 2
        ? (loanResult[1] as Loan)
        : null;
  
      const newData: ContractData = {
        loanToken: String(loanToken),
        tierCount: Number(tierCount),
        nftInfo: {
          tokenId,
          tier: nftTier,
        },
        loan: ["V2", loanData],
        allTiers,
      };
  
      globalCache[walletAddress] = newData;
      setData(newData);
    } catch (error) {
      console.error("Error fetching contract data:", error);
      setIsError(true);
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

  // Refetch function for user action invalidation - now returns a Promise
  const refetch = useCallback(async (): Promise<void> => {
    invalidateCache(walletAddress);
    return fetchData();
  }, [walletAddress, fetchData]);

  return { data, isLoading, isError, refetch };
}

// Fetch all tiers
async function fetchAllTiers(tierCount: number): Promise<Record<number, Tier> | null> {
  if (tierCount <= 0) return null;

  const tierRequests = Array.from({ length: tierCount }, (_, i) =>
    readContract(config, {
      address: MAGNIFY_WORLD_ADDRESS as `0x${string}`,
      abi: magnifyworldabi,
      functionName: "tiers",
      args: [BigInt(i + 1)],
    })
  );

  const tierResults = await Promise.all(tierRequests);

  const allTiers: Record<number, Tier> = {};
  tierResults.forEach((tierData, index) => {
    if (tierData) {
      allTiers[index + 1] = {
        loanAmount: tierData[0],
        interestRate: tierData[1],
        loanPeriod: tierData[2],
        tierId: BigInt(index + 1),
        verificationStatus: getVerificationStatus(index + 1),
      };
    }
  });

  return allTiers;
}

// Helper function to get verification status based on tier ID
function getVerificationStatus(tierId: number): VerificationTier {
  switch (tierId) {
    case 0:
      return VERIFICATION_TIERS.NONE;
    case 1:
      return VERIFICATION_TIERS.DEVICE;
    case 3:
      return VERIFICATION_TIERS.ORB;
    default:
      return VERIFICATION_TIERS.NONE;
  }
}

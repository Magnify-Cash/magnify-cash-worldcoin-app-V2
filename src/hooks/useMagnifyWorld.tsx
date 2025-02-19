import { readContract } from "@wagmi/core";
import { magnifyworldabi } from "@/utils/magnifyworldabi";
import { MAGNIFY_WORLD_ADDRESS } from "@/utils/constants";
import { config } from "@/providers/Wagmi"; // Assuming this is where your Wagmi config lives
import { useEffect, useState, useCallback } from "react";

export const VERIFICATION_TIERS = {
  ORB: {
    level: "Orb Scan",
    description: "Orb Verified",
    color: "text-brand-success",
    message: "You're fully verified and eligible for maximum loan amounts!",
    claimAction: "mint-orb-verified-nft",
    upgradeAction: "upgrade-orb-verified-nft",
    verification_level: "orb",
  },
  PASSPORT: {
    level: "Passport",
    description: "Passport Verified",
    color: "text-brand-warning",
    message: "Get ORB verified to unlock $10 loans!",
    claimAction: "mint-passport-verified-nft",
    upgradeAction: "upgrade-passport-verified-nft",
    verification_level: "passport",
  },
  NONE: {
    level: "Device",
    description: "Device Verified",
    color: "text-brand-info",
    message:
      "Get World ID verified to unlock higher loan amounts! Verify with Passport for $5 loans or get ORB verified for $10 loans.",
    claimAction: "mint-device-verified-nft",
    upgradeAction: "upgrade-device-verified-nft",
    verification_level: "device",
  },
};

export type VerificationLevel = keyof typeof VERIFICATION_TIERS;
export interface VerificationTier {
  level: VerificationLevel;
  maxLoanAmount: number;
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

export interface LoanInfo {
  amountBorrowed: bigint;
  dueDate: bigint;
  totalDue: bigint;
}

export interface ContractData {
  loanToken: string | null;
  tierCount: number | null;
  nftInfo: {
    tokenId: bigint | null;
    tier: Tier | null;
  };
  loan: Loan | null;
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
  refetch: () => void;
} {
  const [data, setData] = useState<ContractData | null>(globalCache[walletAddress] || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);

      // Basic contract information
      const loanToken = await readContract(config, {
        address: MAGNIFY_WORLD_ADDRESS,
        abi: magnifyworldabi,
        functionName: "loanToken",
      });

      const tierCount = await readContract(config, {
        address: MAGNIFY_WORLD_ADDRESS,
        abi: magnifyworldabi,
        functionName: "tierCount",
      });

      const userNFT = (await readContract(config, {
        address: MAGNIFY_WORLD_ADDRESS,
        abi: magnifyworldabi,
        functionName: "userNFT",
        args: [walletAddress],
      })) as bigint;

      let tokenId: bigint | null = null;
      let nftTier: Tier | null = null;
      if (userNFT !== BigInt(0)) {
        tokenId = userNFT;
        const tierId = await readContract(config, {
          address: MAGNIFY_WORLD_ADDRESS,
          abi: magnifyworldabi,
          functionName: "nftToTier",
          args: [tokenId],
        });
        const tierData = await readContract(config, {
          address: MAGNIFY_WORLD_ADDRESS,
          abi: magnifyworldabi,
          functionName: "tiers",
          args: [tierId],
        });
        if (tierData) {
          nftTier = {
            loanAmount: tierData[0],
            interestRate: tierData[1],
            loanPeriod: tierData[2],
            tierId: tierId,
            verificationStatus: getVerificationStatus(tierId),
          };
        }
      }

      const loan = await readContract(config, {
        address: MAGNIFY_WORLD_ADDRESS,
        abi: magnifyworldabi,
        functionName: "fetchLoanByAddress",
        args: [walletAddress],
      });

      const allTiers = await fetchAllTiers(Number(tierCount));

      const newData: ContractData = {
        loanToken: String(loanToken),
        tierCount: Number(tierCount),
        nftInfo: {
          tokenId,
          tier: nftTier,
        },
        loan,
        allTiers,
      };

      globalCache[walletAddress] = newData; // Update global cache
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

  // Refetch function for user action invalidation
  const refetch = useCallback(() => {
    invalidateCache(walletAddress);
    fetchData();
  }, [walletAddress, fetchData]);

  return { data, isLoading, isError, refetch };
}

// Helper function to fetch all tiers
async function fetchAllTiers(tierCount: number): Promise<Record<number, Tier> | null> {
  const allTiers: Record<number, Tier> = {};
  for (let i = 1; i <= tierCount; i++) {
    const tierData = await readContract(config, {
      address: MAGNIFY_WORLD_ADDRESS,
      abi: magnifyworldabi,
      functionName: "tiers",
      args: [BigInt(i)],
    });
    if (tierData) {
      allTiers[i] = {
        loanAmount: tierData[0],
        interestRate: tierData[1],
        loanPeriod: tierData[2],
        tierId: BigInt(i),
        verificationStatus: getVerificationStatus(Number(i)),
      };
    }
  }
  return allTiers;
}

// Helper function to get verification status based on tier ID
function getVerificationStatus(tierId: number): VerificationTier {
  let verificationLevel: VerificationLevel;
  switch (Number(tierId)) {
    case 1:
      verificationLevel = "NONE";
      break;
    case 2:
      verificationLevel = "PASSPORT";
      break;
    case 3:
      verificationLevel = "ORB";
      break;
    default:
      // You can decide what to do with unexpected tier IDs. Here, we default to NONE.
      verificationLevel = "NONE";
  }

  return VERIFICATION_TIERS[verificationLevel];
}


import { useEffect, useState, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import { getSoulboundUserNFT, getSoulboundData } from "@/lib/backendRequests";
import { MAGNIFY_WORLD_ADDRESS_V3 } from "@/utils/constants";

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
}

export interface ContractData {
  nftInfo: SoulboundNFT;
  hasActiveLoan: boolean;
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
    if (!walletAddress) {
      console.log("No wallet address provided");
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      
      console.log("[CoT] Fetching soulbound NFT data for wallet:", walletAddress);
      
      // Fetch user's NFT data from backend
      const nftResponse = await getSoulboundUserNFT(walletAddress);
      console.log("[CoT] NFT Response:", nftResponse);
      
      let soulboundNFT: SoulboundNFT = {
        tokenId: null,
        tier: null,
        verificationStatus: VERIFICATION_TIERS.NONE
      };
      
      let hasActiveLoan = false;
      
      if (nftResponse && nftResponse.tokenId !== "0") {
        const tokenId = parseInt(nftResponse.tokenId);
        console.log("[CoT] User has NFT with token ID:", tokenId);
        
        // Fetch detailed data about the NFT
        const nftData = await getSoulboundData(tokenId);
        console.log("[CoT] NFT Data:", nftData);
        
        soulboundNFT = {
          tokenId: nftResponse.tokenId,
          tier: nftData.tier || null,
          verificationStatus: VERIFICATION_TIERS.ORB
        };
        
        // Check if user has an active loan
        hasActiveLoan = nftData.hasActiveLoan || false;
      }
      
      const newData: ContractData = {
        nftInfo: soulboundNFT,
        hasActiveLoan
      };
      
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

  // Refetch function for user action invalidation
  const refetch = useCallback(async (): Promise<void> => {
    invalidateCache(walletAddress);
    return fetchData();
  }, [walletAddress, fetchData]);

  return { data, isLoading, isError, refetch };
}

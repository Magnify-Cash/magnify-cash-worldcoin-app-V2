import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { WORLDCHAIN_RPC_URL, MAGNIFY_WORLD_ADDRESS, WORLDCOIN_TOKEN_COLLATERAL } from "@/utils/constants";

const USDC_ABI = ["function balanceOf(address owner) view returns (uint256)"];

type USDCBalanceContextType = {
  usdcBalance: number | null;
  hasMoreThanOne: boolean | null;
  loading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
};

const USDCBalanceContext = createContext<USDCBalanceContextType | undefined>(undefined);

// Provider Component
export const USDCBalanceProvider = ({ children }: { children: React.ReactNode }) => {
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [hasMoreThanOne, setHasMoreThanOne] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const provider = new ethers.JsonRpcProvider(WORLDCHAIN_RPC_URL);
      const usdcContract = new ethers.Contract(WORLDCOIN_TOKEN_COLLATERAL, USDC_ABI, provider);

      const balance = await usdcContract.balanceOf(MAGNIFY_WORLD_ADDRESS);

      // Convert from 6 decimals
      const formattedBalance = Number(ethers.formatUnits(balance, 6));

      setUsdcBalance(formattedBalance);
      setHasMoreThanOne(formattedBalance > 1);
    } catch (err) {
      console.error("Error fetching USDC balance:", err);
      setError("Failed to fetch USDC balance.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const refreshBalance = async () => {
    return fetchBalance();
  };

  return (
    <USDCBalanceContext.Provider value={{ usdcBalance, hasMoreThanOne, loading, error, refreshBalance }}>
      {children}
    </USDCBalanceContext.Provider>
  );
};

// Hook to use USDC balance context
export const useUSDCBalance = () => {
  const context = useContext(USDCBalanceContext);
  if (!context) {
    throw new Error("useUSDCBalance must be used within a USDCBalanceProvider");
  }
  return context;
};

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getUSDCBalance } from "@/lib/backendRequests";
import { MAGNIFY_WORLD_ADDRESS } from "@/utils/constants";

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
      const balance = await getUSDCBalance(MAGNIFY_WORLD_ADDRESS);

      setUsdcBalance(balance);
      setHasMoreThanOne(balance > 1);
    } catch (err) {
      console.error("Error fetching USDC balance:", err);
      setError("Failed to fetch USDC balance.");
      setUsdcBalance(null);
      setHasMoreThanOne(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const refreshBalance = async () => {
    await fetchBalance();
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
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import hyperOptimizedRequest from "@/lib/request";
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
      interface BalanceResponse {
        balance: number;
      }

      const response = await hyperOptimizedRequest<BalanceResponse>("GET", "getUSDCBalance", { wallet: MAGNIFY_WORLD_ADDRESS });

      if (response?.balance !== undefined) {
        const formattedBalance = Number(response.balance);
        setUsdcBalance(formattedBalance);
        setHasMoreThanOne(formattedBalance > 1);
      } else {
        throw new Error("Invalid balance response");
      }
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
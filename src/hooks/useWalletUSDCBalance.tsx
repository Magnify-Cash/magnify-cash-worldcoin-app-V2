
import { useState, useCallback, useEffect } from "react";
import { getUSDCBalance } from "@/lib/backendRequests";

export const useWalletUSDCBalance = (walletAddress?: string) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!walletAddress) {
      setBalance(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const usdcBalance = await getUSDCBalance(walletAddress);
      setBalance(usdcBalance);
    } catch (err) {
      console.error("Error fetching wallet USDC balance:", err);
      setError("Failed to fetch USDC balance");
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance
  };
};

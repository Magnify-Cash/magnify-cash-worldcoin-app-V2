
import { useState, useEffect } from "react";
import { getPoolLpTokenPrice } from "@/lib/backendRequests";
import { PoolLpTokenPrice } from "@/utils/types";

export function useLPTokenHistory(
  contractAddress: string
) {
  const [priceData, setPriceData] = useState<PoolLpTokenPrice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTokenHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch token price history from the backend
        const response = await getPoolLpTokenPrice(contractAddress);
        
        if (!response || !Array.isArray(response)) {
          console.error("Invalid response format for LP token prices:", response);
          throw new Error("Invalid response format");
        }
        
        // Sort by timestamp in ascending order (oldest to newest)
        const sortedData = [...response].sort((a, b) => {
          return parseInt(a.timestamp) - parseInt(b.timestamp);
        });
        
        setPriceData(sortedData);
      } catch (err) {
        console.error("Error fetching LP token history:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch token price history"));
        setPriceData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenHistory();
  }, [contractAddress]);

  return { priceData, isLoading, error };
}

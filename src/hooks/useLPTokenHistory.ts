
import { useState, useEffect, useMemo } from "react";
import { getPoolLpTokenPrice } from "@/lib/backendRequests";
import { PoolLpTokenPrice } from "@/utils/types";
import { Cache } from "@/utils/cacheUtils";

// Cache key for LP token price history
const getTokenPriceHistoryCacheKey = (contractAddress: string) => `lp_token_price_history_${contractAddress}`;
// Cache duration in minutes (price history doesn't change often)
const CACHE_DURATION_MINUTES = 30;

export function useLPTokenHistory(
  contractAddress: string
) {
  const [priceData, setPriceData] = useState<PoolLpTokenPrice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize the contract address to avoid unnecessary re-fetches
  const memoizedContractAddress = useMemo(() => contractAddress, [contractAddress]);

  useEffect(() => {
    const fetchTokenHistory = async () => {
      if (!memoizedContractAddress) {
        console.log("[useLPTokenHistory] No contract address provided, skipping fetch");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Check cache first
        const cacheKey = getTokenPriceHistoryCacheKey(memoizedContractAddress);
        const cachedData = Cache.get<PoolLpTokenPrice[]>(cacheKey);
        
        if (cachedData && cachedData.length > 0) {
          console.log("[useLPTokenHistory] Using cached LP token price history");
          setPriceData(cachedData);
          setIsLoading(false);
          return;
        }
        
        // Fetch token price history from the backend if not in cache
        console.log("[useLPTokenHistory] Fetching LP token price history from API");
        const response = await getPoolLpTokenPrice(memoizedContractAddress);
        
        if (!response || !Array.isArray(response)) {
          console.error("[useLPTokenHistory] Invalid response format for LP token prices:", response);
          throw new Error("Invalid response format");
        }
        
        // Sort by timestamp in ascending order (oldest to newest)
        const sortedData = [...response].sort((a, b) => {
          return parseInt(a.timestamp) - parseInt(b.timestamp);
        });
        
        // Cache the result for future use
        Cache.set(cacheKey, sortedData, CACHE_DURATION_MINUTES);
        
        setPriceData(sortedData);
      } catch (err) {
        console.error("[useLPTokenHistory] Error fetching LP token history:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch token price history"));
        setPriceData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenHistory();
  }, [memoizedContractAddress]);

  return { priceData, isLoading, error };
}

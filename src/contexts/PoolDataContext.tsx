
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getPools, invalidatePoolsCache } from "@/lib/poolRequests";
import { LiquidityPool } from "@/types/supabase/liquidity";

interface PoolDataContextType {
  pools: LiquidityPool[];
  loading: boolean;
  error: string | null;
  refreshPools: (invalidateCache?: boolean) => Promise<void>;
  lastFetched: number | null;
  isPrefetching: boolean;
  hasFetchStarted: boolean;
}

const PoolDataContext = createContext<PoolDataContextType>({
  pools: [],
  loading: true,
  error: null,
  refreshPools: async () => {},
  lastFetched: null,
  isPrefetching: false,
  hasFetchStarted: false
});

export const usePoolData = () => useContext(PoolDataContext);

interface PoolDataProviderProps {
  children: ReactNode;
}

// Cache key for localStorage
const POOLS_LAST_FETCHED_KEY = 'pools_last_fetched';

export const PoolDataProvider = ({ children }: PoolDataProviderProps) => {
  const [pools, setPools] = useState<LiquidityPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [hasFetchStarted, setHasFetchStarted] = useState(false);
  
  // Initialize lastFetched from localStorage if available
  const [lastFetched, setLastFetched] = useState<number | null>(() => {
    const storedLastFetched = localStorage.getItem(POOLS_LAST_FETCHED_KEY);
    return storedLastFetched ? parseInt(storedLastFetched, 10) : null;
  });

  const refreshPools = async (invalidateCache: boolean = false) => {
    // Don't refetch if already fetching
    if (isPrefetching) {
      console.log("Already prefetching pool data, skipping duplicate request");
      return;
    }
    
    // Get the last fetched time from localStorage (which is shared across page navigations)
    const storedLastFetched = localStorage.getItem(POOLS_LAST_FETCHED_KEY);
    const lastFetchedTime = storedLastFetched ? parseInt(storedLastFetched, 10) : null;
    
    // Don't refetch if data was fetched within the last 5 minutes (unless forced invalidation)
    const cacheTimeoutMs = 5 * 60 * 1000; // 5 minutes
    if (!invalidateCache && lastFetchedTime && Date.now() - lastFetchedTime < cacheTimeoutMs) {
      console.log(`Pools data already fetched recently (${Math.round((Date.now() - lastFetchedTime) / 1000)}s ago), using cached data`);
      return;
    }
    
    try {
      setIsPrefetching(true);
      // Set hasFetchStarted to true as soon as we start the first fetch
      setHasFetchStarted(true);
      setLoading(true);
      setError(null);
      
      console.log(`Fetching pools data. Invalidate cache: ${invalidateCache}`);
      
      if (invalidateCache) {
        invalidatePoolsCache();
      }
      
      const poolsData = await getPools();
      
      if (poolsData.length === 0) {
        setError("No pools available at this time");
      } else {
        const sortedPools = [...poolsData].sort((a, b) => {
          // Same sorting logic from Lending.tsx
          const getPoolStatusPriority = (status: 'warm-up' | 'active' | 'cooldown' | 'withdrawal'): number => {
            switch (status) {
              case 'warm-up': return 1;
              case 'active': return 2;
              case 'withdrawal': return 3;
              case 'cooldown': return 4;
              default: return 5;
            }
          };
          
          return getPoolStatusPriority(a.status) - getPoolStatusPriority(b.status);
        });
        
        setPools(sortedPools);
        
        // Update both state and localStorage with the fetch timestamp
        const now = Date.now();
        setLastFetched(now);
        localStorage.setItem(POOLS_LAST_FETCHED_KEY, now.toString());
        console.log(`Pools data fetched successfully at ${new Date(now).toLocaleTimeString()}`);
      }
    } catch (err) {
      console.error("Error fetching pools:", err);
      setError("Failed to load pool data. Please try again later.");
    } finally {
      setLoading(false);
      setIsPrefetching(false);
    }
  };

  // Initial fetch on mount - only once for the entire app
  useEffect(() => {
    // Only fetch if no fetch has been started yet
    if (!hasFetchStarted) {
      console.log("Initial pools data fetch triggered from PoolDataContext");
      refreshPools();
      
      // Set up background refresh every 5 minutes
      const refreshInterval = setInterval(() => {
        console.log("Background refreshing pools data...");
        refreshPools(true);
      }, 5 * 60 * 1000);
      
      return () => clearInterval(refreshInterval);
    }
  }, [hasFetchStarted]);

  return (
    <PoolDataContext.Provider value={{ 
      pools, 
      loading, 
      error, 
      refreshPools, 
      lastFetched, 
      isPrefetching,
      hasFetchStarted 
    }}>
      {children}
    </PoolDataContext.Provider>
  );
};

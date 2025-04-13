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
// Cache timeout - 5 minutes in milliseconds
const CACHE_TIMEOUT_MS = 5 * 60 * 1000;

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

  // Initialize pools from localStorage cache if available
  useEffect(() => {
    const loadCachedPools = () => {
      try {
        // Check if we have cached pools
        const cachedPoolsKey = 'pool_data_all';
        const cachedPoolsData = localStorage.getItem(cachedPoolsKey);
        
        if (cachedPoolsData) {
          try {
            const parsed = JSON.parse(cachedPoolsData);
            if (parsed.data && Array.isArray(parsed.data) && parsed.data.length > 0) {
              console.log("[PoolDataContext] Found cached pools data on initial load");
              setPools(parsed.data);
              setLoading(false);
              setHasFetchStarted(true); // Mark as fetch started since we have data
              return true;
            }
          } catch (e) {
            console.error("[PoolDataContext] Error parsing cached pools:", e);
          }
        }
        return false;
      } catch (e) {
        console.error("[PoolDataContext] Error checking localStorage for cached pools:", e);
        return false;
      }
    };
    
    // Try to load cached pools
    const foundCachedPools = loadCachedPools();
    
    // If we didn't find cached pools, keep loading state as true
    // Otherwise, it will have been set to false in loadCachedPools
    if (!foundCachedPools) {
      setLoading(true);
    }
  }, []);

  const refreshPools = async (invalidateCache: boolean = false) => {
    // Skip if we're already prefetching to prevent concurrent fetch operations
    if (isPrefetching) {
      console.log("[PoolDataContext] Already prefetching pool data, skipping duplicate request");
      return;
    }
    
    // Get the last fetched time from localStorage (which is shared across page navigations)
    const storedLastFetched = localStorage.getItem(POOLS_LAST_FETCHED_KEY);
    const lastFetchedTime = storedLastFetched ? parseInt(storedLastFetched, 10) : null;
    
    // Skip refetch if data is recent, already have pools AND not forcing invalidation
    if (
      !invalidateCache && 
      lastFetchedTime && 
      Date.now() - lastFetchedTime < CACHE_TIMEOUT_MS && 
      pools.length > 0
    ) {
      console.log(`[PoolDataContext] Pools data fetched recently (${Math.round((Date.now() - lastFetchedTime) / 1000)}s ago), using cached data`);
      
      // We already have data and it's recent, so we're not loading
      setLoading(false);
      return;
    }
    
    try {
      setIsPrefetching(true);
      
      // Only set loading to true if we don't already have pools data
      // This prevents UI flickering when refreshing in the background
      if (pools.length === 0) {
        setLoading(true);
      }
      
      // Set hasFetchStarted to true as soon as we start the first fetch
      setHasFetchStarted(true);
      setError(null);
      
      console.log(`[PoolDataContext] Fetching pools data. Invalidate cache: ${invalidateCache}`);
      
      if (invalidateCache) {
        // This will clear all pool-related caches
        invalidatePoolsCache();
      }
      
      // Fetch pools data
      const poolsData = await getPools();
      
      if (poolsData.length === 0) {
        setError("No pools available at this time");
      } else {
        // Sort pools by status priority
        const sortedPools = [...poolsData].sort((a, b) => {
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
        console.log(`[PoolDataContext] Pools data fetched successfully at ${new Date(now).toLocaleTimeString()}`);
      }
    } catch (err) {
      console.error("[PoolDataContext] Error fetching pools:", err);
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
      console.log("[PoolDataContext] Initial pools data fetch triggered");
      refreshPools();
      
      // Set up background refresh every 5 minutes (matching cache timeout)
      const refreshInterval = setInterval(() => {
        console.log("[PoolDataContext] Background refreshing pools data...");
        refreshPools(true);
      }, CACHE_TIMEOUT_MS);
      
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

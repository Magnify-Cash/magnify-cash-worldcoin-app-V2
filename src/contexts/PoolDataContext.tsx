import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getPools, getBasicPools, invalidatePoolsCache } from "@/lib/poolRequests";
import { LiquidityPool } from "@/types/supabase/liquidity";

interface PoolDataContextType {
  pools: LiquidityPool[];
  loading: boolean;
  error: string | null;
  refreshPools: (invalidateCache?: boolean) => Promise<void>;
  loadDetailedPoolsData: () => Promise<void>;
  lastFetched: number | null;
  isPrefetching: boolean;
  hasFetchStarted: boolean;
  isLoadingDetails: boolean;
}

const PoolDataContext = createContext<PoolDataContextType>({
  pools: [],
  loading: true,
  error: null,
  refreshPools: async () => {},
  loadDetailedPoolsData: async () => {},
  lastFetched: null,
  isPrefetching: false,
  hasFetchStarted: false,
  isLoadingDetails: false
});

export const usePoolData = () => useContext(PoolDataContext);

interface PoolDataProviderProps {
  children: ReactNode;
}

// Cache keys for localStorage
const POOLS_LAST_FETCHED_KEY = 'pools_last_fetched';
const DETAILED_POOLS_LAST_FETCHED_KEY = 'detailed_pools_last_fetched';
// Cache timeout - 5 minutes in milliseconds
const CACHE_TIMEOUT_MS = 10 * 60 * 1000;

// Helper function to check if pools data has valid liquidity
const hasValidLiquidity = (pools: LiquidityPool[]): boolean => {
  if (!pools || pools.length === 0) return false;
  
  // Check if at least some pools have valid liquidity
  const poolsWithLiquidity = pools.filter(pool => 
    pool.available_liquidity && pool.available_liquidity > 0
  );
  
  // We consider the data valid if at least half of the pools have liquidity
  return poolsWithLiquidity.length > 0;
};

export const PoolDataProvider = ({ children }: PoolDataProviderProps) => {
  const [pools, setPools] = useState<LiquidityPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
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
        const cachedBasicPoolsKey = 'basic_pool_data_all';
        
        // Try basic pools first (we prefer to show something quickly)
        const cachedBasicPoolsData = localStorage.getItem(cachedBasicPoolsKey);
        if (cachedBasicPoolsData) {
          try {
            const parsed = JSON.parse(cachedBasicPoolsData);
            if (parsed.data && Array.isArray(parsed.data) && parsed.data.length > 0) {
              console.log("[PoolDataContext] Found cached basic pools data on initial load");
              setPools(parsed.data);
              setLoading(false);
              setHasFetchStarted(true); // Mark as fetch started since we have data
              return true;
            }
          } catch (e) {
            console.error("[PoolDataContext] Error parsing cached basic pools:", e);
          }
        }
        
        // If no basic pools, try full pools data
        const cachedPoolsData = localStorage.getItem(cachedPoolsKey);
        if (cachedPoolsData) {
          try {
            const parsed = JSON.parse(cachedPoolsData);
            if (parsed.data && Array.isArray(parsed.data) && parsed.data.length > 0) {
              console.log("[PoolDataContext] Found cached full pools data on initial load");
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

  // This function loads basic pool data quickly
  const refreshPools = async (invalidateCache: boolean = false) => {
    // Skip if we're already prefetching to prevent concurrent fetch operations
    if (isPrefetching) {
      console.log("[PoolDataContext] Already prefetching pool data, skipping duplicate request");
      return;
    }
    
    // Get the last fetched time from localStorage (which is shared across page navigations)
    const storedLastFetched = localStorage.getItem(POOLS_LAST_FETCHED_KEY);
    const lastFetchedTime = storedLastFetched ? parseInt(storedLastFetched, 10) : null;
    
    // Check if current pools data is valid (has liquidity)
    const currentDataIsValid = hasValidLiquidity(pools);
    
    // Skip refetch if data is recent, already have pools, data is valid AND not forcing invalidation
    if (
      !invalidateCache && 
      lastFetchedTime && 
      Date.now() - lastFetchedTime < CACHE_TIMEOUT_MS && 
      pools.length > 0 &&
      currentDataIsValid
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
      
      console.log(`[PoolDataContext] Fetching basic pools data. Invalidate cache: ${invalidateCache}`);
      
      if (invalidateCache) {
        // This will clear all pool-related caches
        invalidatePoolsCache();
      }
      
      // Fetch BASIC pools data (faster) with a shortened timeout to fail fast
      const basicPoolsData = await getBasicPools();
      
      if (basicPoolsData.length === 0) {
        setError("No pools available at this time");
      } else {
        setPools(basicPoolsData);
        
        // Update both state and localStorage with the fetch timestamp
        const now = Date.now();
        setLastFetched(now);
        localStorage.setItem(POOLS_LAST_FETCHED_KEY, now.toString());
        console.log(`[PoolDataContext] Basic pools data fetched successfully at ${new Date(now).toLocaleTimeString()}`);
        
        // Immediately start loading detailed data in the background
        // This runs in parallel with rendering, so the UI can update faster
        setTimeout(() => {
          loadDetailedPoolsData().catch(err => {
            console.error("[PoolDataContext] Background load of detailed data failed:", err);
          });
        }, 300);
      }
    } catch (err) {
      console.error("[PoolDataContext] Error fetching basic pools:", err);
      setError("Failed to load pool data. Please try again later.");
    } finally {
      setLoading(false);
      setIsPrefetching(false);
    }
  };

  // This function loads detailed pool data in the background
  const loadDetailedPoolsData = async () => {
    // Skip if already loading details
    if (isLoadingDetails) {
      console.log("[PoolDataContext] Already loading detailed pool data, skipping duplicate request");
      return;
    }
    
    // Get the last fetched time for detailed data
    const storedDetailedLastFetched = localStorage.getItem(DETAILED_POOLS_LAST_FETCHED_KEY);
    const detailedLastFetched = storedDetailedLastFetched ? parseInt(storedDetailedLastFetched, 10) : null;
    
    // Check if current data has valid liquidity
    const currentDataIsValid = hasValidLiquidity(pools);
    
    // Skip if detailed data was fetched recently AND the current data has valid liquidity
    if (
      detailedLastFetched && 
      Date.now() - detailedLastFetched < CACHE_TIMEOUT_MS &&
      currentDataIsValid
    ) {
      console.log(`[PoolDataContext] Detailed pools data fetched recently (${Math.round((Date.now() - detailedLastFetched) / 1000)}s ago) and data is valid, skipping`);
      return;
    } else if (detailedLastFetched && !currentDataIsValid) {
      console.log(`[PoolDataContext] Cached data has invalid liquidity values, forcing refresh of detailed data`);
    }
    
    try {
      setIsLoadingDetails(true);
      console.log("[PoolDataContext] Loading detailed pool data in background");
      
      // Fetch full pools data (includes liquidity and balance)
      const detailedPoolsData = await getPools();
      
      if (detailedPoolsData.length > 0) {
        // Check if the detailed data is valid (has liquidity)
        const detailedDataIsValid = hasValidLiquidity(detailedPoolsData);
        
        if (detailedDataIsValid) {
          console.log("[PoolDataContext] Detailed pools data has valid liquidity, updating state");
          setPools(detailedPoolsData);
          
          // Update localStorage with the detailed fetch timestamp
          const now = Date.now();
          localStorage.setItem(DETAILED_POOLS_LAST_FETCHED_KEY, now.toString());
          console.log(`[PoolDataContext] Detailed pools data loaded successfully at ${new Date(now).toLocaleTimeString()}`);
        } else {
          console.warn("[PoolDataContext] Detailed pools data has invalid liquidity, not updating cache timestamp");
          // Still update the state to show what we got, but don't update the timestamp
          // so we'll try to refresh again next time
          setPools(detailedPoolsData);
        }
      }
    } catch (err) {
      console.error("[PoolDataContext] Error loading detailed pools data:", err);
      // Don't set error state here, we already have basic data
      
      // Don't update the timestamp since we had an error
      // This ensures we'll try again next time
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Initial fetch on mount - only once for the entire app
  useEffect(() => {
    // Only fetch if no fetch has been started yet
    if (!hasFetchStarted) {
      console.log("[PoolDataContext] Initial pools data fetch triggered");
      refreshPools();
      
      // Set up background refresh every 10 minutes (matching cache timeout)
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
      loadDetailedPoolsData,
      lastFetched, 
      isPrefetching,
      hasFetchStarted,
      isLoadingDetails
    }}>
      {children}
    </PoolDataContext.Provider>
  );
};

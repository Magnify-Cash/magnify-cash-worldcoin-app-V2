
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

/**
 * Cache Service for storing and retrieving data from localStorage with expiration
 */
export const Cache = {
  /**
   * Set a value in the cache
   * @param key Cache key
   * @param data Data to store
   * @param expirationMinutes Time in minutes before cache expires (default: 15)
   */
  set<T>(key: string, data: T, expirationMinutes = 15): void {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now() + expirationMinutes * 60 * 1000
      };
      localStorage.setItem(key, JSON.stringify(cacheItem));
      console.log(`[Cache] Set "${key}" with ${expirationMinutes}min expiration`);
    } catch (error) {
      console.error('[Cache] Error setting cache:', error);
    }
  },

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns Cached data or null if expired or missing
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const cacheItem: CacheItem<T> = JSON.parse(item);
      
      // Check if cache is expired
      if (Date.now() > cacheItem.timestamp) {
        console.log(`[Cache] "${key}" has expired, removing from cache`);
        localStorage.removeItem(key);
        return null;
      }
      
      // Calculate remaining time in seconds for debugging
      const remainingSecs = Math.round((cacheItem.timestamp - Date.now()) / 1000);
      console.log(`[Cache] Found "${key}" (expires in ${remainingSecs}s)`);
      return cacheItem.data;
    } catch (error) {
      console.error('[Cache] Error getting cache:', error);
      return null;
    }
  },

  /**
   * Remove a value from the cache
   * @param key Cache key
   */
  remove(key: string): void {
    localStorage.removeItem(key);
    console.log(`[Cache] Removed "${key}" from cache`);
  },
  
  /**
   * Clear cache for all pools and borrower info
   */
  clearPoolCache(): void {
    const poolCachePrefix = 'pool_data_';
    const borrowerInfoPrefix = 'borrower_info_';
    try {
      // Find all pool cache items and remove them
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(poolCachePrefix) || key.startsWith(borrowerInfoPrefix))) {
          localStorage.removeItem(key);
          console.log(`[Cache] Cleared ${key}`);
        }
      }
      console.log('[Cache] Pool cache cleared');
    } catch (error) {
      console.error('[Cache] Error clearing pool cache:', error);
    }
  }
};

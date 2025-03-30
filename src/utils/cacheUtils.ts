
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
    } catch (error) {
      console.error('Error setting cache:', error);
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
        localStorage.removeItem(key);
        return null;
      }
      
      return cacheItem.data;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  },

  /**
   * Remove a value from the cache
   * @param key Cache key
   */
  remove(key: string): void {
    localStorage.removeItem(key);
  },
  
  /**
   * Clear cache for all pools
   */
  clearPoolCache(): void {
    const poolCachePrefix = 'pool_data_';
    try {
      // Find all pool cache items and remove them
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(poolCachePrefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error clearing pool cache:', error);
    }
  }
};

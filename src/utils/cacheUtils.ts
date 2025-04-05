
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
   * Update value in existing cache if it exists
   * @param key Cache key
   * @param updateFn Function that takes current value and returns updated value
   * @returns True if cache was updated, false if cache key doesn't exist
   */
  update<T>(key: string, updateFn: (currentValue: T) => T): boolean {
    try {
      const item = localStorage.getItem(key);
      
      // If item doesn't exist in cache, try to set it with the result of updateFn(null)
      if (!item) {
        try {
          // @ts-ignore - We're intentionally passing null here to create a new item
          const initialData = updateFn(null);
          if (initialData !== null) {
            this.set(key, initialData, 15); // Default to 15 minutes
            return true;
          }
          return false;
        } catch (e) {
          return false;
        }
      }
      
      let cacheItem: CacheItem<T>;
      try {
        cacheItem = JSON.parse(item);
      } catch (e) {
        console.error('[Cache] Error parsing cache item:', e);
        return false;
      }
      
      // Check if cache is expired
      if (Date.now() > cacheItem.timestamp) {
        console.log(`[Cache] "${key}" has expired, removing from cache`);
        localStorage.removeItem(key);
        return false;
      }
      
      // Update the data using the provided function
      const updatedData = updateFn(cacheItem.data);
      
      // Create a new cache item with the same expiration time
      const updatedCacheItem: CacheItem<T> = {
        data: updatedData,
        timestamp: cacheItem.timestamp
      };
      
      // Store the updated item
      localStorage.setItem(key, JSON.stringify(updatedCacheItem));
      console.log(`[Cache] Updated "${key}" data`);
      return true;
    } catch (error) {
      console.error('[Cache] Error updating cache:', error);
      return false;
    }
  },
  
  /**
   * Clear cache for all pools and borrower info
   */
  clearPoolCache(): void {
    const poolCachePrefix = 'pool_data_';
    const borrowerInfoPrefix = 'borrower_info_';
    const idToContractKey = 'pool_id_to_contract_map';
    
    try {
      // Find all pool cache items and remove them
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith(poolCachePrefix) || 
          key.startsWith(borrowerInfoPrefix) ||
          key === idToContractKey
        )) {
          localStorage.removeItem(key);
          console.log(`[Cache] Cleared ${key}`);
        }
      }
      console.log('[Cache] Pool cache cleared');
    } catch (error) {
      console.error('[Cache] Error clearing pool cache:', error);
    }
  },
  
  /**
   * Clear user position caches for a specific wallet or pool
   */
  clearUserPositionCache(walletAddress?: string, poolContractAddress?: string): void {
    const userPositionPrefix = 'user_position_';
    
    try {
      // Find and remove user position cache items based on filters
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith(userPositionPrefix)) {
          // If wallet specified, clear only that wallet's positions
          if (walletAddress && !key.includes(walletAddress)) {
            continue;
          }
          
          // If pool specified, clear only that pool's positions
          if (poolContractAddress && !key.includes(poolContractAddress)) {
            continue;
          }
          
          localStorage.removeItem(key);
          console.log(`[Cache] Cleared ${key}`);
        }
      }
      
      console.log('[Cache] User position cache cleared');
    } catch (error) {
      console.error('[Cache] Error clearing user position cache:', error);
    }
  },
  
  /**
   * Check if cache exists for a key (even if expired)
   * @param key Cache key
   * @returns True if cache exists
   */
  exists(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
};

import eventEmitter from './eventEmitter';
import { EVENTS } from '@/hooks/useCacheListener';

// Define a generic type for the cache data
type CacheData<T> = {
  [key: string]: T | undefined;
};

// Create a cache object to store the data
const cache: CacheData<any> = {};

// Define the Cache class
export class Cache {
  /**
   * Sets a value in the cache with a specified key and optional expiration time.
   * @param key The key to store the value under.
   * @param value The value to store in the cache.
   * @param expirationTimeInMinutes Optional expiration time in minutes. If not provided, the value will not expire.
   * @param isUserAction Whether this cache update is the result of a user action.
   */
  static set<T>(key: string, value: T, expirationTimeInMinutes?: number, isUserAction: boolean = false): void {
    const oldValue = cache[key];
    
    if (expirationTimeInMinutes) {
      const expirationTime = new Date().getTime() + expirationTimeInMinutes * 60 * 1000;
      cache[key] = { value, expirationTime };
    } else {
      cache[key] = value;
    }
    
    // Enhanced event emission with more contextual data
    if (key.startsWith('pool_data_')) {
      const poolContractAddress = key.replace('pool_data_contract_', '');
      eventEmitter.emit(EVENTS.POOL_DATA_UPDATED, { 
        key, 
        value, 
        oldValue,
        action: 'set',
        poolContractAddress,
        isUserAction // Pass the flag
      });
    } else if (key.startsWith('user_position_')) {
      const parts = key.split('_');
      const walletAddress = parts.length > 2 ? parts[2] : undefined;
      const poolAddress = parts.length > 3 ? parts[3] : undefined;
      
      eventEmitter.emit(EVENTS.USER_POSITION_UPDATED, { 
        key, 
        value, 
        oldValue,
        action: 'set',
        walletAddress,
        poolAddress,
        isUserAction // Pass the flag
      });
    }
  }

  /**
   * Retrieves a value from the cache by its key.
   * @param key The key to retrieve the value for.
   * @returns The value from the cache, or undefined if the key is not found or the value has expired.
   */
  static get<T>(key: string): T | undefined {
    const cachedValue = cache[key];

    if (cachedValue) {
      if (typeof cachedValue === 'object' && cachedValue !== null && 'expirationTime' in cachedValue && 'value' in cachedValue) {
        const { value, expirationTime } = cachedValue as { value: T, expirationTime: number };
        if (new Date().getTime() <= expirationTime) {
          return value;
        } else {
          // Remove the expired value from the cache
          delete cache[key];
          return undefined;
        }
      } else {
        return cachedValue as T;
      }
    }

    return undefined;
  }

  /**
   * Updates a value in the cache using a callback function.
   * @param key The key of the value to update.
   * @param updateFn A function that takes the current value (or undefined if it doesn't exist) and returns the new value.
   * @param isUserAction Whether this update is the result of a user action.
   */
  static update<T>(key: string, updateFn: (currentValue: T | undefined) => T | undefined, isUserAction: boolean = true): void {
    const currentValue = Cache.get<T>(key);
    const newValue = updateFn(currentValue);
    
    if (newValue !== undefined) {
      // Track if this was an actual change
      const isChanged = JSON.stringify(currentValue) !== JSON.stringify(newValue);
      
      // Only update cache and emit events if there was a real change
      if (isChanged) {
        console.log(`[Cache] Updating ${key} with new value:`, newValue);
        
        // Additional context for events
        const isPoolData = key.startsWith('pool_data_');
        const isUserPosition = key.startsWith('user_position_');
        
        // Store value in cache
        cache[key] = newValue;
        
        // Emit specific update events based on the key type
        if (isPoolData) {
          const poolContractAddress = key.replace('pool_data_contract_', '');
          eventEmitter.emit(EVENTS.POOL_DATA_UPDATED, { 
            key, 
            value: newValue, 
            oldValue: currentValue,
            action: 'update',
            poolContractAddress,
            isUserAction
          });
        } else if (isUserPosition) {
          const parts = key.split('_');
          const walletAddress = parts.length > 2 ? parts[2] : undefined;
          const poolAddress = parts.length > 3 ? parts[3] : undefined;
          
          eventEmitter.emit(EVENTS.USER_POSITION_UPDATED, { 
            key, 
            value: newValue, 
            oldValue: currentValue,
            action: 'update',
            walletAddress,
            poolAddress,
            isUserAction
          });
        }
      } else {
        console.log(`[Cache] No change detected for ${key}, skipping update`);
      }
    } else {
      // If updateFn returns undefined, remove the key from cache
      Cache.delete(key);
    }
  }

  /**
   * Deletes a value from the cache by its key.
   * @param key The key of the value to delete.
   */
  static delete(key: string): void {
    const oldValue = cache[key];
    delete cache[key];
    
    // Enhanced event emission with additional context
    if (key.startsWith('pool_data_')) {
      const poolContractAddress = key.replace('pool_data_contract_', '');
      eventEmitter.emit(EVENTS.POOL_DATA_UPDATED, { 
        key, 
        value: undefined, 
        oldValue, 
        action: 'delete',
        poolContractAddress
      });
    } else if (key.startsWith('user_position_')) {
      const [_, walletAddress, poolAddress] = key.split('_');
      eventEmitter.emit(EVENTS.USER_POSITION_UPDATED, { 
        key, 
        value: undefined, 
        oldValue, 
        action: 'delete',
        walletAddress,
        poolAddress
      });
    }
  }

  /**
   * Clears the entire cache, removing all stored values.
   */
  static clear(): void {
    for (const key in cache) {
      delete cache[key];
    }
  }

  /**
   * Checks if a key exists in the cache.
   * @param key The key to check.
   * @returns True if the key exists and has not expired, false otherwise.
   */
  static exists(key: string): boolean {
    const cachedValue = cache[key];
    
    if (!cachedValue) {
      return false;
    }
    
    // Check for expiration if it's a value with expiration time
    if (typeof cachedValue === 'object' && cachedValue !== null && 'expirationTime' in cachedValue) {
      return new Date().getTime() <= cachedValue.expirationTime;
    }
    
    return true;
  }
  
  /**
   * Clears all pool-related cache entries.
   */
  static clearPoolCache(): void {
    for (const key in cache) {
      if (key.startsWith('pool_') || key.startsWith('user_position_')) {
        delete cache[key];
      }
    }
  }
}

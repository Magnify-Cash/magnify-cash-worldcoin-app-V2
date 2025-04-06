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
   */
  static set<T>(key: string, value: T, expirationTimeInMinutes?: number): void {
    const oldValue = cache[key];
    
    if (expirationTimeInMinutes) {
      const expirationTime = new Date().getTime() + expirationTimeInMinutes * 60 * 1000;
      cache[key] = { value, expirationTime };
    } else {
      cache[key] = value;
    }
    
    // Emit events based on key patterns to notify components
    if (key.startsWith('pool_data_')) {
      eventEmitter.emit(EVENTS.POOL_DATA_UPDATED, { key, value, oldValue });
    } else if (key.startsWith('user_position_')) {
      eventEmitter.emit(EVENTS.USER_POSITION_UPDATED, { key, value, oldValue });
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
   */
  static update<T>(key: string, updateFn: (currentValue: T | undefined) => T): void {
    const currentValue = Cache.get<T>(key);
    const newValue = updateFn(currentValue);
    Cache.set(key, newValue);
    
    // We don't need to emit events here since set() will handle that
  }

  /**
   * Deletes a value from the cache by its key.
   * @param key The key of the value to delete.
   */
  static delete(key: string): void {
    const oldValue = cache[key];
    delete cache[key];
    
    // Notify components about the deleted cache entry
    if (key.startsWith('pool_data_')) {
      eventEmitter.emit(EVENTS.POOL_DATA_UPDATED, { key, value: undefined, oldValue, action: 'delete' });
    } else if (key.startsWith('user_position_')) {
      eventEmitter.emit(EVENTS.USER_POSITION_UPDATED, { key, value: undefined, oldValue, action: 'delete' });
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

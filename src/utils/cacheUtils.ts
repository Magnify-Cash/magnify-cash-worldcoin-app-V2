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
    if (expirationTimeInMinutes) {
      const expirationTime = new Date().getTime() + expirationTimeInMinutes * 60 * 1000;
      cache[key] = { value, expirationTime };
    } else {
      cache[key] = value;
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
  }

  /**
   * Deletes a value from the cache by its key.
   * @param key The key of the value to delete.
   */
  static delete(key: string): void {
    delete cache[key];
  }

  /**
   * Clears the entire cache, removing all stored values.
   */
  static clear(): void {
    for (const key in cache) {
      delete cache[key];
    }
  }
}

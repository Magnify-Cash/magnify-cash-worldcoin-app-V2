
/**
 * Utility function to retry an async operation multiple times before giving up
 * @param operation Function to retry
 * @param retries Number of retries 
 * @param delay Delay between retries in ms
 * @param onError Optional callback for error handling
 * @returns Result of the operation or throws error after all retries fail
 */
export async function retry<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000,
  onError?: (error: any, retriesLeft: number) => void
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 1) {
      throw error;
    }
    
    if (onError) {
      onError(error, retries - 1);
    } else {
      console.error(`Operation failed, retries left: ${retries - 1}`, error);
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(operation, retries - 1, delay, onError);
  }
}

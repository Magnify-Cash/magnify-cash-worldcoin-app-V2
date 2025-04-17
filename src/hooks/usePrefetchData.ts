
import { useEffect } from 'react';
import { prefetchBorrowerInfo } from '@/utils/borrowerInfoUtils';
import { usePoolData } from '@/contexts/PoolDataContext';

/**
 * This hook prefetches data in the background when the app is idle
 * to improve perceived performance on subsequent navigation
 */
export function usePrefetchData() {
  const { pools, lastFetched } = usePoolData();
  
  useEffect(() => {
    // Skip if no pools or if we haven't fetched pools yet
    if (!pools || pools.length === 0 || !lastFetched) {
      return;
    }
    
    // Use requestIdleCallback (or polyfill) to run in the background when browser is idle
    const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
    
    const handle = idleCallback(() => {
      console.log("[usePrefetchData] Background prefetching borrower info for pools");
      
      // Extract contract addresses for all active pools to prefetch
      const contractAddresses = pools
        .filter(pool => pool.contract_address && pool.status === 'active')
        .map(pool => pool.contract_address as string);
      
      // Start prefetching in the background
      if (contractAddresses.length > 0) {
        prefetchBorrowerInfo(contractAddresses).catch(err => {
          console.error("[usePrefetchData] Error prefetching borrower info:", err);
        });
      }
    });
    
    return () => {
      // Cancel the callback if component unmounts
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(handle);
      } else {
        clearTimeout(handle);
      }
    };
  }, [pools, lastFetched]);
  
  return null;
}

// Polyfill for requestIdleCallback
if (!window.requestIdleCallback) {
  window.requestIdleCallback = function(callback) {
    const start = Date.now();
    return setTimeout(function() {
      callback({
        didTimeout: false,
        timeRemaining: function() {
          return Math.max(0, 50 - (Date.now() - start));
        }
      });
    }, 1);
  };
  
  window.cancelIdleCallback = function(id) {
    clearTimeout(id);
  };
}

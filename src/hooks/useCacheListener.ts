
import { useEffect } from 'react';
import eventEmitter from '@/utils/eventEmitter';

// Event names
export const EVENTS = {
  POOL_DATA_UPDATED: 'pool_data_updated',
  USER_POSITION_UPDATED: 'user_position_updated',
  TRANSACTION_COMPLETED: 'transaction_completed'
};

export function useCacheListener(
  eventName: string, 
  callback: (data?: any) => void
) {
  useEffect(() => {
    // Subscribe to the event
    const unsubscribe = eventEmitter.on(eventName, callback);
    
    // Clean up subscription when component unmounts
    return unsubscribe;
  }, [eventName, callback]);
}

// Helper to emit cache update events
export function emitCacheUpdate(eventName: string, data?: any) {
  eventEmitter.emit(eventName, data);
}

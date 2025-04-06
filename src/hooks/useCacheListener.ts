
import { useEffect } from 'react';
import eventEmitter from '@/utils/eventEmitter';

// Event names
export const EVENTS = {
  POOL_DATA_UPDATED: 'pool_data_updated',
  USER_POSITION_UPDATED: 'user_position_updated',
  TRANSACTION_COMPLETED: 'transaction_completed'
};

// Transaction types
export const TRANSACTION_TYPES = {
  SUPPLY: 'supply',
  WITHDRAW: 'withdraw'
};

/**
 * Interface for transaction event data
 */
export interface TransactionEventData {
  type: typeof TRANSACTION_TYPES.SUPPLY | typeof TRANSACTION_TYPES.WITHDRAW;
  amount: number;
  lpAmount?: number;
  poolContractAddress?: string;
  timestamp: number;
  action?: 'deposit' | 'withdrawal';
  isUserAction?: boolean; // Flag to indicate whether this was triggered by a user action
}

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

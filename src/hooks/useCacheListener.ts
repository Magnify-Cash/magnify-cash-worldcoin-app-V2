
import { useEffect } from 'react';
import eventEmitter from '@/utils/eventEmitter';

// Event names
export const EVENTS = {
  POOL_DATA_UPDATED: "POOL_DATA_UPDATED",
  USER_POSITION_UPDATED: "USER_POSITION_UPDATED",
  TRANSACTION_COMPLETED: "TRANSACTION_COMPLETED",
};

// Transaction types
export const TRANSACTION_TYPES = {
  SUPPLY: "supply",
  WITHDRAW: "withdraw",
  REPAY_LOAN: "repay_loan"
};

/**
 * Interface for transaction event data
 */
export interface TransactionEventData {
  type: string;
  amount: number;
  lpAmount?: number;
  poolContractAddress?: string;
  timestamp: number;
  action?: 'deposit' | 'withdrawal' | 'repay';
  isUserAction?: boolean; // Flag to indicate whether this was triggered by a user action
  transactionId?: string; // Unique ID to prevent duplicate handling
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
export const emitCacheUpdate = (eventType: string, data: any) => {
  console.log(`[emitCacheUpdate] Emitting ${eventType} event:`, data);
  eventEmitter.emit(eventType, data);
}

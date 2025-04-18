
import { useEffect } from 'react';
import eventEmitter from '@/utils/eventEmitter';

// Event names
export const EVENTS = {
  POOL_DATA_UPDATED: "POOL_DATA_UPDATED",
  USER_POSITION_UPDATED: "USER_POSITION_UPDATED",
  TRANSACTION_COMPLETED: "TRANSACTION_COMPLETED",
  PORTFOLIO_TOTAL_UPDATED: "PORTFOLIO_TOTAL_UPDATED",
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
  affectsPortfolioTotal?: boolean; // Flag to indicate if this transaction affects the portfolio total
}

/**
 * A hook that listens for events emitted by the cache.
 * @param eventName The name of the event to listen for
 * @param callback The callback to run when the event is emitted
 */
export function useCacheListener(
  eventName: string, 
  callback: (data?: any) => void
) {
  useEffect(() => {
    // Log when the listener is attached
    console.log(`[useCacheListener] Attaching listener for ${eventName}`);
    
    // Subscribe to the event
    const unsubscribe = eventEmitter.on(eventName, (data) => {
      console.log(`[useCacheListener] Event received: ${eventName}`, data);
      callback(data);
    });
    
    // Clean up subscription when component unmounts
    return () => {
      console.log(`[useCacheListener] Removing listener for ${eventName}`);
      unsubscribe();
    };
  }, [eventName, callback]);
}

/**
 * Helper to emit cache update events
 * @param eventType The type of event to emit
 * @param data The data to emit with the event
 */
export const emitCacheUpdate = (eventType: string, data: any) => {
  console.log(`[emitCacheUpdate] Emitting ${eventType} event:`, data);
  
  // Add timestamp if not present
  if (!data.timestamp) {
    data.timestamp = Date.now();
  }
  
  // Add unique transaction ID if not present
  if (!data.transactionId && (data.type === 'supply' || data.type === 'withdraw')) {
    data.transactionId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  
  // Set flag for portfolio total update
  if (data.type === 'supply' || data.type === 'withdraw') {
    data.affectsPortfolioTotal = true;
  }
  
  // Emit the event
  eventEmitter.emit(eventType, data);
  
  // For transactions that affect portfolio total, also emit a specific event
  if (data.affectsPortfolioTotal) {
    eventEmitter.emit(EVENTS.PORTFOLIO_TOTAL_UPDATED, data);
  }
}

/**
 * Helper to create a transaction ID
 * @returns A unique transaction ID
 */
export const generateTransactionId = (): string => {
  return `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}


import React, { useState, useEffect, useRef } from "react";
import { Info } from "lucide-react";
import { useCacheListener, EVENTS } from "@/hooks/useCacheListener";

interface PortfolioSummaryProps {
  totalValue: number;
  isMobile: boolean;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ 
  totalValue, 
  isMobile 
}) => {
  // Use a local state to track the total value with optimistic updates
  const [currentTotalValue, setCurrentTotalValue] = useState(totalValue);
  const processedTransactions = useRef<Set<string>>(new Set());
  const renderCount = useRef(0);

  // Track when we render to help with debugging
  useEffect(() => {
    renderCount.current++;
    console.log(`[PortfolioSummary] Rendering #${renderCount.current} with value: $${currentTotalValue.toFixed(2)}`);
  });

  // Update the local state when props change from parent (synchronization)
  useEffect(() => {
    console.log('[PortfolioSummary] Parent total value updated to:', totalValue);
    setCurrentTotalValue(totalValue);
  }, [totalValue]);

  // Listen for transaction events to update total value optimistically
  useCacheListener(EVENTS.TRANSACTION_COMPLETED, (data) => {
    if (!data) return;
    
    // Skip if we've already processed this transaction
    if (data.transactionId && processedTransactions.current.has(data.transactionId)) {
      console.log("[PortfolioSummary] Skipping already processed transaction:", data.transactionId);
      return;
    }
    
    // Track processed transactions
    if (data.transactionId) {
      console.log("[PortfolioSummary] Processing transaction:", data.transactionId);
      processedTransactions.current.add(data.transactionId);
    }
    
    // Update total value based on transaction type
    if (data.type === 'supply' && data.amount) {
      console.log(`[PortfolioSummary] Optimistically increasing total value by ${data.amount}`);
      setCurrentTotalValue(prev => prev + data.amount);
    } else if (data.type === 'withdraw' && data.amount) {
      console.log(`[PortfolioSummary] Optimistically decreasing total value by ${data.amount}`);
      setCurrentTotalValue(prev => Math.max(0, prev - data.amount));
    }
  });
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="py-3 px-4 bg-gradient-to-r from-[#8B5CF6]/10 to-transparent flex items-center gap-2">
        <Info className="h-5 w-5 text-[#8B5CF6]" />
        <h3 className="font-medium text-base sm:text-lg">Portfolio Summary</h3>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500 mb-1">Total Value</p>
            <p className="text-base sm:text-lg font-semibold">${currentTotalValue.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

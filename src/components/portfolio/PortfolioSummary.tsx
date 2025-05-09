import React, { useEffect, useRef } from "react";
import { Info, TrendingUp, Wallet } from "lucide-react";

interface PortfolioSummaryProps {
  totalValue: number;
  isMobile: boolean;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ 
  totalValue, 
  isMobile 
}) => {
  const renderCount = useRef(0);
  const previousValueRef = useRef(totalValue);
  const skipRenderLogRef = useRef(false);

  // Track when we render and value changes to help with debugging
  useEffect(() => {
    renderCount.current++;
    
    // Skip logging if we've flagged to reduce noise
    if (skipRenderLogRef.current) {
      return;
    }
    
    if (previousValueRef.current !== totalValue) {
      console.log(`[PortfolioSummary] Value changed: $${previousValueRef.current.toFixed(2)} → $${totalValue.toFixed(2)}`);
      previousValueRef.current = totalValue;
      
      // If we've rendered many times, start skipping logs to reduce noise
      if (renderCount.current > 10) {
        skipRenderLogRef.current = true;
        console.log(`[PortfolioSummary] Suppressing further render logs after ${renderCount.current} renders`);
      }
    } else if (renderCount.current <= 5) {
      // Only log the first few unchanged renders to reduce noise
      console.log(`[PortfolioSummary] Rendering #${renderCount.current} with unchanged value: $${totalValue.toFixed(2)}`);
    }
  });
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="py-3 px-4 bg-gradient-to-r from-[#8B5CF6]/10 to-transparent flex items-center gap-2">
        <Info className="h-5 w-5 text-[#8B5CF6]" />
        <h3 className="font-medium text-base sm:text-lg">Portfolio Summary</h3>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="p-3 rounded-lg bg-gray-50 flex items-center">
            <div className="flex-grow">
              <p className="text-xs text-gray-500 mb-1">Total Portfolio Value</p>
              <p className="text-base sm:text-xl font-semibold">${totalValue.toFixed(2)}</p>
            </div>
            <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-[#9b87f5] opacity-70" />
          </div>
          
          {/* Additional statistics can be added here if needed */}
          {/* For example:
          <div className="p-3 rounded-lg bg-gray-50 flex items-center">
            <div className="flex-grow">
              <p className="text-xs text-gray-500 mb-1">Average APY</p>
              <p className="text-base sm:text-xl font-semibold">12.5%</p>
            </div>
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-[#9b87f5] opacity-70" />
          </div>
          */}
        </div>
      </div>
    </div>
  );
};

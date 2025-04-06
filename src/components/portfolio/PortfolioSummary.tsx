
import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";

interface PortfolioSummaryProps {
  totalValue: number;
  isMobile: boolean;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ 
  totalValue, 
  isMobile 
}) => {
  // Use a local state to ensure we always render the latest value
  const [currentTotalValue, setCurrentTotalValue] = useState(totalValue);
  
  // Update the local state when props change
  useEffect(() => {
    console.log('[PortfolioSummary] Total value updated to:', totalValue);
    setCurrentTotalValue(totalValue);
  }, [totalValue]);

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

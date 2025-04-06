
import React, { useEffect, useRef } from "react";
import { Info } from "lucide-react";

interface PortfolioSummaryProps {
  totalValue: number;
  isMobile: boolean;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ 
  totalValue, 
  isMobile 
}) => {
  const renderCount = useRef(0);

  // Track when we render to help with debugging
  useEffect(() => {
    renderCount.current++;
    console.log(`[PortfolioSummary] Rendering #${renderCount.current} with value: $${totalValue.toFixed(2)}`);
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
            <p className="text-base sm:text-lg font-semibold">${totalValue.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

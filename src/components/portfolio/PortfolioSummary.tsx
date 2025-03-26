
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

interface PortfolioSummaryProps {
  totalValue: number;
  totalEarnings: number;
  isMobile: boolean;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ 
  totalValue, 
  totalEarnings, 
  isMobile 
}) => {
  return (
    <Card className="border border-[#8B5CF6]/20 overflow-hidden">
      <CardHeader className="py-4 bg-gradient-to-r from-[#8B5CF6]/10 to-[#6E59A5]/5">
        <CardTitle className="flex items-center">
          <Info className="mr-2 h-5 w-5 text-[#8B5CF6]" />
          <span>Portfolio Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className={`${isMobile ? "px-4 py-4" : "px-6 py-5"}`}>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-[#8B5CF6]/20">
            <p className="text-xs text-gray-500">Total Value</p>
            <p className="text-lg font-semibold">${totalValue.toFixed(2)}</p>
          </div>
          <div className="p-4 rounded-lg border border-[#8B5CF6]/20">
            <p className="text-xs text-gray-500">Total Earnings</p>
            <p className="text-lg font-semibold text-green-600">+${totalEarnings.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

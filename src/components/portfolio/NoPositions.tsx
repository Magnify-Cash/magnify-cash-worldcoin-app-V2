
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NoPositionsProps {
  onShowDemoData?: () => void;
}

export const NoPositions: React.FC<NoPositionsProps> = ({ onShowDemoData }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="border border-[#8B5CF6]/20 overflow-hidden">
      <CardHeader className="py-4 bg-gradient-to-r from-[#8B5CF6]/10 to-[#6E59A5]/5">
        <CardTitle className="flex items-center">
          <Wallet className="mr-2 h-5 w-5 text-[#8B5CF6]" />
          <span>Your Portfolio</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="py-10 flex flex-col items-center justify-center">
          <Coins className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">You don't have any active positions yet</p>
          <Button 
            onClick={() => navigate('/lending')} 
            className="bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] hover:opacity-90"
          >
            Explore Pools
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

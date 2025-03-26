
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const LoadingState: React.FC = () => {
  return (
    <Card className="border border-[#8B5CF6]/20">
      <CardContent className="p-4 sm:p-6">
        <div className="py-6 sm:py-8 flex justify-center items-center">
          <div className="orbit-spinner">
            <div className="orbit"></div>
            <div className="orbit"></div>
            <div className="center"></div>
          </div>
        </div>
        <p className="text-gray-500 text-center">Loading your portfolio...</p>
      </CardContent>
    </Card>
  );
};

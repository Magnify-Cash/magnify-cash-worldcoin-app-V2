
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const LoadingState: React.FC = () => {
  return (
    <Card className="border border-[#8B5CF6]/20">
      <CardContent className="p-6">
        <div className="py-8 flex justify-center items-center">
          <p className="text-gray-500">Loading your portfolio...</p>
        </div>
      </CardContent>
    </Card>
  );
};

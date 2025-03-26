
import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Coins } from "lucide-react";

const Portfolio = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header title="Lending Portfolio" />

      <main className="container max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-center mb-2 sm:mb-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] text-transparent bg-clip-text text-center">
              Your Lending Portfolio
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-700 mb-4 max-w-3xl mx-auto text-center">
            Track and manage your positions across all lending pools.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6">
          <Card className="border border-[#8B5CF6]/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Wallet className="mr-2 h-5 w-5 text-[#8B5CF6]" />
                Portfolio Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-10 flex flex-col items-center justify-center">
                <Coins className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">You don't have any active positions yet</p>
                <Button 
                  onClick={() => window.location.href = '/lending'} 
                  className="bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] hover:opacity-90"
                >
                  Explore Pools
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Portfolio;

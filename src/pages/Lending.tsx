
import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpFromLine, ArrowDownToLine, Wallet, TrendingUp, Coins, Info, Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { LendingPoolCard } from "@/components/LendingPoolCard";
import { UserPortfolioCard } from "@/components/UserPortfolioCard";
import { LendingGraph } from "@/components/LendingGraph";
import { useIsMobile } from "@/hooks/use-mobile";

const Lending = () => {
  const [loading, setLoading] = useState(false);
  const [showDummyData, setShowDummyData] = useState(true);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header title="Lending Dashboard" />

      <main className="container max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] text-transparent bg-clip-text">
              Magnify Cash Lending
            </h1>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDummyData(!showDummyData)}
              className="flex items-center gap-1.5 text-xs"
            >
              {showDummyData ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showDummyData ? "Hide Demo Data" : "Show Demo Data"}
            </Button>
          </div>
          <p className="text-sm sm:text-base text-gray-700 mb-4 max-w-3xl">
            Supply liquidity to earn yield and $MAG rewards. All lending pools use World ID verification to minimize default risk.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <LendingPoolCard 
            title="USDC Pool" 
            apy={8.5} 
            totalSupply={2450000}
            availableLiquidity={185000}
          />
        </div>

        {/* User Portfolio Card */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {showDummyData ? (
            <UserPortfolioCard
              balance={1250.75}
              depositedValue={1200}
              currentValue={1250.75}
              earnings={50.75}
              onSupply={() => {
                toast({
                  title: "Coming Soon",
                  description: "Supply functionality will be available soon",
                });
              }}
              onWithdraw={() => {
                toast({
                  title: "Coming Soon",
                  description: "Withdraw functionality will be available soon",
                });
              }}
            />
          ) : (
            <UserPortfolioCard
              balance={0}
              depositedValue={0}
              currentValue={0}
              earnings={0}
              onSupply={() => {
                toast({
                  title: "Coming Soon",
                  description: "Supply functionality will be available soon",
                });
              }}
              onWithdraw={() => {
                toast({
                  title: "Coming Soon",
                  description: "Withdraw functionality will be available soon",
                });
              }}
            />
          )}
        </div>

        {/* Exchange Rate Graph */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Card className="h-full overflow-hidden">
            <CardHeader className={isMobile ? "pb-1 pt-3 px-3" : "pb-2"}>
              <CardTitle className="text-lg sm:text-xl">Exchange Rate</CardTitle>
              <CardDescription className="text-xs sm:text-sm">USDC to LP token conversion rate over time</CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "p-2" : ""}>
              <LendingGraph />
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-[#8B5CF6]/5 via-[#7E69AB]/10 to-[#6E59A5]/5 border-[#8B5CF6]/20">
          <CardHeader className={isMobile ? "py-3 px-3" : ""}>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Info className="h-4 w-4 sm:h-5 sm:w-5 text-[#8B5CF6]" />
              About Lending Pools
            </CardTitle>
          </CardHeader>
          <CardContent className={`${isMobile ? "px-3 py-2" : ""} text-xs sm:text-sm text-gray-600`}>
            <div className="space-y-3 sm:space-y-4">
              <p>
                <strong>How it works:</strong> When you supply assets to Magnify Cash lending pools, you receive LP tokens representing your share of the pool. These tokens automatically increase in value as borrowers repay their loans with interest.
              </p>
              <p>
                <strong>Risk management:</strong> All borrowers must verify with World ID, providing strong identity verification and reducing the risk of defaults.
              </p>
              <p>
                <strong>$MAG rewards:</strong> In addition to earned interest, you'll receive $MAG governance tokens proportional to your supplied liquidity, giving you voting rights in the Magnify Cash ecosystem.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Lending;

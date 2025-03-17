
import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpFromLine, ArrowDownToLine, Wallet, TrendingUp, Coins, Info } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { LendingPoolCard } from "@/components/LendingPoolCard";
import { UserPortfolioCard } from "@/components/UserPortfolioCard";
import { LendingGraph } from "@/components/LendingGraph";

const Lending = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header title="Lending Dashboard" />

      <main className="container max-w-5xl mx-auto px-4 pt-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] text-transparent bg-clip-text">
            Magnify Cash Lending
          </h1>
          <p className="text-gray-700 mb-4 max-w-3xl">
            Supply liquidity to earn yield and $MAG rewards. All lending pools use World ID verification to minimize default risk.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <LendingPoolCard 
            title="USDC Pool" 
            apy={8.5} 
            totalSupply={2450000}
            availableLiquidity={185000}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">Exchange Rate</CardTitle>
                <CardDescription>USDC to LP token conversion rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <LendingGraph />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
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
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-[#8B5CF6]" />
              About Lending Pools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-600">
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

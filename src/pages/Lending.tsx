
import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpFromLine, ArrowDownToLine, Wallet, TrendingUp, Coins, Info, Eye, EyeOff, Paintbrush } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { LendingPoolCard } from "@/components/LendingPoolCard";
import { UserPortfolioCard } from "@/components/UserPortfolioCard";
import { LendingGraph } from "@/components/LendingGraph";
import { useIsMobile } from "@/hooks/use-mobile";

const Lending = () => {
  const [loading, setLoading] = useState(false);
  const [showDummyData, setShowDummyData] = useState(true);
  const [useNewGradient, setUseNewGradient] = useState(true);
  const isMobile = useIsMobile();

  const handleSupply = () => {
    console.log("Supply button clicked in parent component");
  };

  const handleWithdraw = () => {
    console.log("Withdraw button clicked in parent component");
  };

  const toggleGradient = () => {
    setUseNewGradient(!useNewGradient);
    toast({
      title: `${useNewGradient ? "Original" : "Purple-Magenta"} Gradient Applied`,
      description: `Switched to the ${useNewGradient ? "original" : "purple-magenta"} gradient theme.`,
      duration: 2000,
    });
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header title="Lending Dashboard" />

      <main className="container max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-center mb-2 sm:mb-4">
            <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text text-center ${
              useNewGradient 
                ? "bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#D946EF]" 
                : "bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75]"
            }`}>
              Magnify Cash Lending
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-700 mb-4 max-w-3xl mx-auto text-center">
            Supply liquidity to earn yield. Your returns grow as borrowers repay loans, with rates influenced by borrowing demand and repayment performance.
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDummyData(!showDummyData)}
            className="flex items-center gap-1.5 text-xs"
          >
            {showDummyData ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showDummyData ? "Hide Demo Data" : "Show Demo Data"}
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleGradient}
            className={`flex items-center gap-1.5 text-xs ${
              useNewGradient 
                ? "border-[#D946EF]/30" 
                : "border-[#A11F75]/30"
            }`}
          >
            <Paintbrush className="h-3.5 w-3.5" />
            Switch Gradient
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <LendingPoolCard 
            title="USDC Pool" 
            apy={8.5} 
            totalSupply={2450000}
            availableLiquidity={185000}
            useNewGradient={useNewGradient}
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
              onSupply={handleSupply}
              onWithdraw={handleWithdraw}
            />
          ) : (
            <UserPortfolioCard
              balance={0}
              depositedValue={0}
              currentValue={0}
              earnings={0}
              onSupply={handleSupply}
              onWithdraw={handleWithdraw}
            />
          )}
        </div>

        {/* LP Token Price Graph */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Card className="h-full overflow-hidden">
            <CardHeader className={isMobile ? "pb-1 pt-3 px-3" : "pb-2"}>
              <CardTitle className="text-lg sm:text-xl">LP Token Price Over Time</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Tracks the value of 1 LP token in USDC. Higher value indicates growth</CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "p-2" : ""}>
              <LendingGraph />
            </CardContent>
          </Card>
        </div>

        <Card className={`border ${
          useNewGradient 
            ? "bg-gradient-to-r from-[#8B5CF6]/5 via-[#A855F7]/10 to-[#D946EF]/5 border-[#D946EF]/20" 
            : "bg-gradient-to-r from-[#1A1E8F]/5 via-[#5A1A8F]/10 to-[#A11F75]/5 border-[#A11F75]/20"
        }`}>
          <CardHeader className={isMobile ? "py-3 px-3" : ""}>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Info className={`h-4 w-4 sm:h-5 sm:w-5 ${useNewGradient ? "text-[#A855F7]" : "text-[#5A1A8F]"}`} />
              About Lending Pools
            </CardTitle>
          </CardHeader>
          <CardContent className={`${isMobile ? "px-3 py-2" : ""} text-xs sm:text-sm text-gray-600`}>
            <div className="space-y-4 sm:space-y-5">
              <div>
                <h4 className="font-semibold text-sm sm:text-base text-gray-800 mb-1">How It Works</h4>
                <p className="text-xs sm:text-sm">
                  Deposit assets into Magnify Cash lending pools to receive LP tokens, representing your share of the pool. As borrowers repay loans with interest, your LP tokens increase in value.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm sm:text-base text-gray-800 mb-1">Risk Management</h4>
                <p className="text-xs sm:text-sm">
                  Borrowers must verify their identity with World ID, helping to minimize defaults and ensure a safer lending environment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Lending;

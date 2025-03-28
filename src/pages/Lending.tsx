
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Palette } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { PoolCard } from "@/components/PoolCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { getPools } from "@/lib/poolRequests";
import { LiquidityPool } from "@/types/supabase/liquidity";

const Lending = () => {
  const [loading, setLoading] = useState(true);
  const [pools, setPools] = useState<LiquidityPool[]>([]);
  const [useCustomGradient, setUseCustomGradient] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const poolsData = await getPools();
        setPools(poolsData);
      } catch (error) {
        console.error("Error fetching pools:", error);
        toast({
          title: "Error fetching pools",
          description: "Failed to load pool data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, []);

  const toggleGradient = () => {
    setUseCustomGradient(!useCustomGradient);
    toast({
      title: useCustomGradient ? "Using standard theme" : "Using custom purple theme",
      duration: 2000,
    });
  };

  const gradientStyle = useCustomGradient 
    ? "from-[#8B5CF6] via-[#A855F7] to-[#D946EF]" 
    : "from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75]";

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header title="Lending Dashboard" />

      <main className="container max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        <div className="mb-5 sm:mb-6">
          <div className="flex justify-center mb-2">
            <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r ${gradientStyle} text-transparent bg-clip-text text-center`}>
              Magnify Cash Lending
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-700 mb-4 max-w-3xl mx-auto text-center">
            Supply liquidity to earn yield. Your returns grow as borrowers repay loans, with rates influenced by borrowing demand and repayment performance.
          </p>
        </div>

        <div className="flex gap-2 mb-3 sm:mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleGradient}
            className={`flex items-center gap-1.5 text-xs ${useCustomGradient ? 'border-[#D946EF]/30 hover:bg-[#A855F7]/10' : ''}`}
          >
            <Palette className={`h-3.5 w-3.5 ${useCustomGradient ? 'text-[#A855F7]' : ''}`} />
            {useCustomGradient ? "Standard Theme" : "Purple Theme"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6">
          {loading ? (
            <div className="py-8 text-center text-gray-500 col-span-full">Loading pools...</div>
          ) : (
            pools.map(pool => (
              <PoolCard
                key={pool.id}
                id={pool.id}
                title={pool.name}
                apy={pool.apy}
                totalSupply={pool.total_value_locked}
                availableLiquidity={pool.available_liquidity}
                status={pool.status}
                useCustomGradient={useCustomGradient}
              />
            ))
          )}
        </div>

        <Card className={`${useCustomGradient ? "bg-gradient-to-r from-[#8B5CF6]/5 via-[#A855F7]/10 to-[#D946EF]/5 border-[#D946EF]/20" : "bg-gradient-to-r from-[#8B5CF6]/5 via-[#7E69AB]/10 to-[#6E59A5]/5 border-[#8B5CF6]/20"}`}>
          <CardHeader className={isMobile ? "py-3 px-3" : ""}>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Info className={`h-4 w-4 sm:h-5 sm:w-5 ${useCustomGradient ? "text-[#A855F7]" : "text-[#8B5CF6]"}`} />
              About Lending Pools
            </CardTitle>
          </CardHeader>
          <CardContent className={`${isMobile ? "px-3 py-2" : ""} text-xs sm:text-sm text-gray-600`}>
            <div className="space-y-4 sm:space-y-5">
              <div>
                <h4 className="font-semibold text-sm sm:text-base text-gray-800 mb-1">How It Works</h4>
                <p className="text-xs sm:text-sm">
                  Magnify Cash offers <span className="font-medium">termed liquidity pools</span>, where lenders contribute funds during a <span className="font-medium">warm-up period</span>. Once the pool reaches its funding target or the warm-up period ends, borrowers can access loans. Lenders receive LP tokens representing their share of the pool, which increases in value as loans are repaid with interest. Since pools operate on fixed terms, funds remain in the pool until maturity, at which point lenders can withdraw their balance along with earnings.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm sm:text-base text-gray-800 mb-1">Pool Lifecycle</h4>
                <p className="text-xs sm:text-sm">
                  Each pool has a <span className="font-medium">fixed term</span> (e.g., 6 or 12 months). New loans stop being issued towards the end of the term to ensure proper repayment before pool closure. Pools enter a <span className="font-medium">cooldown period</span> before becoming available for <span className="font-medium">withdrawal</span>. At maturity, lenders can <span className="font-medium">redeem their LP tokens for earnings</span> based on the final pool performance.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm sm:text-base text-gray-800 mb-1">Risk Management</h4>
                <p className="text-xs sm:text-sm">
                  To enhance security, all borrowers must verify their identity using <span className="font-medium">World ID</span>, reducing default risks and ensuring a safer lending environment. Additionally, lenders can track <span className="font-medium">loan repayment rates</span> and <span className="font-medium">pool performance metrics</span> to make informed decisions.
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, ArrowUpRight, TrendingUp, Info } from "lucide-react";
import { getPools, getUserPoolPosition } from "@/lib/poolRequests";
import { LiquidityPool } from "@/types/supabase/liquidity";
import { toast } from "@/components/ui/use-toast";
import { ActivePositionCard } from "@/components/ActivePositionCard";
import { useIsMobile } from "@/hooks/use-mobile";

const Portfolio = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [pools, setPools] = useState<LiquidityPool[]>([]);
  const [activePool, setActivePool] = useState<LiquidityPool | null>(null);
  const [showDummyData, setShowDummyData] = useState(true);
  const [userPosition, setUserPosition] = useState({
    balance: 1200,
    depositedValue: 1200,
    currentValue: 1250.75,
    earnings: 50.75
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const poolsData = await getPools();
        setPools(poolsData);
        
        const userPositionData = await getUserPoolPosition(1);
        
        if (userPositionData) {
          const poolWithPosition = poolsData.find(pool => pool.id === 1);
          if (poolWithPosition) {
            setActivePool(poolWithPosition);
          }
        }
      } catch (error) {
        console.error("Error fetching portfolio data:", error);
        toast({
          title: "Error",
          description: "Could not load your portfolio data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

        {loading ? (
          <Card className="border border-[#8B5CF6]/20">
            <CardContent className="p-6">
              <div className="py-8 flex justify-center items-center">
                <p className="text-gray-500">Loading your portfolio...</p>
              </div>
            </CardContent>
          </Card>
        ) : showDummyData && activePool ? (
          <div className="space-y-6">
            <Card className="border border-[#8B5CF6]/20 overflow-hidden">
              <CardHeader className="py-4 bg-gradient-to-r from-[#8B5CF6]/10 to-[#6E59A5]/5">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Wallet className="mr-2 h-5 w-5 text-[#8B5CF6]" />
                    <span>Your Active Positions</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className={`${isMobile ? "px-3 py-4" : "px-6 py-5"}`}>
                <ActivePositionCard 
                  poolId={activePool.id}
                  poolName={activePool.name}
                  balance={userPosition.balance}
                  depositedValue={userPosition.depositedValue}
                  currentValue={userPosition.currentValue}
                  earnings={userPosition.earnings}
                  status={activePool.status}
                  apy={activePool.apy}
                />

                <div className="flex justify-center mt-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowDummyData(false)} 
                    className="text-xs text-gray-500"
                  >
                    Remove Demo Data
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                    <p className="text-lg font-semibold">${userPosition.currentValue.toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-lg border border-[#8B5CF6]/20">
                    <p className="text-xs text-gray-500">Total Earnings</p>
                    <p className="text-lg font-semibold text-green-600">+${userPosition.earnings.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border border-[#8B5CF6]/20 overflow-hidden">
            <CardHeader className="py-4 bg-gradient-to-r from-[#8B5CF6]/10 to-[#6E59A5]/5">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wallet className="mr-2 h-5 w-5 text-[#8B5CF6]" />
                  <span>Your Portfolio</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowDummyData(true)} 
                  className="text-xs text-gray-500"
                >
                  Show Demo Data
                </Button>
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
        )}
      </main>
    </div>
  );
};

export default Portfolio;

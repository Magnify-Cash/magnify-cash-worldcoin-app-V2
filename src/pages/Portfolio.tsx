
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Coins, ArrowUpRight, TrendingUp, Info } from "lucide-react";
import { getPools, getUserPoolPosition } from "@/lib/poolRequests";
import { LiquidityPool } from "@/types/supabase/liquidity";
import { toast } from "@/components/ui/use-toast";
import { UserPortfolioCard } from "@/components/UserPortfolioCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

const Portfolio = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [pools, setPools] = useState<LiquidityPool[]>([]);
  const [activePool, setActivePool] = useState<LiquidityPool | null>(null);
  const [userPosition, setUserPosition] = useState({
    balance: 1200,
    depositedValue: 1200,
    currentValue: 1250.75,
    earnings: 50.75
  });
  const [showDummyData, setShowDummyData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const poolsData = await getPools();
        setPools(poolsData);
        
        // For demonstration, we'll assume the user has a position in the USDC pool (id=1)
        // In a real app, you would fetch all positions for the user
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

  const handleSupply = () => {
    navigate("/pool/1");
  };

  const handleWithdraw = () => {
    navigate("/pool/1");
  };

  const toggleDummyData = () => {
    setShowDummyData(!showDummyData);
  };

  const getStatusColor = (status: 'warm-up' | 'active' | 'cooldown' | 'withdrawal') => {
    switch (status) {
      case 'warm-up':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cooldown':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'withdrawal':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
                <div className="rounded-lg border border-[#8B5CF6]/20 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#8B5CF6]/5 to-transparent p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">{activePool.name}</h3>
                          <Badge variant="outline" className={`${getStatusColor(activePool.status)}`}>
                            {activePool.status.charAt(0).toUpperCase() + activePool.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <TrendingUp className="h-3.5 w-3.5 mr-1 text-[#8B5CF6]" />
                          <span>{activePool.apy}% APY</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/pool/${activePool.id}`)} 
                        className="flex items-center gap-1 text-[#8B5CF6] border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/10"
                      >
                        View Pool 
                        <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Your Balance</span>
                          <span className="font-medium">{userPosition.balance.toFixed(2)} LP</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Deposited Value</span>
                          <span className="font-medium">${userPosition.depositedValue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Current Value</span>
                          <span className="font-medium">${userPosition.currentValue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Earnings</span>
                          <span className="font-medium text-green-600">
                            +{userPosition.earnings.toFixed(2)} (+{((userPosition.earnings / userPosition.depositedValue) * 100).toFixed(2)}%)
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button 
                          onClick={handleSupply} 
                          className="flex-1 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] hover:opacity-90"
                        >
                          Supply More
                        </Button>
                        <Button 
                          onClick={handleWithdraw} 
                          variant="outline" 
                          className="flex-1 border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                        >
                          Withdraw
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleDummyData} 
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
                  onClick={toggleDummyData} 
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

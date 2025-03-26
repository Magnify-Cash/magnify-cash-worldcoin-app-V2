
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Coins, ArrowUpRight } from "lucide-react";
import { getPools, getUserPoolPosition } from "@/lib/poolRequests";
import { LiquidityPool } from "@/types/supabase/liquidity";
import { toast } from "@/components/ui/use-toast";
import { UserPortfolioCard } from "@/components/UserPortfolioCard";

const Portfolio = () => {
  const navigate = useNavigate();
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
          {loading ? (
            <Card className="border border-[#8B5CF6]/20">
              <CardContent className="p-6">
                <div className="py-8 flex justify-center items-center">
                  <p className="text-gray-500">Loading your portfolio...</p>
                </div>
              </CardContent>
            </Card>
          ) : showDummyData && activePool ? (
            <div className="grid grid-cols-1 gap-4">
              <Card className="border border-[#8B5CF6]/20">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Wallet className="mr-2 h-5 w-5 text-[#8B5CF6]" />
                      <span>Active Positions</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleDummyData()} 
                      className="text-xs text-gray-500"
                    >
                      Toggle Demo Data
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 border-[#8B5CF6]/20">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h3 className="font-medium text-lg">{activePool.name}</h3>
                          <div className="flex items-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              activePool.status === 'active' ? 'bg-green-100 text-green-800' : 
                              activePool.status === 'warm-up' ? 'bg-blue-100 text-blue-800' :
                              activePool.status === 'cooldown' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {activePool.status === 'active' ? 'Active' : 
                               activePool.status === 'warm-up' ? 'Warm-up' :
                               activePool.status === 'cooldown' ? 'Cooldown' : 'Withdrawal'}
                            </span>
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
                      
                      <UserPortfolioCard 
                        balance={userPosition.balance}
                        depositedValue={userPosition.depositedValue}
                        currentValue={userPosition.currentValue}
                        earnings={userPosition.earnings}
                        onSupply={handleSupply}
                        onWithdraw={handleWithdraw}
                        hideButtons={true}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border border-[#8B5CF6]/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Wallet className="mr-2 h-5 w-5 text-[#8B5CF6]" />
                    Portfolio Overview
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleDummyData()} 
                    className="text-xs text-gray-500"
                  >
                    Show Demo Data
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
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
        </div>
      </main>
    </div>
  );
};

export default Portfolio;

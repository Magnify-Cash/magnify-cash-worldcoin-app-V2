
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Coins, TrendingUp, AlertCircle, Info, Wallet } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { LendingGraph } from "@/components/LendingGraph";
import { useIsMobile } from "@/hooks/use-mobile";
import { getPoolById, getUserPoolPosition } from "@/lib/poolRequests";
import { LiquidityPool, UserPoolPosition } from "@/types/supabase/liquidity";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SupplyModal } from "@/components/SupplyModal";
import { WithdrawModal } from "@/components/WithdrawModal";

const PoolDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [loading, setLoading] = useState(true);
  const [pool, setPool] = useState<LiquidityPool | null>(null);
  const [userPosition, setUserPosition] = useState<UserPoolPosition | null>(null);
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  const poolId = id ? parseInt(id) : 0;

  useEffect(() => {
    const fetchPoolData = async () => {
      if (!poolId) {
        navigate("/lending");
        return;
      }
      
      try {
        setLoading(true);
        const poolData = await getPoolById(poolId);
        
        if (!poolData) {
          toast({
            title: "Pool not found",
            description: "The requested pool does not exist.",
            variant: "destructive",
          });
          navigate("/lending");
          return;
        }
        
        setPool(poolData);
        
        // Fetch user position if we have a pool
        const position = await getUserPoolPosition(poolId);
        setUserPosition(position);
      } catch (error) {
        console.error("Error fetching pool data:", error);
        toast({
          title: "Error",
          description: "Failed to load pool data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPoolData();
  }, [poolId, navigate]);

  const getStatusColor = () => {
    if (!pool) return '';
    
    switch (pool.status) {
      case 'warm-up':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(value);
  };

  const handleSupply = () => {
    if (pool?.status === 'completed') {
      toast({
        title: "Pool is closed",
        description: "This pool is no longer accepting new deposits.",
        variant: "destructive",
      });
      return;
    }
    
    setShowSupplyModal(true);
  };

  const handleWithdraw = () => {
    if (!userPosition || userPosition.total_value_locked <= 0) {
      toast({
        title: "No position",
        description: "You don't have any assets to withdraw from this pool.",
        variant: "destructive",
      });
      return;
    }
    
    setShowWithdrawModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Pool Details" />
        <main className="container max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
          <div className="py-20 text-center">
            <div className="animate-pulse">Loading pool data...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header title={`${pool?.name || 'Pool'} Details`} />

      <main className="container max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2"
          onClick={() => navigate("/lending")}
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Pools
        </Button>

        {pool && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div className="flex items-center gap-2 mb-2 sm:mb-0">
                <Coins className="h-6 w-6 text-[#8B5CF6]" />
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {pool.name}
                </h1>
                <Badge variant="outline" className={`ml-2 ${getStatusColor()}`}>
                  {pool.status.charAt(0).toUpperCase() + pool.status.slice(1)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-[#8B5CF6]" />
                  <span className="text-[#8B5CF6]">{pool.apy}% APY</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
              {/* Pool Stats */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Pool Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Supply</p>
                      <p className="text-lg font-semibold">{formatValue(pool.total_value_locked)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Available Liquidity</p>
                      <p className="text-lg font-semibold">{formatValue(pool.available_liquidity)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Utilization Rate</p>
                      <p className="text-lg font-semibold">
                        {((pool.total_value_locked - pool.available_liquidity) / pool.total_value_locked * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Your Position */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Your Position
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userPosition ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Deposited Value</p>
                        <p className="text-lg font-semibold">{formatValue(userPosition.token_a_amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Current Value</p>
                        <p className="text-lg font-semibold">{formatValue(userPosition.total_value_locked)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Earnings</p>
                        <p className="text-lg font-semibold text-green-600">
                          {formatValue(userPosition.total_value_locked - userPosition.token_a_amount)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3 text-sm text-gray-500">
                      You don't have any assets in this pool yet.
                    </div>
                  )}

                  <Separator className="my-4" />

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSupply} 
                      disabled={pool.status === 'completed'}
                      className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED]"
                    >
                      Supply
                    </Button>
                    <Button 
                      onClick={handleWithdraw} 
                      variant="outline" 
                      disabled={!userPosition || userPosition.total_value_locked <= 0}
                      className="flex-1"
                    >
                      Withdraw
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* LP Token Price Graph */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6">
              <Card className="h-full overflow-hidden">
                <CardHeader className={isMobile ? "pb-1 pt-3 px-3" : "pb-2"}>
                  <CardTitle className="text-lg sm:text-xl">LP Token Price Over Time</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Tracks the value of 1 LP token in {pool.token_a}. Higher value indicates growth
                  </CardDescription>
                </CardHeader>
                <CardContent className={isMobile ? "p-2" : ""}>
                  <LendingGraph />
                </CardContent>
              </Card>
            </div>

            {/* About This Pool */}
            <Card className="bg-gradient-to-r from-[#8B5CF6]/5 via-[#7E69AB]/10 to-[#6E59A5]/5 border-[#8B5CF6]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-[#8B5CF6]" />
                  About This Pool
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-base text-gray-800 mb-1">Pool Description</h4>
                    <p className="text-sm">
                      {pool.metadata?.description || `This is a ${pool.name} lending pool where you can deposit ${pool.token_a} to earn yield.`}
                    </p>
                  </div>
                  
                  {pool.status === 'warm-up' && (
                    <div className="bg-amber-50 p-4 rounded-md">
                      <div className="flex items-start">
                        <AlertCircle className="mr-2 h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800">Warm-up Period</p>
                          <p className="text-sm text-amber-700">
                            This pool is in the warm-up phase. During this period, deposits are accepted but interest accrual may not have started yet.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {pool.status === 'completed' && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex items-start">
                        <AlertCircle className="mr-2 h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-800">Pool Completed</p>
                          <p className="text-sm text-gray-700">
                            This pool is no longer accepting new deposits. Existing depositors can withdraw their assets at any time.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      {/* Modals */}
      {pool && (
        <>
          <SupplyModal isOpen={showSupplyModal} onClose={() => setShowSupplyModal(false)} />
          
          <WithdrawModal 
            isOpen={showWithdrawModal} 
            onClose={() => setShowWithdrawModal(false)} 
            lpBalance={userPosition?.token_b_amount || 0}
            lpValue={userPosition?.total_value_locked || 0}
          />
        </>
      )}
    </div>
  );
};

export default PoolDetails;

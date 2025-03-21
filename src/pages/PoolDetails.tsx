import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Coins, 
  TrendingUp, 
  AlertCircle, 
  Info, 
  Wallet, 
  Clock, 
  BarChart, 
  Lock, 
  Unlock, 
  Timer,
  Circle,
  CircleCheck 
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { getPoolById, getUserPoolPosition } from "@/lib/poolRequests";
import { LiquidityPool, UserPoolPosition } from "@/types/supabase/liquidity";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SupplyModal } from "@/components/SupplyModal";
import { WithdrawModal } from "@/components/WithdrawModal";
import { Progress } from "@/components/ui/progress";
import { UserPortfolioCard } from "@/components/UserPortfolioCard";
import { formatToLocalTime, formatDateRange } from "@/utils/dateUtils";

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
        
        if (poolData) {
          if (poolId === 1) {
            poolData.name = "Pool A";
          } else if (poolId === 2) {
            poolData.name = "Pool B";
          } else if (poolId === 3) {
            poolData.name = "Pool C";
          }
        }
        
        setPool(poolData);
        
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

  const getStatusIcon = () => {
    if (!pool) return null;
    
    switch (pool.status) {
      case 'warm-up':
        return <Timer className="h-4 w-4 mr-1 text-amber-500" />;
      case 'active':
        return <CircleCheck className="h-4 w-4 mr-1 text-green-500" />;
      case 'completed':
        return <CircleCheck className="h-4 w-4 mr-1 text-gray-500" />;
      default:
        return <Circle className="h-4 w-4 mr-1 text-gray-500" />;
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

  const calculateProgressPercentage = () => {
    if (!pool) return 0;
    
    const goal = 15000;
    const progress = (pool.total_value_locked / goal) * 100;
    return Math.min(progress, 100);
  };

  const getPoolMaturityDate = (): Date => {
    return new Date(2025, 11, 12, 12, 0, 0);
  };

  const getPoolLockDate = (): Date => {
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, 2, 15);
  };

  const getWarmupPeriod = (): [Date, Date] => {
    const currentYear = new Date().getFullYear();
    return [
      new Date(currentYear, 2, 1),
      new Date(currentYear, 2, 14)
    ];
  };

  const getFormattedDateInfo = () => {
    if (!pool) return "";
    
    switch (pool.status) {
      case 'active':
        const maturityDate = getPoolMaturityDate();
        return `Funds locked until: \n${formatToLocalTime(maturityDate)}`;
      case 'warm-up':
        const [startDate, endDate] = getWarmupPeriod();
        const lockDate = getPoolLockDate();
        const maturityDateForWarmup = getPoolMaturityDate();
        return `Warm-up: ${formatDateRange(startDate, endDate)}\nLocks: ${formatToLocalTime(lockDate, 'd MMM yyyy')}\nUnlocks: ${formatToLocalTime(maturityDateForWarmup, 'd MMM yyyy')}`;
      case 'completed':
        return "Pool is completed";
      default:
        return "";
    }
  };

  const getLPTokenPrice = (): number => {
    return 1.25;
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

  const depositedValue = userPosition?.token_a_amount || 0;
  const currentValue = userPosition?.total_value_locked || 0;
  const earnings = currentValue - depositedValue;

  const shouldShowSupplyButton = pool?.status !== 'active' && pool?.status !== 'completed';
  const shouldShowWithdrawButton = pool?.status !== 'active';

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header title={`${pool?.name || 'Pool'} Details`} />

      <main className="container max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        {pool && (
          <>
            <Card className="mb-6 border border-[#8B5CF6]/20 overflow-hidden">
              <div className="bg-gradient-to-r from-[#8B5CF6]/10 to-[#6E59A5]/5 py-4 px-6 flex justify-center">
                <div className="flex items-center gap-3">
                  <div className="bg-[#8B5CF6]/20 rounded-full p-2 flex items-center justify-center">
                    <Coins className="h-5 w-5 sm:h-6 sm:w-6 text-[#8B5CF6]" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {pool.name}
                  </h1>
                  <Badge variant="outline" className={`flex items-center ${getStatusColor()}`}>
                    {getStatusIcon()}
                    <span>{pool.status.charAt(0).toUpperCase() + pool.status.slice(1)}</span>
                  </Badge>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6">
              <Card className="w-full border border-[#8B5CF6]/20 overflow-hidden">
                <CardHeader className="pb-2 pt-4 bg-gradient-to-r from-[#8B5CF6]/10 to-[#6E59A5]/5">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-[#8B5CF6]" />
                    Pool Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className={`${isMobile ? "px-3 py-2" : "pt-5"} space-y-3 sm:space-y-4`}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Total Supply</p>
                      <p className="text-sm sm:text-lg font-semibold">{formatValue(pool.total_value_locked)}</p>
                    </div>
                    
                    {(pool.status === 'active' || pool.status === 'completed') && (
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Available Liquidity</p>
                        <p className="text-sm sm:text-lg font-semibold">{formatValue(pool.available_liquidity)}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">APY</p>
                      <p className="text-sm sm:text-lg font-semibold text-[#8B5CF6]">
                        <TrendingUp className="h-4 w-4 inline mr-1" />
                        {pool.apy}%
                      </p>
                    </div>
                    
                    {pool.status === 'active' && (
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Utilization Rate</p>
                        <p className="text-sm sm:text-lg font-semibold">
                          {((pool.total_value_locked - pool.available_liquidity) / pool.total_value_locked * 100).toFixed(2)}%
                        </p>
                      </div>
                    )}
                    
                    {pool.status === 'completed' && (
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Final LP Price</p>
                        <p className="text-sm sm:text-lg font-semibold">${getLPTokenPrice().toFixed(2)}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 sm:mt-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs sm:text-sm text-gray-500">Target</span>
                      <span className="text-xs sm:text-sm font-medium">{formatValue(pool.total_value_locked)} / $15,000</span>
                    </div>
                    <Progress 
                      value={calculateProgressPercentage()} 
                      className="h-3 bg-gray-100" 
                    />
                  </div>

                  <div className="mt-4 sm:mt-6">
                    {pool.status === 'active' ? (
                      <div className="flex justify-center">
                        <div className="flex items-start">
                          <Lock className="h-4 w-4 text-[#8B5CF6] mt-1 flex-shrink-0 mr-2" />
                          <div className="text-center">
                            <p className="text-xs sm:text-sm text-gray-500 font-medium">
                              Funds locked until:
                            </p>
                            <p className="text-xs sm:text-sm text-gray-700">
                              {formatToLocalTime(getPoolMaturityDate(), 'h:mma')}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-700">
                              {formatToLocalTime(getPoolMaturityDate(), 'd MMM yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : pool.status === 'warm-up' ? (
                      <div className="flex justify-center">
                        <div className="flex items-start">
                          <Unlock className="h-4 w-4 text-[#8B5CF6] mt-1 flex-shrink-0 mr-2" />
                          <div className="text-center">
                            <p className="text-xs sm:text-sm text-gray-500">
                              Warm-up: {formatDateRange(getWarmupPeriod()[0], getWarmupPeriod()[1])}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-700">
                              Locks: {formatToLocalTime(getPoolLockDate(), 'd MMM yyyy')}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-700">
                              Unlocks: {formatToLocalTime(getPoolMaturityDate(), 'd MMM yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div className="flex items-start">
                          <Clock className="h-4 w-4 text-[#8B5CF6] mt-1 flex-shrink-0 mr-2" />
                          <p className="text-xs sm:text-sm text-gray-500 font-medium text-center">
                            Pool is completed
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <UserPortfolioCard
                balance={userPosition?.token_b_amount || 0}
                depositedValue={depositedValue}
                currentValue={currentValue}
                earnings={earnings}
                onSupply={handleSupply}
                onWithdraw={handleWithdraw}
                hideButtons={pool.status === 'active'}
                showSupplyButton={shouldShowSupplyButton}
                showWithdrawButton={shouldShowWithdrawButton}
              />
            </div>

            <Card className="bg-gradient-to-r from-[#1A1E8F]/5 via-[#5A1A8F]/10 to-[#A11F75]/5 border-[#8B5CF6]/20">
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

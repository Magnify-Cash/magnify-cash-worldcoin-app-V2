
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, TrendingUp, AlertCircle, Info, Wallet, Clock, BarChart, Lock, Unlock, Shield, Package } from "lucide-react";
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
        return <Clock className="h-4 w-4 mr-1.5" />;
      case 'active':
        return <Lock className="h-4 w-4 mr-1.5" />;
      case 'completed':
        return <Package className="h-4 w-4 mr-1.5" />;
      default:
        return null;
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
        return `Funds locked until: \n${formatToLocalTime(maturityDate, 'h:mma')}\n${formatToLocalTime(maturityDate, 'd MMM yyyy')}`;
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
            {/* New redesigned pool header section */}
            <div className="mb-6">
              <div className="bg-gradient-to-r from-[#8B5CF6]/10 via-[#7E69AB]/10 to-[#6E59A5]/5 rounded-lg p-4 sm:p-6 border border-[#8B5CF6]/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center justify-center bg-[#8B5CF6]/10 p-3 rounded-full h-12 w-12 sm:h-14 sm:w-14">
                      <Coins className="h-6 w-6 sm:h-8 sm:w-8 text-[#8B5CF6]" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{pool.name}</h1>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className={`${getStatusColor()} flex items-center px-2.5 py-1`}>
                          {getStatusIcon()}
                          <span>{pool.status.charAt(0).toUpperCase() + pool.status.slice(1)}</span>
                        </Badge>
                        {pool.status !== 'completed' && (
                          <p className="ml-3 text-sm text-gray-600 flex items-center">
                            <TrendingUp className="h-3.5 w-3.5 mr-1 text-[#8B5CF6]" />
                            <span>{pool.apy}% APY</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start sm:items-end">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Shield className="h-4 w-4 text-[#8B5CF6]" />
                      <span>Worldcoin Verified</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Created {formatToLocalTime(new Date(2023, 0, 15), 'd MMM yyyy')}</p>
                  </div>
                </div>
              </div>
            </div>

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
                    
                    {(pool.status === 'warm-up' || pool.status === 'active' || pool.status === 'completed') && (
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">APY</p>
                        <p className="text-sm sm:text-lg font-semibold text-[#8B5CF6]">{pool.apy}%</p>
                      </div>
                    )}
                    
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
                      <div className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-[#8B5CF6] mt-0.5" />
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 whitespace-pre-line">
                            {getFormattedDateInfo()}
                          </p>
                        </div>
                      </div>
                    ) : pool.status === 'warm-up' ? (
                      <div className="flex items-start gap-2">
                        <Unlock className="h-4 w-4 text-[#8B5CF6] mt-0.5" />
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 whitespace-pre-line">
                            {getFormattedDateInfo()}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-[#8B5CF6] mt-0.5" />
                        <p className="text-xs sm:text-sm text-gray-500">
                          {getFormattedDateInfo()}
                        </p>
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

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
  CircleCheck,
  HelpCircle
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { getPoolById, getUserPoolPosition } from "@/lib/poolRequests";
import { LiquidityPool, UserPoolPosition } from "@/types/supabase/liquidity";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SupplyModal } from "@/components/SupplyModal";
import { WithdrawModal } from "@/components/WithdrawModal";
import { UserPortfolioCard } from "@/components/UserPortfolioCard";
import { formatToLocalTime, formatDateRange, getDaysBetween, formatUnlockDate } from "@/utils/dateUtils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PoolPriceGraph } from "@/components/PoolPriceGraph";

const PoolDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [loading, setLoading] = useState(true);
  const [pool, setPool] = useState<LiquidityPool | null>(null);
  const [userPosition, setUserPosition] = useState<UserPoolPosition | null>(null);
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [hasDummyData, setHasDummyData] = useState(false);
  
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
        
        const position = await getUserPoolPosition(poolId);
        if (position) {
          setUserPosition(position);
          setHasDummyData(true);
        }
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
      case 'cooldown':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'withdrawal':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    if (!pool) return null;
    
    switch (pool.status) {
      case 'warm-up':
        return <div className="h-4 w-4 rounded-full bg-amber-500 mr-1.5"></div>;
      case 'active':
        return <div className="h-4 w-4 rounded-full bg-green-500 mr-1.5"></div>;
      case 'cooldown':
        return <div className="h-4 w-4 rounded-full bg-gray-500 mr-1.5"></div>;
      case 'withdrawal':
        return <div className="h-4 w-4 rounded-full bg-purple-500 mr-1.5"></div>;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-500 mr-1.5"></div>;
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

  const formatValueNoDecimals = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
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

  const getWarmupDays = (): number => {
    const [startDate, endDate] = getWarmupPeriod();
    return getDaysBetween(startDate, endDate);
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
        return `Warm-up: ${formatDateRange(startDate, endDate)}\nLocks: ${formatToLocalTime(lockDate, 'd MMM yyyy')}\nUnlocks: ${formatUnlockDate(maturityDateForWarmup)}`;
      case 'cooldown':
        return "Pool is in cooldown";
      case 'withdrawal':
        return "Pool is in withdrawal";
      default:
        return "";
    }
  };

  const getLPTokenPrice = (): number => {
    return 1.25;
  };

  const getLockDaysRemaining = (): number => {
    const now = new Date();
    const maturityDate = getPoolMaturityDate();
    return getDaysBetween(now, maturityDate);
  };

  const handleSupply = () => {
    if (pool?.status === 'withdrawal') {
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

  const toggleDummyData = () => {
    if (hasDummyData) {
      setUserPosition(null);
      setHasDummyData(false);
      toast({
        title: "Dummy data removed",
        description: "User position has been cleared.",
      });
    } else {
      const dummyPosition: UserPoolPosition = {
        id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: "user123",
        pool_id: poolId,
        token_a_amount: 1200,
        token_b_amount: 1200,
        total_value_locked: 1250.75
      };
      setUserPosition(dummyPosition);
      setHasDummyData(true);
      toast({
        title: "Dummy data added",
        description: "User position has been simulated.",
      });
    }
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

  const shouldShowSupplyButton = pool?.status !== 'active' && pool?.status !== 'withdrawal';
  const shouldShowWithdrawButton = pool?.status !== 'active';

  const getPoolInfo = () => {
    if (!pool) return null;
    
    switch (poolId) {
      case 1:
        return {
          warmupPeriod: "14 days",
          lockDuration: "180 days",
          borrowerLoanAmount: "$10 - $30",
          borrowerLoanPeriod: "30 days",
          borrowerInterest: "8.5%",
          originationFee: "10%"
        };
      case 2:
        return {
          warmupPeriod: "30 days",
          lockDuration: "365 days",
          borrowerLoanAmount: "$10 - $30",
          borrowerLoanPeriod: "60 days",
          borrowerInterest: "6.2%",
          originationFee: "10%"
        };
      case 3:
        return {
          warmupPeriod: "7 days",
          lockDuration: "90 days",
          borrowerLoanAmount: "$10 - $30",
          borrowerLoanPeriod: "15 days",
          borrowerInterest: "4.8%",
          originationFee: "10%"
        };
      default:
        return {
          warmupPeriod: "14 days",
          lockDuration: "180 days",
          borrowerLoanAmount: "$10 - $30",
          borrowerLoanPeriod: "30 days",
          borrowerInterest: "6.5%",
          originationFee: "10%"
        };
    }
  };

  const poolInfo = getPoolInfo();

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header title={`${pool?.name || 'Pool'}`} />

      <main className="container max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        {pool && (
          <>
            <Card className="mb-6 border border-[#8B5CF6]/20 overflow-hidden">
              <div className="bg-gradient-to-r from-[#8B5CF6]/10 to-[#6E59A5]/5 py-5 px-6 flex justify-center">
                <div className="flex items-center gap-3">
                  <div className="bg-[#8B5CF6]/20 rounded-full p-2 flex items-center justify-center">
                    <Coins className="h-5 w-5 sm:h-6 sm:w-6 text-[#8B5CF6]" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {pool.name}
                  </h1>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6">
              <Card className="w-full border border-[#8B5CF6]/20 overflow-hidden">
                <CardHeader className="pb-2 pt-4 bg-gradient-to-r from-[#8B5CF6]/10 to-[#6E59A5]/5">
                  <CardTitle className="text-xl flex items-center gap-2 justify-center">
                    <BarChart className="h-5 w-5 text-[#8B5CF6]" />
                    Pool Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className={`${isMobile ? "px-3 py-2" : "pt-5"} space-y-3 sm:space-y-4`}>
                  <div className="flex justify-center mt-1">
                    <Badge variant="outline" className={`flex items-center ${getStatusColor()}`}>
                      {getStatusIcon()}
                      <span>{pool.status.charAt(0).toUpperCase() + pool.status.slice(1)}</span>
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">                    
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Total Supply</p>
                      <p className="text-sm sm:text-lg font-semibold">{formatValue(pool.total_value_locked)}</p>
                    </div>
                    
                    {(pool.status === 'active' || pool.status === 'withdrawal') && (
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Available Liquidity</p>
                        <p className="text-sm sm:text-lg font-semibold">{formatValue(pool.available_liquidity)}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Estimated APY</p>
                      <p className="text-sm sm:text-lg font-semibold text-[#8B5CF6]">
                        <TrendingUp className="h-4 w-4 inline mr-1" />
                        {pool.apy}%
                      </p>
                    </div>
                    
                    {pool.status === 'warm-up' && (
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Liquidity Lock</p>
                        <p className="text-sm sm:text-lg font-semibold">04/22/2025</p>
                      </div>
                    )}
                    
                    {pool.status === 'warm-up' && (
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Liquidity Unlock</p>
                        <p className="text-sm sm:text-lg font-semibold">10/22/2025</p>
                      </div>
                    )}
                    
                    {pool.status === 'withdrawal' && (
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Final LP Price</p>
                        <p className="text-sm sm:text-lg font-semibold">${getLPTokenPrice().toFixed(2)}</p>
                      </div>
                    )}
                  </div>

                  {pool.status === 'active' && (
                    <div className="mt-4 sm:mt-6">
                      <div className="flex items-center justify-center">
                        <Lock className="h-4 w-4 text-[#8B5CF6] mr-2 flex-shrink-0" />
                        <p className="text-sm sm:text-base font-medium text-center flex items-center">
                          Funds locked for: {getLockDaysRemaining()} days
                          <Popover>
                          <PopoverTrigger asChild>
                            <button className="flex-shrink-0 ml-1">
                              <HelpCircle className="h-4 w-4 text-gray-400" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="max-w-sm p-3">
                            <div className="text-sm">
                              <p className="font-medium mb-1">Unlock on</p>
                              <p>Friday, December 12th, 2025 at 12:00 PM</p>
                            </div>
                          </PopoverContent>
                        </Popover>
                        </p>
                      </div>
                    </div>
                  )}

                  {pool.status !== 'active' && pool.status !== 'withdrawal' && (
                    <div className="mt-4 sm:mt-6">
                      <div className="flex items-center justify-center">
                        <Unlock className="h-4 w-4 text-[#8B5CF6] mr-2 flex-shrink-0" />
                        <p className="text-sm sm:text-base font-medium text-center flex items-center">
                          Warm-Up for {getWarmupDays()} days
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="flex-shrink-0 ml-1">
                                <HelpCircle className="h-4 w-4 text-gray-400" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="max-w-sm p-3">
                              <div className="text-sm">
                                <p className="font-medium mb-1">Pool Lock</p>
                                <p>Friday, December 12th, 2025 at 12:00 PM</p>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {pool.status === 'withdrawal' && (
                    <div className="mt-4 sm:mt-6">
                      <div className="flex items-center justify-center">
                        <p className="text-sm sm:text-base font-medium text-center text-gray-500">
                          Pool is in withdrawal phase
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <PoolPriceGraph poolId={pool.id} />

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
                onToggleDummyData={toggleDummyData}
                showToggle={true}
                poolStatus={pool.status}
              />
            </div>

            <Card className="bg-gradient-to-r from-[#1A1E8F]/5 via-[#5A1A8F]/10 to-[#A11F75]/5 border-[#8B5CF6]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg justify-center">
                  <Info className="h-5 w-5 text-[#8B5CF6]" />
                  About This Pool
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <div className="space-y-4">
                  {poolInfo && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <h3 className="font-medium text-[#8B5CF6] flex items-center gap-1.5">
                          <Wallet className="h-4 w-4" />
                          Lender Information
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Warm-up Period:</span>
                            <span className="font-medium">{poolInfo.warmupPeriod}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Lock Duration:</span>
                            <span className="font-medium">{poolInfo.lockDuration}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <h3 className="font-medium text-[#8B5CF6] flex items-center gap-1.5">
                          <Coins className="h-4 w-4" />
                          Borrower Information
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Loan Amount:</span>
                            <span className="font-medium">{poolInfo.borrowerLoanAmount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Loan Period:</span>
                            <span className="font-medium">{poolInfo.borrowerLoanPeriod}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Interest Rate:</span>
                            <span className="font-medium">{poolInfo.borrowerInterest}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Origination Fee:</span>
                            <span className="font-medium">{poolInfo.originationFee}</span>
                          </div>
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

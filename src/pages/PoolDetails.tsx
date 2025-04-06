import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Coins, 
  TrendingUp, 
  Info, 
  Wallet, 
  Clock, 
  BarChart, 
  Lock, 
  Unlock, 
  Timer,
  Circle,
  CircleCheck,
  HelpCircle,
  Calendar
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { getPoolById, getPoolByContract, invalidatePoolsCache } from "@/lib/poolRequests";
import { LiquidityPool } from "@/types/supabase/liquidity";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SupplyModal } from "@/components/SupplyModal";
import { WithdrawModal } from "@/components/WithdrawModal";
import { UserPortfolioCard } from "@/components/UserPortfolioCard";
import { 
  formatToLocalTime, 
  formatDateRange, 
  getDaysBetween, 
  formatUnlockDate,
  safeParseDate 
} from "@/utils/dateUtils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PoolPriceGraph } from "@/components/PoolPriceGraph";
import { LoadingState } from "@/components/portfolio/LoadingState";
import { useUserPoolPosition } from "@/hooks/useUserPoolPosition";
import { usePoolModals } from "@/hooks/usePoolModals";
import { useCacheListener, EVENTS } from "@/hooks/useCacheListener";

const PoolDetails = () => {
  const { contract, id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [loading, setLoading] = useState(true);
  const [pool, setPool] = useState<LiquidityPool | null>(null);
  const { openSupplyModal, openWithdrawModal } = usePoolModals();

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [optimisticUpdates, setOptimisticUpdates] = useState<{
    totalValueLocked?: number;
    availableLiquidity?: number;
  } | null>(null);

  const userPosition = useUserPoolPosition(pool?.contract_address, refreshTrigger);

  useCacheListener(EVENTS.POOL_DATA_UPDATED, (data) => {
    if (pool && pool.contract_address && data.key && data.key.includes(pool.contract_address)) {
      console.log("[PoolDetails] Received pool data cache update:", data);
      
      // Apply optimistic updates for immediate UI feedback
      if (data.action === 'update' && data.supplyAmount && typeof data.supplyAmount === 'number') {
        const updatedTVL = (pool.total_value_locked || 0) + data.supplyAmount;
        const updatedLiquidity = (pool.available_liquidity || 0) + data.supplyAmount;
        
        console.log("[PoolDetails] Applying optimistic update:", {
          oldTVL: pool.total_value_locked,
          newTVL: updatedTVL,
          oldLiquidity: pool.available_liquidity,
          newLiquidity: updatedLiquidity
        });
        
        setOptimisticUpdates({
          totalValueLocked: updatedTVL,
          availableLiquidity: updatedLiquidity,
        });
        
        // Apply update to current pool data for immediate UI reflection
        setPool(prevPool => {
          if (!prevPool) return prevPool;
          return {
            ...prevPool,
            total_value_locked: updatedTVL,
            available_liquidity: updatedLiquidity,
          };
        });
      }
      
      // Trigger a refresh to get latest data
      setRefreshTrigger(prev => prev + 1);
    }
  });

  useCacheListener(EVENTS.USER_POSITION_UPDATED, (data) => {
    if (pool && pool.contract_address) {
      const walletAddress = localStorage.getItem("ls_wallet_address");
      const expectedCacheKey = `user_position_${walletAddress}_${pool.contract_address}`;
      
      if (data.key === expectedCacheKey) {
        console.log("[PoolDetails] Received user position cache update:", data);
        
        // Trigger a refresh of the user position data
        setRefreshTrigger(prev => prev + 1);
      }
    }
  });

  useCacheListener(EVENTS.TRANSACTION_COMPLETED, (data) => {
    if (pool && pool.contract_address && data.poolContractAddress === pool.contract_address) {
      console.log("[PoolDetails] Transaction event detected:", data);
      
      // For immediate UI feedback
      if (data.type === 'supply' && data.amount) {
        const updatedTVL = (pool.total_value_locked || 0) + data.amount;
        const updatedLiquidity = (pool.available_liquidity || 0) + data.amount;
        
        console.log("[PoolDetails] Applying transaction-based update:", {
          type: data.type,
          amount: data.amount,
          oldTVL: pool.total_value_locked,
          newTVL: updatedTVL
        });
        
        setPool(prevPool => {
          if (!prevPool) return prevPool;
          return {
            ...prevPool,
            total_value_locked: updatedTVL,
            available_liquidity: updatedLiquidity,
          };
        });
        
        // Trigger a refresh after a short delay to get confirmed data
        setTimeout(() => {
          setRefreshTrigger(prev => prev + 1);
        }, 500);
      }
    }
  });

  const fetchPoolData = useCallback(async () => {
    if (!contract && !id) {
      navigate("/lending");
      return;
    }
    
    try {
      setLoading(true);
      let poolData: LiquidityPool | null = null;
      
      if (contract) {
        poolData = await getPoolByContract(contract);
      } else if (id) {
        const poolId = parseInt(id);
        poolData = await getPoolById(poolId);
        
        if (poolData && poolData.contract_address) {
          navigate(`/pool/${poolData.contract_address}`, { replace: true });
        }
      }
      
      if (!poolData) {
        toast({
          title: "Pool not found",
          description: "The requested pool does not exist.",
          variant: "destructive",
        });
        navigate("/lending");
        return;
      }
      
      if (optimisticUpdates) {
        poolData = {
          ...poolData,
          total_value_locked: optimisticUpdates.totalValueLocked ?? poolData.total_value_locked,
          available_liquidity: optimisticUpdates.availableLiquidity ?? poolData.available_liquidity,
        };
      }
      
      setPool(poolData);
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
  }, [contract, id, navigate, optimisticUpdates]);

  useEffect(() => {
    fetchPoolData();
  }, [fetchPoolData, refreshTrigger]);
  
  const handleSuccessfulSupply = useCallback((amount: number) => {
    if (pool) {
      const updatedTotalValueLocked = pool.total_value_locked + amount;
      const updatedAvailableLiquidity = pool.available_liquidity + amount;
      
      setOptimisticUpdates({
        totalValueLocked: updatedTotalValueLocked,
        availableLiquidity: updatedAvailableLiquidity,
      });
      
      setPool({
        ...pool,
        total_value_locked: updatedTotalValueLocked,
        available_liquidity: updatedAvailableLiquidity,
      });
      
      setRefreshTrigger(prev => prev + 1);
      
      setTimeout(() => {
        setOptimisticUpdates(null);
        fetchPoolData();
      }, 3000);
    }
  }, [pool, fetchPoolData]);

  const getDateFromTimestamp = (timestamp?: string): Date => {
    if (!timestamp) return new Date();
    return safeParseDate(timestamp);
  };

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

  const getWarmupPeriod = (): [Date, Date] => {
    if (!pool || !pool.metadata) {
      const currentYear = new Date().getFullYear();
      return [
        new Date(currentYear, 2, 1),
        new Date(currentYear, 2, 14)
      ];
    }
    
    try {
      const warmupStartDate = pool.metadata.warmupStartTimestampMs ? 
        new Date(parseInt(pool.metadata.warmupStartTimestampMs)) : 
        getDateFromTimestamp(pool.metadata.warmupStartTimestamp);
      
      const activationDate = pool.metadata.activationTimestampMs ? 
        new Date(parseInt(pool.metadata.activationTimestampMs)) : 
        getDateFromTimestamp(pool.metadata.activationTimestamp);
      
      return [warmupStartDate, activationDate];
    } catch (error) {
      console.error("Error parsing warmup period dates:", error);
      const currentYear = new Date().getFullYear();
      return [
        new Date(currentYear, 2, 1),
        new Date(currentYear, 2, 14)
      ];
    }
  };

  const getWarmupDays = (): number => {
    const [startDate, endDate] = getWarmupPeriod();
    return getDaysBetween(startDate, endDate);
  };

  const getPoolMaturityDate = (): Date => {
    if (!pool || !pool.metadata) {
      return new Date(2025, 11, 12, 12, 0, 0);
    }
    
    try {
      if (pool.metadata.deactivationTimestampMs) {
        return new Date(parseInt(pool.metadata.deactivationTimestampMs));
      } else if (pool.metadata.deactivationTimestamp) {
        return getDateFromTimestamp(pool.metadata.deactivationTimestamp);
      } else {
        return new Date(2025, 11, 12, 12, 0, 0);
      }
    } catch (error) {
      console.error("Error parsing deactivation date:", error);
      return new Date(2025, 11, 12, 12, 0, 0);
    }
  };

  const getPoolLockDate = (): Date => {
    if (!pool || !pool.metadata) {
      const currentYear = new Date().getFullYear();
      return new Date(currentYear, 2, 15);
    }
    
    try {
      if (pool.metadata.activationTimestampMs) {
        return new Date(parseInt(pool.metadata.activationTimestampMs));
      } else if (pool.metadata.activationTimestamp) {
        return getDateFromTimestamp(pool.metadata.activationTimestamp);
      } else {
        const currentYear = new Date().getFullYear();
        return new Date(currentYear, 2, 15);
      }
    } catch (error) {
      console.error("Error parsing activation date:", error);
      const currentYear = new Date().getFullYear();
      return new Date(currentYear, 2, 15);
    }
  };

  const getFormattedDateInfo = () => {
    if (!pool) return "";
    
    switch (pool.status) {
      case 'active': {
        const maturityDate = getPoolMaturityDate();
        return `Funds locked until: \n${formatToLocalTime(maturityDate)}`;
      }
      case 'warm-up': {
        const [startDate, endDate] = getWarmupPeriod();
        const lockDate = getPoolLockDate();
        const maturityDateForWarmup = getPoolMaturityDate();
        return `Warm-up: ${formatDateRange(startDate, endDate)}\nLocks: ${formatToLocalTime(lockDate, 'd MMM yyyy')}\nUnlocks: ${formatUnlockDate(maturityDateForWarmup)}`;
      }
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
    if (pool) {
      openSupplyModal({
        poolId: pool.id,
        poolContractAddress: pool.contract_address,
        lpSymbol: pool.metadata?.symbol || "LP",
        onSuccessfulSupply: handleSuccessfulSupply
      });
    }
  };

  const handleWithdraw = () => {
    if (pool) {
      openWithdrawModal({
        poolId: pool.id,
        lpBalance: userPosition.balance,
        lpValue: userPosition.currentValue,
        poolContractAddress: pool.contract_address
      });
    }
  };

  const getPoolSymbol = () => {
    if (!pool) return "LP";
    return pool.metadata?.symbol || "MAG";
  };

  const getPoolInfo = () => {
    if (!pool) return null;
    
    const defaultBorrowerInfo = {
      warmupPeriod: "14 days",
      loanPeriodDays: 30,
      borrowerLoanAmount: "$10",
      borrowerLoanPeriod: "30 days",
      borrowerInterest: "8.5%",
      originationFee: "10%"
    };
    
    if (!pool.borrower_info) {
      return {
        warmupPeriod: defaultBorrowerInfo.warmupPeriod,
        lockDuration: pool.metadata?.lockDurationDays ? `${pool.metadata.lockDurationDays} days` : "180 days",
        borrowerLoanAmount: defaultBorrowerInfo.borrowerLoanAmount,
        borrowerLoanPeriod: defaultBorrowerInfo.borrowerLoanPeriod,
        borrowerInterest: defaultBorrowerInfo.borrowerInterest,
        originationFee: defaultBorrowerInfo.originationFee,
        cooldownStartDate: pool.metadata?.cooldownStartFormattedDate || 'N/A'
      };
    }
    
    return {
      warmupPeriod: pool.borrower_info.warmupPeriod || defaultBorrowerInfo.warmupPeriod,
      lockDuration: pool.metadata?.lockDurationDays ? `${pool.metadata.lockDurationDays} days` : "180 days",
      borrowerLoanAmount: pool.borrower_info.loanAmount || defaultBorrowerInfo.borrowerLoanAmount,
      borrowerLoanPeriod: pool.borrower_info.loanPeriodDays ? `${pool.borrower_info.loanPeriodDays} days` : defaultBorrowerInfo.borrowerLoanPeriod,
      borrowerInterest: pool.borrower_info.interestRate || defaultBorrowerInfo.borrowerInterest,
      originationFee: pool.borrower_info.originationFee || defaultBorrowerInfo.originationFee,
      cooldownStartDate: pool.metadata?.cooldownStartFormattedDate || 'N/A'
    };
  };

  const poolInfo = getPoolInfo();
  const poolSymbol = getPoolSymbol();

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Pool Details" />
        <main className="container max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
          <LoadingState message="Loading Liquidity Pool Details" />
        </main>
      </div>
    );
  }

  const shouldShowSupplyButton = pool?.status !== 'withdrawal';
  const shouldShowWithdrawButton = pool?.status !== 'active';
  
  const showPriceChart = false;

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header title="Pool Details" />

      <main className="container max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        {pool && (
          <>
            <Card className="mb-6 border border-[#8B5CF6]/20 overflow-hidden">
              <div className="bg-gradient-to-r from-[#8B5CF6]/10 to-[#6E59A5]/5 py-5 px-6 flex justify-center">
                <div className="flex items-center gap-3">
                  <div className="bg-[#8B5CF6]/20 rounded-full p-2 flex items-center justify-center">
                    <Coins className="h-5 w-5 sm:h-6 sm:w-6 text-[#8B5CF6]" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold">
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
                      <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-500 flex items-center justify-center">
                          Lock Start Date
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="ml-1">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="p-3 w-auto">
                              <p className="font-medium mb-1">Lock begins on</p>
                              <p>{formatUnlockDate(getPoolLockDate())}</p>
                            </PopoverContent>
                          </Popover>
                        </p>
                        <p className="text-sm sm:text-lg font-semibold">
                          {formatToLocalTime(pool.metadata?.activationTimestampMs || '', 'MMM d, yyyy')}
                        </p>
                      </div>
                    )}
                    
                    {pool.status === 'warm-up' && (
                      <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-500 flex items-center justify-center">
                          Lock End Date
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="ml-1">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="p-3 w-auto">
                              <p className="font-medium mb-1">Lock ends on</p>
                              <p>{formatUnlockDate(getPoolMaturityDate())}</p>
                            </PopoverContent>
                          </Popover>
                        </p>
                        <p className="text-sm sm:text-lg font-semibold">
                          {formatToLocalTime(pool.metadata?.deactivationTimestampMs || '', 'MMM d, yyyy')}
                        </p>
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
                              <p>{formatUnlockDate(getPoolMaturityDate())}</p>
                            </div>
                          </PopoverContent>
                        </Popover>
                        </p>
                      </div>
                    </div>
                  )}

                  {pool.status === 'warm-up' && (
                    <div className="mt-4 sm:mt-6">
                      <div className="flex items-center justify-center">
                        <Unlock className="h-4 w-4 text-[#8B5CF6] mr-2 flex-shrink-0" />
                        <p className="text-sm sm:text-base font-medium text-center">
                          Warm-Up for {getWarmupDays()} days
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

              {showPriceChart && (
                <PoolPriceGraph 
                  poolId={pool.id} 
                  symbol={poolSymbol} 
                  contractAddress={pool.contract_address}
                />
              )}

              <UserPortfolioCard
                balance={userPosition.balance}
                currentValue={userPosition.currentValue}
                isLoading={userPosition.loading}
                onSupply={handleSupply}
                onWithdraw={handleWithdraw}
                hideButtons={false}
                showSupplyButton={shouldShowSupplyButton}
                showWithdrawButton={shouldShowWithdrawButton}
                poolStatus={pool.status}
                symbol={poolSymbol}
                key={refreshTrigger}
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
                          <div className="flex justify-between">
                            <span className="text-gray-500">Cooldown Period:</span>
                            <span className="font-medium">{poolInfo.cooldownStartDate}</span>
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
    </div>
  );
};

export default PoolDetails;


import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { PoolCard } from "@/components/PoolCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePoolData } from "@/contexts/PoolDataContext";
import { useNavigate } from "react-router-dom";
import { LoadingState } from "@/components/portfolio/LoadingState";
import { Skeleton } from "@/components/ui/skeleton";

// Cache timeout threshold
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

const Lending = () => {
  const { pools, loading, error: fetchError, refreshPools, lastFetched } = usePoolData();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(true);

  // Check for wallet address in localStorage and redirect if not found
  useEffect(() => {
    const ls_wallet = localStorage.getItem("ls_wallet_address");
    if (!ls_wallet) {
      // Redirect to welcome page if no wallet address is found
      navigate("/welcome");
      return;
    }
    setWalletAddress(ls_wallet);
    setLocalLoading(false);
  }, [navigate]);

  // Smarter pool data loading logic
  useEffect(() => {
    console.log("Lending page checking if pool data needs refresh");
    
    // Use the shared lastFetched timestamp from context
    // This ensures consistent checking across page navigations
    if (!lastFetched || Date.now() - lastFetched > REFRESH_THRESHOLD_MS) {
      console.log(`Refreshing pool data from Lending page (last fetched: ${lastFetched ? new Date(lastFetched).toLocaleTimeString() : 'never'})`);
      refreshPools(false); // Don't force invalidate cache here, let the cache logic decide
    } else {
      // Log that we're using cached data and how old it is
      const ageSeconds = lastFetched ? Math.round((Date.now() - lastFetched) / 1000) : 0;
      console.log(`Using cached pool data (${ageSeconds}s old)`);
    }
  }, [refreshPools, lastFetched]);

  useEffect(() => {
    if (fetchError) {
      toast({
        title: "Error fetching pools",
        description: fetchError,
        variant: "destructive",
      });
    }
  }, [fetchError]);

  // Don't render content until we've checked for wallet address
  if (localLoading) {
    return <LoadingState message="Checking authentication..." />;
  }

  // If not authenticated, don't render anything (the redirect will happen)
  if (!walletAddress) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Lending Dashboard" />

      <main className="container max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        <div className="mb-5 sm:mb-6">
          <div className="flex justify-center mb-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] text-transparent bg-clip-text text-center">
              Magnify Cash Lending
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-700 mb-4 max-w-3xl mx-auto text-center">
            Supply liquidity to earn yield. Your returns grow as borrowers repay loans, with rates influenced by borrowing demand and repayment performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6">
          {loading ? (
            <>
              <PoolCardSkeleton />
              <PoolCardSkeleton />
            </>
          ) : fetchError ? (
            <div className="py-8 text-center text-gray-500 col-span-full">{fetchError}</div>
          ) : pools.length > 0 ? (
            pools.map(pool => (
              <PoolCard
                key={pool.id}
                id={pool.id}
                title={pool.name}
                apy={pool.apy}
                totalSupply={pool.total_value_locked}
                availableLiquidity={pool.available_liquidity}
                status={pool.status}
                symbol={pool.metadata?.symbol}
                lockDuration={pool.metadata?.lockDurationDays}
                startDate={pool.status === 'warm-up' ? 
                  pool.metadata?.activationTimestampMs : 
                  pool.metadata?.warmupStartTimestampMs}
                endDate={pool.metadata?.deactivationTimestampMs}
                contract={pool.contract_address}
                isLoading={loading}
              />
            ))
          ) : (
            <div className="py-8 text-center text-gray-500 col-span-full">No lending pools available at this time.</div>
          )}
        </div>
      </main>
    </div>
  );
};

// Loading placeholder for Pool Cards
const PoolCardSkeleton = () => {
  const gradientClass = "from-[#8B5CF6]/5 via-[#7E69AB]/10 to-[#6E59A5]/5 border-[#8B5CF6]/20";
  
  return (
    <Card className={`overflow-hidden border bg-gradient-to-r ${gradientClass}`}>
      <CardHeader className="flex flex-col items-center gap-2 pb-2 pt-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-5 w-24" />
      </CardHeader>
      
      <CardContent className="px-3 sm:px-4 pt-2 pb-4 space-y-3 sm:space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="space-y-1 bg-white/30 rounded-lg p-2 sm:p-3">
            <div className="text-xs text-gray-500">APY</div>
            <Skeleton className="h-6 w-20" />
          </div>
          
          <div className="space-y-1 bg-white/30 rounded-lg p-2 sm:p-3">
            <div className="text-xs text-gray-500">Lock Duration</div>
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
        
        <div className="bg-white/30 rounded-lg p-2 sm:p-3">
          <div className="text-xs text-gray-500 mb-1">Date</div>
          <Skeleton className="h-5 w-32" />
        </div>
        
        <Skeleton className="h-10" />
      </CardContent>
    </Card>
  );
};

export default Lending;

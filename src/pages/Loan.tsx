
import { useState, useCallback, useEffect } from "react";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useMagnifyWorld } from "@/hooks/useMagnifyWorld";
import useRequestLoan from "@/hooks/useRequestLoan";
import { Button } from "@/components/ui/button";
import { useUSDCBalance } from "@/providers/USDCBalanceProvider";
import { usePoolData } from "@/contexts/PoolDataContext";
import { LoanPoolCard } from "@/components/LoanPoolCard";
import { LiquidityPool } from "@/types/supabase/liquidity";
import { fetchBorrowerInfo, hasBorrowerInfoCache } from "@/utils/borrowerInfoUtils";

const Loan = () => {
  // States
  const [isClicked, setIsClicked] = useState(false);
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [filteredPools, setFilteredPools] = useState<LiquidityPool[]>([]);
  const [poolsWithBorrowerInfo, setPoolsWithBorrowerInfo] = useState<Record<string, any>>({});
  const [isLoadingBorrowerInfo, setIsLoadingBorrowerInfo] = useState(true);
  const [borrowerInfoLoaded, setBorrowerInfoLoaded] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Hooks
  const { toast } = useToast();
  const navigate = useNavigate();
  const ls_wallet = localStorage.getItem("ls_wallet_address") || "";
  const { data, isLoading: isLoadingNFT, refetch } = useMagnifyWorld(ls_wallet as `0x${string}`);
  const { requestNewLoan, isConfirming, isConfirmed, transactionId } = useRequestLoan();
  const { usdcBalance, refreshBalance } = useUSDCBalance();
  const { pools, loading: isLoadingPools } = usePoolData();
  
  const loanData = data?.loan ? data.loan[1] : null;
  const hasActiveLoan = loanData?.isActive ?? false;

  // Filter active pools and pools with enough liquidity
  useEffect(() => {
    if (pools && pools.length > 0) {
      // Reset borrower info loading state when pools change
      if (!borrowerInfoLoaded) {
        setIsLoadingBorrowerInfo(true);
      }
      
      const active = pools.filter(pool => 
        pool.status === 'active' && 
        pool.available_liquidity > 0
      );
      
      if (active.length === 0) {
        console.log("[Loan] No active pools with liquidity found, using all active pools");
        setFilteredPools(pools.filter(pool => pool.status === 'active'));
      } else {
        setFilteredPools(active);
      }
      
      console.log(`[Loan] Filtered ${active.length} active pools with liquidity out of ${pools.length} total pools`);
    } else {
      setFetchError("No lending pools are currently available. Please try again later.");
    }
  }, [pools, borrowerInfoLoaded]);

  // Load borrower info for all pools when filtered pools are ready
  useEffect(() => {
    if (filteredPools.length > 0) {
      const loadBorrowerInfo = async () => {
        setIsLoadingBorrowerInfo(true);
        setFetchError(null);
        
        // Process each pool in parallel
        const results: Record<string, any> = {};
        const promises: Promise<void>[] = [];
        let hasError = false;
        
        // First check which contracts need fetching (if not cached)
        const contractsToFetch = filteredPools
          .map(pool => pool.contract_address)
          .filter((address): address is string => 
            !!address && !hasBorrowerInfoCache(address)
          );
        
        console.log(`[Loan] Need to fetch borrower info for ${contractsToFetch.length} out of ${filteredPools.length} pools`);
        
        for (const pool of filteredPools) {
          if (!pool.contract_address) continue;
          
          const promise = fetchBorrowerInfo(pool.contract_address)
            .then(borrowerInfo => {
              results[pool.contract_address!] = {
                loanAmount: borrowerInfo.loanAmount,
                interestRate: borrowerInfo.interestRate,
                loanPeriod: borrowerInfo.loanPeriodDays * 24 * 60 * 60
              };
            })
            .catch(error => {
              console.error(`[Loan] Failed to fetch borrower info for ${pool.name}:`, error);
              hasError = true;
            });
            
          promises.push(promise);
        }
        
        // Wait for all promises to resolve
        await Promise.all(promises);
        
        if (Object.keys(results).length === 0 && hasError) {
          setFetchError("Unable to fetch loan information from lending pools. Please try again later.");
        }
        
        setPoolsWithBorrowerInfo(results);
        setIsLoadingBorrowerInfo(false);
        setBorrowerInfoLoaded(true);
      };
      
      loadBorrowerInfo();
    }
  }, [filteredPools]);

  // Call refetch after loan is confirmed
  useEffect(() => {
    if (isConfirmed) {
      const timeout = setTimeout(async () => {
        await refetch();
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [isConfirmed, refetch]);
  
  // Handle loan application
  const handleApplyLoan = useCallback(
    async (contractAddress: string, requestedTierId: number) => {
      if (isClicked) return;
      setIsClicked(true);
      setSelectedPool(contractAddress);
  
      try {
        await refreshBalance();
        const latestBalance = usdcBalance ?? 0;
  
        if (latestBalance < 10) {
          toast({
            title: "Loan Unavailable",
            description: "Our lending pool is temporarily depleted. Please try again later.",
            variant: "destructive",
          });
          return;
        }
  
        if (data?.nftInfo?.tokenId) {
          await requestNewLoan(BigInt(requestedTierId), contractAddress);
  
          sessionStorage.removeItem("usdcBalance");
          sessionStorage.removeItem("walletTokens");
          sessionStorage.removeItem("walletCacheTimestamp");
        } else {
          toast({
            title: "Error",
            description: "Unable to apply for loan. Ensure you have a verified NFT.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Loan application error:", error);
        toast({
          title: "Error",
          description: error?.message?.includes("user rejected transaction")
            ? "Transaction rejected by user."
            : error?.message || "Unable to apply for loan.",
          variant: "destructive",
        });
      } finally {
        setIsClicked(false);
      }
    },
    [data, requestNewLoan, toast, usdcBalance, refreshBalance, isClicked]
  );
  
  // Handle navigation after claiming loan
  const handleNavigateAfterTransaction = async () => {
    await refetch();
    setTimeout(() => navigate("/repay-loan"), 1000);
  }; 

  // Determine if we're in a loading state - make sure we show loading until ALL data is ready
  const isLoading = isLoadingNFT || isLoadingPools || (isLoadingBorrowerInfo && filteredPools.length > 0);

  return (
    <div className="min-h-screen">
      <Header title="Get a Loan" />
      {isLoading ? (
        <div className="flex justify-center items-center h-[calc(100vh-80px)] gap-2">
          <div className="dot-spinner">
            <div className="dot bg-[#1A1E8E]"></div>
            <div className="dot bg-[#4A3A9A]"></div>
            <div className="dot bg-[#7A2F8A]"></div>
            <div className="dot bg-[#A11F75]"></div>
          </div>
        </div>
      ) : hasActiveLoan ? (
        <div className="p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">You already have an active loan</h2>
            <p className="mt-4 text-gray-600">You currently have an active loan. Please repay it first.</p>
            <Button onClick={() => navigate("/repay-loan")} className="mt-4 w-full sm:w-auto">
              Repay Loan
            </Button>
          </div>
        </div>
      ) : !data || data?.nftInfo.tokenId === null ? (
        <div className="p-6 space-y-6">
          <div className="flex-column justify-center items-center h-[calc(100vh-80px)]">
            <h2 className="text-2xl font-semibold mb-4">You Don't Have the Required NFT</h2>
            <p className="mb-4">
              To be eligible for a loan, you need to own a specific NFT. Please upgrade your account.
            </p>
            <Button onClick={() => navigate("/profile")} className="glass-button w-full">
              Upgrade Now
            </Button>
          </div>
        </div> 
      ) : data?.nftInfo?.tier === 0 ? (
        <div className="p-6 space-y-6">
          <div className="flex-column justify-center items-center h-[calc(100vh-80px)]">
            <h2 className="text-2xl font-semibold mb-4">You Don't Have the Required NFT</h2>
            <p className="mb-4">
              We no longer support loans for Device Verified Users. Get Orb verified to access instant loans!
            </p>
            <Button onClick={() => navigate("/profile")} className="glass-button w-full">
              Upgrade Now
            </Button>
          </div>
        </div> 
      ) : (
        <div className="p-6 space-y-6">
          <div className="mb-4 text-center">
            <h2 className="text-xl font-semibold">Available Loan Pools</h2>
            <p className="text-gray-600 text-sm mt-1">
              Select a lending pool below to apply for your loan
            </p>
          </div>

          {fetchError ? (
            <div className="glass-card p-6 text-center">
              <Shield className="w-8 h-8 mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Connection Issue</h3>
              <p className="text-gray-600">
                {fetchError}
              </p>
              <Button 
                onClick={() => {
                  setBorrowerInfoLoaded(false); // Reset so we can fetch again
                  setFetchError(null);
                }} 
                className="mt-4"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          ) : filteredPools.length > 0 ? (
            filteredPools.map((pool) => {
              const contractAddress = pool.contract_address || "";
              const borrowerInfo = poolsWithBorrowerInfo[contractAddress];
              const isLoadingData = !borrowerInfo;
              
              // Use real data from borrowerInfo or from pool.borrower_info (if it's been updated correctly)
              const loanAmount = borrowerInfo ? 
                borrowerInfo.loanAmount : 
                typeof pool.borrower_info.loanAmount === 'string' ? 
                  parseFloat(pool.borrower_info.loanAmount.replace(/[^0-9.]/g, '')) : 0;
                  
              const interestRate = borrowerInfo ? 
                borrowerInfo.interestRate : 
                typeof pool.borrower_info.interestRate === 'string' ? 
                  parseFloat(pool.borrower_info.interestRate.replace(/[^0-9.]/g, '')) : 0;
                  
              const loanPeriod = borrowerInfo ? 
                borrowerInfo.loanPeriod : 
                (pool.borrower_info.loanPeriodDays || 0) * 24 * 60 * 60;

              return (
                <LoanPoolCard
                  key={pool.contract_address || pool.id}
                  name={pool.name || "Lending Pool"}
                  loanAmount={loanAmount}
                  interestRate={interestRate}
                  loanPeriod={loanPeriod}
                  contractAddress={contractAddress}
                  liquidity={pool.available_liquidity || 0}
                  isLoading={isConfirming && selectedPool === contractAddress}
                  onSelect={(contractAddress, tierId) => handleApplyLoan(contractAddress, 3)} // Using tier 3 for Orb verified
                  disabled={isConfirming || isConfirmed}
                  tierId={3}
                  dataLoading={isLoadingData}
                />
              );
            })
          ) : (
            <div className="glass-card p-6 text-center">
              <Shield className="w-8 h-8 mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No Active Loan Pools Available</h3>
              <p className="text-gray-600">
                There are currently no active lending pools available for loans. Please check back later.
              </p>
            </div>
          )}

          {transactionId && (
            <div className="glass-card p-4 mt-4">
              <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                Transaction ID:{" "}
                <span title={transactionId}>
                  {transactionId.slice(0, 10)}...{transactionId.slice(-10)}
                </span>
              </p>
              {isConfirming && (
                <div className="fixed top-0 left-0 w-full h-full bg-black/70 flex flex-col items-center justify-center z-50">
                  <div className="flex justify-center">
                    <div className="orbit-spinner">
                      <div className="orbit"></div>
                      <div className="orbit"></div>
                      <div className="center"></div>
                    </div>
                  </div>
                  <p className="text-white text-center max-w-md px-4 text-lg font-medium">
                    Confirming transaction, please do not leave this page until confirmation is complete.
                  </p>
                </div>
              )}
              {isConfirmed && (
                <>
                  <p>Transaction confirmed!</p>
                  <Button type="button" onClick={handleNavigateAfterTransaction} className="mt-2 w-full">
                    View Loan Details
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Loan;

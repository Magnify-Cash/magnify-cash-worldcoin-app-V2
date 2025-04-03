
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

const Loan = () => {
  // States
  const [isClicked, setIsClicked] = useState(false);
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [filteredPools, setFilteredPools] = useState<LiquidityPool[]>([]);

  // Hooks
  const { toast } = useToast();
  const navigate = useNavigate();
  const ls_wallet = localStorage.getItem("ls_wallet_address") || "";
  const { data, isLoading: isLoadingNFT, refetch } = useMagnifyWorld(ls_wallet as `0x${string}`);
  const { requestNewLoan, isConfirming, isConfirmed, transactionId } = useRequestLoan();
  const { usdcBalance, refreshBalance } = useUSDCBalance();
  const { pools, loading: isLoadingPools, refreshPools } = usePoolData();
  
  const loanData = data?.loan ? data.loan[1] : null;
  const hasActiveLoan = loanData?.isActive ?? false;

  // Filter active pools and pools with enough liquidity
  useEffect(() => {
    if (pools && pools.length > 0) {
      const active = pools.filter(pool => 
        pool.status === 'active' && 
        pool.available_liquidity > 0
      );
      setFilteredPools(active);
    }
  }, [pools]);

  // Refresh pools on component mount
  useEffect(() => {
    refreshPools();
  }, [refreshPools]);

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

  const isLoading = isLoadingNFT || isLoadingPools;

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

          {filteredPools.length > 0 ? (
            filteredPools.map((pool) => {
              // Find tier 3 loan data or use fallback
              const loanAmount = pool.borrower_info?.loanAmount 
                ? parseInt(pool.borrower_info.loanAmount.replace('$', '')) 
                : 1000;
              
              const interestRate = pool.borrower_info?.interestRate 
                ? pool.borrower_info.interestRate.replace('%', '') 
                : 8.5;
              
              // Convert loanPeriod to days or use fallback
              const loanPeriod = pool.borrower_info?.loanPeriodDays || 30;

              return (
                <LoanPoolCard
                  key={pool.contract_address}
                  name={pool.name}
                  loanAmount={loanAmount}
                  interestRate={interestRate}
                  loanPeriod={loanPeriod * 24 * 60 * 60} // Convert days to seconds
                  contractAddress={pool.contract_address || ""}
                  liquidity={pool.available_liquidity}
                  isLoading={isConfirming && selectedPool === pool.contract_address}
                  onSelect={(contractAddress, tierId) => handleApplyLoan(contractAddress, 3)} // Using tier 3 for Orb verified
                  disabled={isConfirming || isConfirmed}
                  tierId={3}
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

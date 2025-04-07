import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, DollarSign, Clock } from "lucide-react";
import { Loan, useMagnifyWorld } from "@/hooks/useMagnifyWorld";
import { calculateRemainingTime } from "@/utils/timeinfo";
import useRepayLoan from "@/hooks/useRepayLoan";
import { useToast } from "@/hooks/use-toast";
import { formatUnits } from "viem";
import { getUSDCBalance } from "@/lib/backendRequests";
import { createPublicClient, http } from "viem";

// Define the worldchain manually since it can't be imported
const worldchain = {
  id: 59144,
  name: 'Worldchain',
  network: 'worldchain',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://worldchain-mainnet.g.alchemy.com/public'] },
    default: { http: ['https://worldchain-mainnet.g.alchemy.com/public'] },
  },
};

const RepayLoan = () => {
  // States
  const [isClicked, setIsClicked] = useState(false);

  // hooks
  const { toast } = useToast();
  const navigate = useNavigate();
  const ls_wallet = localStorage.getItem("ls_wallet_address");
  const { data, isLoading, isError, refetch } = useMagnifyWorld(ls_wallet as `0x${string}`);
  const loan = data?.loan;
  const loanData: Loan | undefined = loan && loan[1];
  const loanVersion = loan ? loan[0] : "";

  console.log("[RepayLoan] Loan data:", loanData);
  console.log("[RepayLoan] Loan version:", loanVersion);
  console.log("[RepayLoan] Pool address:", loanData?.poolAddress || "Not available");
  console.log("[RepayLoan] Full data object:", data);

  // Update USDC balance on page load
  useEffect(() => {
    const updateUSDCBalance = async () => {
      if (ls_wallet) {
        try {
          const balance = await getUSDCBalance(ls_wallet);
          sessionStorage.setItem("usdcBalance", balance.toString());
        } catch (error) {
          console.error("Failed to fetch USDC balance:", error);
        }
      }
    };

    updateUSDCBalance();
  }, [ls_wallet]);

  // loan repayment
  const loanAmountDue = useMemo(() => {
    if (loanData) {
      // Check if we have valid number values for amount and interest rate
      if (loanData.amount > 0n && loanData.interestRate > 0n) {
        return loanData.amount + (loanData.amount * loanData.interestRate) / 10000n;
      }
      // If interestRate is 0 or missing but we have an amount, use just the amount
      else if (loanData.amount > 0n) {
        return loanData.amount;
      }
      
      // Fallback for V3 loans with empty data but we know they exist
      if (loanVersion === "V3" && data?.hasActiveLoan && data.nftInfo?.ongoingLoan) {
        // Use a default value based on tier if available
        if (data.nftInfo.tier && data.allTiers) {
          const tierInfo = data.allTiers.find(t => t.tierId === data.nftInfo?.tier);
          if (tierInfo) {
            const amount = BigInt(Math.round(tierInfo.loanAmount * 1e6)); // Convert to micros
            const interest = BigInt(Math.round((Number(amount) * tierInfo.interestRate) / 100)); // Fix type conversion
            return amount + interest;
          }
        }
        // Last resort fallback - permit interface to appear with warning
        return BigInt(1000000); // $1 placeholder to allow repayment flow to start
      }
    }
    return 0n; // Default value if loanData is not available
  }, [loanData, loanVersion, data]);

  const { repayLoanWithPermit2, error, transactionId, isConfirming, isConfirmed } = useRepayLoan();
  
  const handleApplyLoan = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (isClicked) return;
  
      setIsClicked(true);

      if(!sessionStorage.getItem("usdcBalance")) {
        const balance = await getUSDCBalance(ls_wallet as string);
        sessionStorage.setItem("usdcBalance", balance.toString());
      }

      const currentBalance = Number(sessionStorage.getItem("usdcBalance"));
      const amountDueFloat = Number(formatUnits(loanAmountDue, 6));

      if (currentBalance < amountDueFloat) {
        toast({
          title: "Insufficient USDC",
          description: `You need $${amountDueFloat.toFixed(2)} to repay the loan, but only have $${currentBalance.toFixed(2)}.`,
          variant: "destructive",
        });
        setIsClicked(false);
        return;
      }
  
      try {
        // If we have a loan and a version, proceed with repayment
        if (loanVersion) {
          // Get the pool address for V3 loans
          const poolAddress = loanVersion === "V3" ? loanData?.poolAddress : undefined;
          
          console.log(`[RepayLoan] Repaying ${loanVersion} loan with amount: ${loanAmountDue}, pool address: ${poolAddress || 'N/A'}`);
          
          await repayLoanWithPermit2(loanAmountDue, loanVersion, poolAddress);
  
          // Clear session storage
          sessionStorage.removeItem("usdcBalance");
          sessionStorage.removeItem("walletTokens");
          sessionStorage.removeItem("walletCacheTimestamp");
        } else {
          toast({
            title: "Error",
            description: "Unable to pay back loan. No active loan found.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Loan repayment error:", error);
        toast({
          title: "Error",
          description: error?.message?.includes("user rejected transaction")
            ? "Transaction rejected by user."
            : error?.message || "Unable to pay back loan.",
          variant: "destructive",
        });
      } finally {
        setIsClicked(false);
      }
    },
    [loanVersion, repayLoanWithPermit2, loanAmountDue, toast, ls_wallet, loanData?.poolAddress]
  );
  
  // Call refetch after loan repayment is confirmed
  useEffect(() => {
    if (isConfirmed) {
      const timeout = setTimeout(async () => {
        await refetch();
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [isConfirmed, refetch]);

  // Loading & error states
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Loan Status" />
        <div className="flex justify-center items-center h-[calc(100vh-80px)] gap-2">
            <div className="dot-spinner">
              <div className="dot bg-[#1A1E8E]"></div>
              <div className="dot bg-[#4A3A9A]"></div>
              <div className="dot bg-[#7A2F8A]"></div>
              <div className="dot bg-[#A11F75]"></div>
            </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen">
        <Header title="Loan Status" />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">Error fetching data.</div>
      </div>
    );
  }

  // Check if user has an active loan (from either the loan data or NFT data)
  const hasActiveLoan = data?.hasActiveLoan || 
                       (loanData && loanData.isActive) || 
                       (data?.nftInfo?.ongoingLoan);

  if (!hasActiveLoan) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Loan Status" />
        <div className="container max-w-2xl mx-auto p-6 space-y-6">
          <div className="glass-card p-6 space-y-4 hover:shadow-lg transition-all duration-200">
            <h3 className="text-lg font-semibold text-center">No Active Loans</h3>
            <p className="text-center text-muted-foreground">
              It looks like you don't have any active loans. Would you like to request one?
            </p>
            <Button onClick={() => navigate("/loan")} className="w-full mt-4">
              Request a Loan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No NFT but has an active loan case (V1 or V2 loan)
  if (data && (!data.nftInfo?.tokenId || data.nftInfo.tokenId === "0") && data.hasActiveLoan && loan) {
    // For user with no NFT but with active loan, show loan details card
    const [daysRemaining, hoursRemaining, minutesRemaining, dueDate] = calculateRemainingTime(
      BigInt(loanData?.startTime || 0), 
      BigInt(loanData?.loanPeriod || 0)
    );
    
    const amountDue = loanData?.amount ? 
      loanData.amount + (loanData.amount * (loanData?.interestRate || 0n)) / 10000n : 0n;

    return (
      <div className="min-h-screen bg-background">
        <Header title="Loan Status" />
        <div className="container max-w-2xl mx-auto p-6 space-y-6">
          <div className="glass-card p-6 space-y-4 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-green-300 text-black text-sm">
                Active Loan
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground text-start">Loan Amount</p>
                  <p className="text-start font-semibold">${formatUnits(loanData?.amount || 0n, 6)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground text-start">Repayment Amount</p>
                  <p className="text-start font-semibold">${formatUnits(amountDue, 6)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground text-start">Due Date</p>
                  <p className="text-start font-semibold">
                    {new Date(dueDate).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZoneName: "short", 
                      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground text-start">Time Remaining</p>
                  <p className="text-start font-semibold">
                    {`${daysRemaining}d ${hoursRemaining}hr ${minutesRemaining}m`}
                  </p>
                </div>
              </div>
            </div>
            
            <Button onClick={handleApplyLoan} className="w-full mt-4 primary-button" disabled={isClicked || isConfirming || isConfirmed}>
              {isConfirming ? "Confirming..." : isConfirmed ? "Confirmed" : "Repay Loan"}
            </Button>
            {transactionId && (
              <div className="mt-4">
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
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active loan with NFT case
  // Check if we have valid loan data, otherwise use defaults
  let startTime = loanData?.startTime || 0; 
  let loanPeriod = loanData?.loanPeriod || BigInt(30 * 24 * 60 * 60); // Default to 30 days if missing
  
  // For V3 loans that might have invalid/incomplete data
  if (loanVersion === "V3" && data?.nftInfo?.ongoingLoan && (startTime === 0 || loanPeriod === 0n)) {
    // Try to get loan period from tier data
    if (data.nftInfo.tier && data.allTiers) {
      const tierInfo = data.allTiers.find(t => t.tierId === data.nftInfo?.tier);
      if (tierInfo) {
        loanPeriod = BigInt(tierInfo.loanPeriod);
      }
    }
    
    // If we still don't have a start time, use a reasonable default
    if (startTime === 0) {
      startTime = Math.floor(Date.now() / 1000) - 86400; // Assume started yesterday
    }
  }
  
  const [daysRemaining, hoursRemaining, minutesRemaining, dueDate] = calculateRemainingTime(
    BigInt(startTime),
    loanPeriod,
  );
  
  return (
    <div className="min-h-screen bg-background">
      <Header title="Loan Status" />
      <div className="container max-w-2xl mx-auto p-6 space-y-6">
        <div className="glass-card p-6 space-y-4 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-green-300 text-black text-sm">
              Active Loan
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground text-start">Loan Amount</p>
                <p className="text-start font-semibold">
                  ${formatUnits(loanData?.amount || 0n, 6)} 
                  {loanData?.amount === 0n && <span className="text-xs text-yellow-500"> (Data Unavailable)</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground text-start">Repayment Amount</p>
                <p className="text-start font-semibold">
                  ${formatUnits(loanAmountDue, 6)}
                  {loanAmountDue === 0n && <span className="text-xs text-yellow-500"> (Data Unavailable)</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground text-start">Due Date</p>
                <p className="text-start font-semibold">
                  {new Date(dueDate).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZoneName: "short", 
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  })}
                  {startTime === 0 && <span className="text-xs text-yellow-500"> (Estimated)</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground text-start">Time Remaining</p>
                <p className="text-start font-semibold">
                  {`${daysRemaining}d ${hoursRemaining}hr ${minutesRemaining}m`}
                  {startTime === 0 && <span className="text-xs text-yellow-500"> (Estimated)</span>}
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleApplyLoan}
            className="w-full primary-button"
            disabled={isClicked || isConfirming || isConfirmed}
          >
            {isConfirming ? "Confirming..." : isConfirmed ? "Confirmed" : "Repay Loan"}
          </Button>
          {transactionId && (
            <div className="mt-4">
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
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepayLoan;

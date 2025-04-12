import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, DollarSign, Clock, AlertTriangle } from "lucide-react";
import { Loan, useMagnifyWorld } from "@/hooks/useMagnifyWorld";
import { calculateRemainingTime } from "@/utils/timeinfo";
import useRepayLoan from "@/hooks/useRepayLoan";
import useRepayDefaultedLoan from "@/hooks/useRepayDefaultedLoan";
import { useToast } from "@/hooks/use-toast";
import { formatUnits } from "viem";
import { getUSDCBalance } from "@/lib/backendRequests";
import { useDefaultedLoans } from "@/hooks/useDefaultedLoans";
import { DefaultedLoanCard } from "@/components/DefaultedLoanCard";
import { LoadingOverlay } from "@/components/LoadingOverlay";

const RepayLoan = () => {
  // States
  const [isClicked, setIsClicked] = useState(false);
  const [selectedDefaultedLoan, setSelectedDefaultedLoan] = useState<string | null>(null);

  // hooks
  const { toast } = useToast();
  const navigate = useNavigate();
  const ls_wallet = localStorage.getItem("ls_wallet_address") || "";
  const { data, isLoading, isError, refetch } = useMagnifyWorld(ls_wallet as `0x${string}`);
  const { 
    defaultedLoans, 
    hasDefaultedLoan, 
    isLoading: isLoadingDefaultedLoans,
    refetch: refetchDefaultedLoans 
  } = useDefaultedLoans(ls_wallet);
  
  const loan = data?.loan;
  const loanData: Loan | undefined = loan && loan[1];
  const loanVersion = loan ? loan[0] : "";

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

  // Active loan repayment
  const { repayLoanWithPermit2, error, transactionId, isConfirming, isConfirmed } = useRepayLoan();
  
  // Defaulted loan repayment
  const { 
    repayDefaultedLoanWithPermit2, 
    error: defaultedError, 
    transactionId: defaultedTransactionId, 
    isConfirming: isConfirmingDefaulted, 
    isConfirmed: isConfirmedDefaulted 
  } = useRepayDefaultedLoan();

  // Amount due calculation for active loan
  const loanAmountDue = useMemo(() => {
    if (loanData) {
      if (loanData.amount > 0n && loanData.interestRate > 0n) {
        return loanData.amount + (loanData.amount * loanData.interestRate) / 10000n;
      }
      else if (loanData.amount > 0n) {
        return loanData.amount;
      }
      
      if (loanVersion === "V3" && data?.hasActiveLoan && data.nftInfo?.ongoingLoan) {
        if (data.nftInfo.tier && data.allTiers) {
          const tierInfo = data.allTiers.find(t => t.tierId === data.nftInfo?.tier);
          if (tierInfo) {
            const amount = BigInt(Math.round(tierInfo.loanAmount * 1e6));
            const interest = BigInt(Math.round((Number(amount) * tierInfo.interestRate) / 100));
            return amount + interest;
          }
        }
        return BigInt(1000000);
      }
    }
    return 0n;
  }, [loanData, loanVersion, data]);
  
  // For defaulted loans, assume the same loan amount as regular loans for now
  const defaultedLoanAmount = useMemo(() => {
    if (data?.nftInfo?.tier && data.allTiers) {
      const tierInfo = data.allTiers.find(t => t.tierId === data.nftInfo?.tier);
      if (tierInfo) {
        const amount = BigInt(Math.round(tierInfo.loanAmount * 1e6));
        const interest = BigInt(Math.round((Number(amount) * tierInfo.interestRate) / 100));
        return amount + interest;
      }
    }
    return BigInt(1000000);
  }, [data]);

  const handleRepayActiveLoan = useCallback(
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
        if (loanVersion) {
          const poolAddress = loanVersion === "V3" ? loanData?.poolAddress : undefined;
          
          console.log(`[RepayLoan] Repaying ${loanVersion} loan with amount: ${loanAmountDue}, pool address: ${poolAddress || 'N/A'}`);
          
          await repayLoanWithPermit2(loanAmountDue, loanVersion, poolAddress);
  
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

  const handleRepayDefaultedLoan = useCallback(async (poolAddress: string) => {
    if (isClicked) return;
    setIsClicked(true);
    setSelectedDefaultedLoan(poolAddress);

    try {
      if(!sessionStorage.getItem("usdcBalance")) {
        const balance = await getUSDCBalance(ls_wallet as string);
        sessionStorage.setItem("usdcBalance", balance.toString());
      }

      const loanToRepay = defaultedLoans.find(loan => loan.poolAddress === poolAddress);
      
      if (!loanToRepay) {
        toast({
          title: "Error",
          description: "Could not find loan details for the selected pool.",
          variant: "destructive",
        });
        return;
      }

      const currentBalance = Number(sessionStorage.getItem("usdcBalance"));
      const amountDueFloat = loanToRepay.totalDueAmount;

      if (currentBalance < amountDueFloat) {
        toast({
          title: "Insufficient USDC",
          description: `You need $${amountDueFloat.toFixed(2)} to repay the defaulted loan, but only have $${currentBalance.toFixed(2)}.`,
          variant: "destructive",
        });
        return;
      }

      const microUsdcAmount = BigInt(Math.round(loanToRepay.totalDueAmount * 1000000));

      console.log(`[RepayLoan] Repaying defaulted loan with total amount: $${loanToRepay.totalDueAmount.toFixed(2)} (${microUsdcAmount} microUSDC)`);
      
      await repayDefaultedLoanWithPermit2(poolAddress, microUsdcAmount);

      sessionStorage.removeItem("usdcBalance");
      sessionStorage.removeItem("walletTokens");
      sessionStorage.removeItem("walletCacheTimestamp");
    } catch (error: any) {
      console.error("Defaulted loan repayment error:", error);
      toast({
        title: "Error",
        description: error?.message?.includes("user rejected transaction")
          ? "Transaction rejected by user."
          : error?.message || "Unable to pay back defaulted loan.",
        variant: "destructive",
      });
    } finally {
      setIsClicked(false);
    }
  }, [repayDefaultedLoanWithPermit2, defaultedLoans, toast, ls_wallet]);

  useEffect(() => {
    if (isConfirmed || isConfirmedDefaulted) {
      const timeout = setTimeout(async () => {
        await refetch();
        if (isConfirmedDefaulted) {
          await refetchDefaultedLoans();
        }
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [isConfirmed, isConfirmedDefaulted, refetch, refetchDefaultedLoans]);

  const allLoading = isLoading || isLoadingDefaultedLoans;
  
  if (allLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Loan Status" />
        <LoadingOverlay message="Loading loan data..." />
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

  const hasActiveLoan = data?.hasActiveLoan || 
                       (loanData && loanData.isActive) || 
                       (data?.nftInfo?.ongoingLoan);

  if (!hasActiveLoan && !hasDefaultedLoan) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Loan Status" />
        <div className="container max-w-2xl mx-auto p-6 space-y-6">
          <div className="glass-card p-6 space-y-4 hover:shadow-lg transition-all duration-200">
            <h3 className="text-lg font-semibold text-center">No Active Loans</h3>
            <p className="text-center text-muted-foreground">
              It looks like you don't have any active or defaulted loans. Would you like to request one?
            </p>
            <Button onClick={() => navigate("/loan")} className="w-full mt-4">
              Request a Loan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (hasDefaultedLoan && defaultedLoans.length > 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Loan Status" />
        <div className="container max-w-2xl mx-auto p-6 space-y-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2 text-center">Defaulted Loans</h2>
            <p className="text-gray-600 text-center">
              The following loans have defaulted and need to be repaid
            </p>
          </div>
          
          {defaultedLoans.map((loan, index) => (
            <DefaultedLoanCard
              key={`${loan.poolAddress}-${index}`}
              loan={loan}
              onRepay={() => handleRepayDefaultedLoan(loan.poolAddress)}
              isProcessing={isConfirmingDefaulted && selectedDefaultedLoan === loan.poolAddress}
            />
          ))}
          
          {isConfirmingDefaulted && (
            <LoadingOverlay message="Confirming transaction, please do not leave this page until confirmation is complete." />
          )}
          
          {defaultedTransactionId && !isConfirmingDefaulted && (
            <div className="glass-card p-4 mt-4">
              <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                Transaction ID:{" "}
                <span title={defaultedTransactionId}>
                  {defaultedTransactionId.slice(0, 10)}...{defaultedTransactionId.slice(-10)}
                </span>
              </p>
              {isConfirmedDefaulted && (
                <p>Transaction confirmed!</p>
              )}
            </div>
          )}
          
          {hasActiveLoan && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2 text-center">Active Loan</h3>
              <p className="text-gray-600 text-center mb-4">
                You also have an active loan that needs to be repaid after addressing your defaulted loans
              </p>
              <Button onClick={() => refetch()} className="w-full">
                Refresh Loan Status
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (data && (!data.nftInfo?.tokenId || data.nftInfo.tokenId === "0") && data.hasActiveLoan && loan) {
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
            
            <Button onClick={handleRepayActiveLoan} className="w-full mt-4 primary-button" disabled={isClicked || isConfirming || isConfirmed}>
              {isConfirming ? "Confirming..." : isConfirmed ? "Confirmed" : "Repay Loan"}
            </Button>
            
            {isConfirming && (
              <LoadingOverlay message="Confirming transaction, please do not leave this page until confirmation is complete." />
            )}
            
            {transactionId && !isConfirming && (
              <div className="mt-4">
                <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                  Transaction ID:{" "}
                  <span title={transactionId}>
                    {transactionId.slice(0, 10)}...{transactionId.slice(-10)}
                  </span>
                </p>
                {isConfirmed && (
                  <p>Transaction confirmed!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  let startTime = loanData?.startTime || 0; 
  let loanPeriod = loanData?.loanPeriod || BigInt(30 * 24 * 60 * 60);

  if (loanVersion === "V3" && data?.nftInfo?.ongoingLoan && (startTime === 0 || loanPeriod === 0n)) {
    if (data.nftInfo.tier && data.allTiers) {
      const tierInfo = data.allTiers.find(t => t.tierId === data.nftInfo?.tier);
      if (tierInfo) {
        loanPeriod = BigInt(tierInfo.loanPeriod);
      }
    }
    
    if (startTime === 0) {
      startTime = Math.floor(Date.now() / 1000) - 86400;
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
            onClick={handleRepayActiveLoan}
            className="w-full primary-button"
            disabled={isClicked || isConfirming || isConfirmed}
          >
            {isConfirming ? "Confirming..." : isConfirmed ? "Confirmed" : "Repay Loan"}
          </Button>
          
          {isConfirming && (
            <LoadingOverlay message="Confirming transaction, please do not leave this page until confirmation is complete." />
          )}
          
          {transactionId && !isConfirming && (
            <div className="mt-4">
              <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                Transaction ID:{" "}
                <span title={transactionId}>
                  {transactionId.slice(0, 10)}...{transactionId.slice(-10)}
                </span>
              </p>
              {isConfirmed && (
                <p>Transaction confirmed!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepayLoan;

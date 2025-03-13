
import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, DollarSign, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatUnits } from "viem";
import { useDemoMagnifyWorld } from "@/hooks/useDemoMagnifyWorld";
import { RepayDrawer } from "@/components/RepayDrawer";
import useRepayLoan from "@/hooks/useRepayLoan";

const RepayLoan = () => {
  // States
  const [isClicked, setIsClicked] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // hooks
  const toast = useToast();
  const navigate = useNavigate();
  const ls_wallet = localStorage.getItem("ls_wallet_address");
  const { data, isLoading, isError, refetch } = useDemoMagnifyWorld(ls_wallet as `0x${string}`);
  const { repayLoanWithPermit2, error, transactionId, isConfirming, isConfirmed } = useRepayLoan();
  
  // Safely extract loan data
  const loanData = data?.loan ? data.loan[1] : undefined;
  const loanVersion = data?.loan ? data.loan[0] : "";
  
  // Determine if the user has an active loan - handle both string and object types
  const hasLoan = loanData && typeof loanData !== 'string' ? loanData.isActive : false;
  
  // Calculate loan amount due with interest
  const loanAmountDue = loanData && typeof loanData !== 'string' 
    ? loanData.amount + (loanData.amount * loanData.interestRate) / 10000n
    : 0n;

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleRepayConfirm = useCallback(
    async () => {
      setIsClicked(true);
  
      try {
        if (data?.nftInfo?.tokenId) {
          await repayLoanWithPermit2(loanAmountDue.toString(), loanVersion);
        } else {
          toast.toast({
            title: "Error",
            description: "Unable to pay back loan.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Loan repayment error:", error);
        if (error?.message?.includes("user rejected transaction")) {
          toast.toast({
            title: "Error",
            description: "Transaction rejected by user.",
            variant: "destructive",
          });
        } else {
          toast.toast({
            title: "Error",
            description: error?.message || "Unable to pay back loan.",
            variant: "destructive",
          });
        }
      } finally {
        setIsClicked(false);
      }
    },
    [data, repayLoanWithPermit2, loanAmountDue, loanVersion, toast]
  );
  
  // Handle navigation after repayment
  const handleNavigateAfterTransaction = () => {
    refetch();
    setTimeout(() => navigate("/wallet"), 1000);
  };

  // Call refetch after loan repayment is confirmed
  useEffect(() => {
    if (isConfirmed) {
      const timeout = setTimeout(() => {
        refetch();
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

  // Check if user has an active loan
  if (!isLoading && (!hasLoan || !loanData)) {
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

  // Active loan
  if (!isLoading && loanData && hasLoan && typeof loanData !== 'string') {
    const [daysRemaining, hoursRemaining, minutesRemaining, dueDate] = calculateRemainingTime(
      loanData.startTime,
      loanData.loanPeriod,
    );
    const amountDue = loanData.amount + (loanData.amount * loanData.interestRate) / 10000n;
    
    return (
      <div className="min-h-screen bg-background">
        <Header title="Loan Status" />
        <div className="container max-w-2xl mx-auto p-6 space-y-6">
          <div className="glass-card p-6 space-y-4 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-full ${
                  loanData.isActive ? "bg-green-300" : "bg-red-300"
                } text-black text-sm`}
              >
                {loanData.isActive
                  ? "Active Loan"
                  : "Defaulted Loan"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground text-start">Loan Amount</p>
                  <p className="text-start font-semibold">${formatUnits(loanData.amount, 6)} </p>
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
            <Button
              onClick={handleOpenDrawer}
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
                    <Button type="button" onClick={handleNavigateAfterTransaction} className="mt-2 w-full">
                      View Wallet
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Repay Drawer */}
        <RepayDrawer
          open={isDrawerOpen} 
          onOpenChange={setIsDrawerOpen}
          repayAmount={amountDue}
          onConfirm={handleRepayConfirm}
        />
      </div>
    );
  }

  // Fallback return for any other case
  return (
    <div className="min-h-screen">
      <Header title="Loan Status" />
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">No loan data available.</div>
    </div>
  );
};

// Helper function to calculate the remaining time
const calculateRemainingTime = (startTime: bigint, loanPeriod: bigint) => {
  const dueTimestamp = Number(startTime) + Number(loanPeriod);
  const currentTime = Math.floor(Date.now() / 1000);
  const remainingSeconds = Math.max(0, dueTimestamp - currentTime);
  
  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  
  return [days, hours, minutes, dueTimestamp * 1000];
};

export default RepayLoan;

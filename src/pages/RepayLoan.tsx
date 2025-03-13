
import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, DollarSign, Clock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatUnits } from "viem";
import { useDemoMagnifyWorld } from "@/hooks/useDemoMagnifyWorld";
import useRepayLoan from "@/hooks/useRepayLoan";
import { calculateRemainingTime } from "@/utils/timeinfo";
import { RepayDrawer } from "@/components/RepayDrawer";

const RepayLoan = () => {
  // States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [localLoanData, setLocalLoanData] = useState<any>(null); // Local loan data to persist during repayment
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);

  // hooks
  const { toast } = useToast();
  const navigate = useNavigate();
  const ls_wallet = localStorage.getItem("ls_wallet_address");
  const { data, isLoading, isError, refetch } = useDemoMagnifyWorld(ls_wallet as `0x${string}`);
  const { repayLoanWithPermit2, error, transactionId, isConfirming, isConfirmed } = useRepayLoan();
  
  // Safely extract loan data
  const loanData = data?.loan ? data.loan[1] : undefined;
  const loanVersion = data?.loan ? data.loan[0] : "";
  
  // Determine if the user has an active loan
  const hasLoan = loanData && typeof loanData !== 'string' ? loanData.isActive : false;
  
  // Calculate loan amount due with interest only if loanData exists and is the right type
  const loanAmountDue = loanData && typeof loanData !== 'string' 
    ? loanData.amount + (loanData.amount * loanData.interestRate) / 10000n
    : 0n;

  const loanAmountDueReadable = loanAmountDue ? Number(formatUnits(loanAmountDue, 6)) : 0;

  // Save loan data locally when it's first fetched and NOT in processing state
  useEffect(() => {
    if (loanData && typeof loanData !== 'string' && !isProcessing && !isSuccess) {
      setLocalLoanData(loanData);
    }
  }, [loanData, isProcessing, isSuccess]);

  const handleRepayLoan = useCallback(
    async () => {
      try {
        setIsProcessing(true);
        
        if (data?.nftInfo?.tokenId) {
          const txHash = await repayLoanWithPermit2(loanAmountDueReadable.toString());
          setTxId(txHash);
          
          // After successful transaction, we'll still need to show the success UI
          // but the loan is already marked as inactive by useRepayLoan
          setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
          }, 1000);
        } else {
          toast({
            title: "Error",
            description: "Unable to pay back loan.",
            variant: "destructive",
          });
          setIsProcessing(false);
        }
      } catch (error: any) {
        console.error("Loan repayment error:", error);
        if (error?.message?.includes("user rejected transaction")) {
          toast({
            title: "Error",
            description: "Transaction rejected by user.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error?.message || "Unable to pay back loan.",
            variant: "destructive",
          });
        }
        setIsProcessing(false);
      }
    },
    [data, repayLoanWithPermit2, loanAmountDueReadable, toast]
  );

  const handleOpenDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const handleConfirmRepay = useCallback(() => {
    handleRepayLoan();
    setIsDrawerOpen(false);
  }, [handleRepayLoan]);

  // Simplified handler just to return to wallet - no longer responsible for finalizing the loan repayment
  const handleReturnToWallet = useCallback(() => {
    refetch(); // Just refresh data
    navigate("/wallet"); // Navigate away
  }, [navigate, refetch]);

  // Loading & error states - but not when in processing or success state
  if (isLoading && !isProcessing && !isSuccess) {
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

  if (isError && !isProcessing && !isSuccess) {
    return (
      <div className="min-h-screen">
        <Header title="Loan Status" />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">Error fetching data.</div>
      </div>
    );
  }

  // Use local loan data during processing or success states to maintain UI consistency
  const activeLoanData = (isProcessing || isSuccess) ? localLoanData : loanData;
  const showActiveLoan = (hasLoan || isProcessing || isSuccess) && activeLoanData && typeof activeLoanData !== 'string';

  // Check if user has no active loan
  if (!isLoading && !showActiveLoan && !isProcessing && !isSuccess) {
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

  // Active loan or processing states
  if (showActiveLoan) {
    // Use the active loan data (either real or kept during processing)
    const loan = activeLoanData;
    
    // Calculate time remaining using the utility function
    const [daysRemaining, hoursRemaining, minutesRemaining, dueDate] = calculateRemainingTime(
      loan.startTime,
      loan.loanPeriod
    );
    
    const amountDue = loan.amount + (loan.amount * BigInt(loan.interestRate)) / 10000n;
    
    return (
      <div className="min-h-screen bg-background">
        <Header title="Loan Status" />
        <div className="container max-w-2xl mx-auto p-6 space-y-6">
          <div className="glass-card p-6 space-y-4 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-full ${
                  loan.isActive ? "bg-green-300" : "bg-red-300"
                } text-black text-sm`}
              >
                {loan.isActive
                  ? "Active Loan"
                  : "Defaulted Loan"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground text-start">Loan Amount</p>
                  <p className="text-start font-semibold">${formatUnits(loan.amount, 6)} </p>
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
                    {new Date(Number(dueDate)).toLocaleDateString("en-US", {
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

            {isProcessing && (
          <div className="fixed top-0 left-0 w-full h-full bg-black/70 flex flex-col items-center justify-center z-50">
            <div className="flex justify-center">
              <div className="orbit-spinner">
                <div className="orbit"></div>
                <div className="orbit"></div>
                <div className="center"></div>
              </div>
            </div>
            <p className="text-white text-center max-w-md px-4 text-lg font-medium mt-4">
              Processing transaction, please do not leave this page.
            </p>
          </div>
        )}

            {isSuccess ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center py-4">
                  <p className="text-xl font-semibold text-center">Loan Successfully Repaid!</p>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    Your loan has been repaid successfully. Thank you for using Magnify Cash!
                  </p>
                </div>
                <Button
                  onClick={handleReturnToWallet}
                  className="w-full primary-button"
                >
                  Return to Wallet
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleOpenDrawer}
                className="w-full primary-button"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Repay Loan"}
              </Button>
            )}

            {txId && (
              <div className="mt-2">
                <p className="text-sm text-center overflow-hidden text-ellipsis whitespace-nowrap">
                  Transaction ID:{" "}
                  <span title={txId}>
                    {txId.slice(0, 10)}...{txId.slice(-10)}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Repay Drawer */}
        <RepayDrawer 
          open={isDrawerOpen} 
          onOpenChange={setIsDrawerOpen} 
          repayAmount={amountDue}
          onConfirm={handleConfirmRepay}
        />

      </div>
    );
  }

  // Fallback return for any other case
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
};

export default RepayLoan;

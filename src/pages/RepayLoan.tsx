import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, DollarSign, Clock } from "lucide-react";
import { useMagnifyWorld } from "@/hooks/useMagnifyWorld";
import { calculateRemainingTime } from "@/utils/timeinfo";
import useRepayLoan from "@/hooks/useRepayLoan";
import { useToast } from "@/hooks/use-toast";
import { formatUnits } from "viem";

const RepayLoan = () => {
  // States
  const [isClicked, setIsClicked] = useState(false);

  // Hooks
  const { toast } = useToast();
  const navigate = useNavigate();
  const ls_wallet = localStorage.getItem("ls_wallet_address") || "";
  const { data, isLoading, isError, refetch } = useMagnifyWorld(ls_wallet as `0x${string}`);

  const loan = data?.loan;
  const hasActiveLoan = loan?.isActive === true;

  // Compute total due amount (loan + interest)
  const loanAmountDue = useMemo(() => {
    if (!loan) return BigInt(0);
    return loan.amount + (loan.amount * loan.interestRate) / BigInt(10000);
  }, [loan]);

  // Extract loan version (V1 or V2)
  const loanVersion = useMemo(() => {
    if (!loan) return "";
    return loan?.loanVersion || "";
  }, [loan]);

  const { repayLoanWithPermit2, error, transactionId, isConfirming, isConfirmed } = useRepayLoan();

  // Handle loan repayment
  const handleRepayLoan = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();
      if (isClicked) return;

      setIsClicked(true);
      try {
        if (data?.nftInfo?.tokenId) {
          await repayLoanWithPermit2(loanAmountDue.toString(), loanVersion);
        } else {
          toast({
            title: "Error",
            description: "Unable to repay the loan. Ensure you have a verified NFT.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Loan repayment error:", error);
        toast({
          title: "Error",
          description: error?.message?.includes("user rejected transaction")
            ? "Transaction rejected by user."
            : error?.message || "Unable to repay the loan.",
          variant: "destructive",
        });
      } finally {
        setIsClicked(false);
      }
    },
    [data, repayLoanWithPermit2, loanAmountDue, loanVersion, toast]
  );

  // Call refetch after repayment confirmation
  useEffect(() => {
    if (isConfirmed) {
      const timeout = setTimeout(() => refetch(), 1000);
      return () => clearTimeout(timeout);
    }
  }, [isConfirmed, refetch]);

  // **Loading State**
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Loan Status" />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
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

  // **Error State**
  if (isError) {
    return (
      <div className="min-h-screen">
        <Header title="Loan Status" />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <p className="text-red-500">Error fetching data. Please try again.</p>
        </div>
      </div>
    );
  }

  // **No Active Loan**
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

  // **Active Loan**
  const [daysRemaining, hoursRemaining, minutesRemaining, dueDate] = calculateRemainingTime(
    loan.startTime,
    loan.loanPeriod
  );

  return (
    <div className="min-h-screen bg-background">
      <Header title="Loan Status" />
      <div className="container max-w-2xl mx-auto p-6 space-y-6">
        <div className="glass-card p-6 space-y-4 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <span
              className={`px-3 py-1 rounded-full ${
                minutesRemaining !== 0 ? "bg-green-300" : "bg-red-300"
              } text-black text-sm`}
            >
              {daysRemaining === 0 && hoursRemaining === 0 && minutesRemaining === 0
                ? "Defaulted"
                : "Active"}{" "}
              Loan
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground text-start">Loan Amount</p>
                <p className="text-start font-semibold">${formatUnits(loan.amount, 6)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground text-start">Repayment Amount</p>
                <p className="text-start font-semibold">${formatUnits(loanAmountDue, 6)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground text-start">Due Date</p>
                <p className="text-start font-semibold">{new Date(dueDate).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <Button onClick={handleRepayLoan} className="w-full primary-button" disabled={isClicked || isConfirming}>
            {isConfirming ? "Confirming..." : isConfirmed ? "Confirmed" : "Repay Loan"}
          </Button>

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

          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default RepayLoan;
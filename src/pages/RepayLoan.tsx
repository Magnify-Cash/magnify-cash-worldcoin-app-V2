import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UseQueryResult } from "@tanstack/react-query";
import { useMagnifyWorld } from "@/hooks/useMagnifyWorld";
import { fromUnixTime, add } from "date-fns";
import { formatUnits, parseUnits } from "viem";
import useRepayLoan from "@/hooks/useRepayLoan";
import { calculateRepaymentAmount } from "@/utils/feeUtils";
import { useNavigate } from "react-router-dom";
import { fetchBorrowerInfo } from "@/utils/borrowerInfoUtils";
import { useWalletUSDCBalance } from "@/hooks/useWalletUSDCBalance";
import { useDefaultedLoans } from "@/hooks/useDefaultedLoans";
import { DefaultedLoanCard } from "@/components/DefaultedLoanCard";
import { LoadingState } from "@/components/portfolio/LoadingState";
import { TransactionOverlay } from "@/components/TransactionOverlay";

const RepayLoan = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const ls_wallet = localStorage.getItem("ls_wallet_address") || "";
  const [isClicked, setIsClicked] = useState(false);
  const { data, isLoading: isLoadingNFT, refetch } = useMagnifyWorld(ls_wallet as `0x${string}`);
  const { balance } = useWalletUSDCBalance(ls_wallet as `0x${string}`);
  const { hasDefaultedLoan, isLoading: isLoadingDefaultedLoans, defaultedLoans } = useDefaultedLoans(ls_wallet);
  const { repayLoanWithPermit2, error, transactionId, isConfirming, isConfirmed, loanDetails } = useRepayLoan();
  const [isConfirmingDefaulted, setIsConfirmingDefaulted] = useState(false);
  const [selectedDefaultedLoan, setSelectedDefaultedLoan] = useState<any | null>(null);

  // Extract loan information from data
  const hasActiveLoan = data?.hasActiveLoan ?? false;
  const loanVersion = data?.loan ? data.loan[0].version : null;
  const poolAddress = data?.loan ? data.loan[0].poolAddress : null;

  const loanAmount = data?.loan ? data.loan[0].amount : 0;
  const loanStartTime = data?.loan ? data.loan[0].startTime : 0;
  const interestRate = data?.loan ? data.loan[0].interestRate : 0;
  const loanPeriod = data?.loan ? data.loan[0].loanPeriod : 0;

  const loanStartDate = useMemo(() => {
    return fromUnixTime(loanStartTime);
  }, [loanStartTime]);

  const loanEndDate = useMemo(() => {
    return add(loanStartDate, { seconds: loanPeriod });
  }, [loanStartDate, loanPeriod]);

  const totalRepaymentAmount = useMemo(() => {
    if (loanAmount && interestRate && loanPeriod) {
      return calculateRepaymentAmount(loanAmount, interestRate, loanPeriod);
    }
    return 0;
  }, [loanAmount, interestRate, loanPeriod]);

  const formattedTotalRepaymentAmount = useMemo(() => {
    return totalRepaymentAmount ? formatUnits(totalRepaymentAmount, 6) : "0";
  }, [totalRepaymentAmount]);

  const handleRepayLoan = useCallback(async () => {
    if (isClicked) return;
    setIsClicked(true);

    try {
      if (!loanAmount) {
        toast({
          title: "Error",
          description: "Unable to repay loan. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (balance && totalRepaymentAmount) {
        if (balance < Number(formattedTotalRepaymentAmount)) {
          toast({
            title: "Insufficient Balance",
            description: `You need at least ${formattedTotalRepaymentAmount} USDC to repay the loan.`,
            variant: "destructive",
          });
          return;
        }

        const loanAmountBigInt = parseUnits(formattedTotalRepaymentAmount, 6);
        await repayLoanWithPermit2(loanAmountBigInt, loanVersion, poolAddress);

        sessionStorage.removeItem("usdcBalance");
        sessionStorage.removeItem("walletTokens");
        sessionStorage.removeItem("walletCacheTimestamp");
      } else {
        toast({
          title: "Error",
          description: "Unable to repay loan. Ensure you have sufficient balance.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Loan repayment error:", error);
      toast({
        title: "Error",
        description: error?.message?.includes("user rejected transaction")
          ? "Transaction rejected by user."
          : error?.message || "Unable to repay loan.",
        variant: "destructive",
      });
    } finally {
      setIsClicked(false);
    }
  }, [data, repayLoanWithPermit2, toast, balance, isClicked, formattedTotalRepaymentAmount, loanVersion, poolAddress]);

  const handleNavigateAfterTransaction = async () => {
    await refetch();
    setTimeout(() => navigate("/loan-history"), 1000);
  };

  const handleRepayDefaultedLoan = useCallback(async (loan: any) => {
    if (isConfirmingDefaulted) return;
    setIsConfirmingDefaulted(true);
    setSelectedDefaultedLoan(loan);

    try {
      if (!loan) {
        toast({
          title: "Error",
          description: "Unable to repay loan. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (balance && loan.amount) {
        if (balance < Number(loan.amount)) {
          toast({
            title: "Insufficient Balance",
            description: `You need at least ${loan.amount} USDC to repay the loan.`,
            variant: "destructive",
          });
          return;
        }

        const loanAmountBigInt = parseUnits(loan.amount, 6);
        await repayLoanWithPermit2(loanAmountBigInt, "V3", loan.poolAddress);

        sessionStorage.removeItem("usdcBalance");
        sessionStorage.removeItem("walletTokens");
        sessionStorage.removeItem("walletCacheTimestamp");
      } else {
        toast({
          title: "Error",
          description: "Unable to repay loan. Ensure you have sufficient balance.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Loan repayment error:", error);
      toast({
        title: "Error",
        description: error?.message?.includes("user rejected transaction")
          ? "Transaction rejected by user."
          : error?.message || "Unable to repay loan.",
        variant: "destructive",
      });
    } finally {
      setIsConfirmingDefaulted(false);
    }
  }, [repayLoanWithPermit2, toast, balance, isConfirmingDefaulted]);

  // Determine if we're in a loading state - make sure we show loading until ALL data is ready
  const isLoading = isLoadingNFT || isLoadingDefaultedLoans;

  return (
    <div className="min-h-screen bg-background">
      <Header title="Loan Status" />
      
      {/* Global loading overlay */}
      <TransactionOverlay 
        isVisible={isLoading} 
        message="Loading loan information..."
      />
      
      {/* Transaction confirmation overlays */}
      <TransactionOverlay 
        isVisible={isConfirmingDefaulted} 
        message="Confirming default loan repayment, please wait..."
      />
      
      <TransactionOverlay 
        isVisible={isConfirming} 
        message="Confirming transaction, please do not leave this page until confirmation is complete."
      />
      
      <div className="container max-w-2xl mx-auto p-6 space-y-6">
        {isLoading ? (
          <LoadingState />
        ) : hasDefaultedLoan ? (
          <>
            <h2 className="text-2xl font-semibold mb-4">Defaulted Loans</h2>
            {defaultedLoans && defaultedLoans.length > 0 ? (
              defaultedLoans.map((loan, index) => (
                <DefaultedLoanCard
                  key={index}
                  loan={loan}
                  onRepay={() => handleRepayDefaultedLoan(loan)}
                  isConfirming={isConfirmingDefaulted && selectedDefaultedLoan === loan}
                />
              ))
            ) : (
              <div className="glass-card p-6 text-center">
                <h3 className="text-lg font-medium mb-2">No Defaulted Loans Found</h3>
                <p className="text-gray-600">You don't have any defaulted loans.</p>
              </div>
            )}
          </>
        ) : !hasActiveLoan ? (
          <div className="glass-card p-6 text-center">
            <h3 className="text-lg font-medium mb-2">No Active Loan</h3>
            <p className="text-gray-600">You don't have any active loans currently.</p>
            <Button onClick={() => navigate("/loan")} className="mt-4">
              Get a Loan
            </Button>
          </div>
        ) : (
          <>
            <div className="glass-card p-6">
              <h2 className="text-2xl font-semibold mb-4">Loan Details</h2>
              <div className="mb-4">
                <strong>Loan Amount:</strong> {loanAmount ? formatUnits(loanAmount, 6) : "0"} USDC
              </div>
              <div className="mb-4">
                <strong>Interest Rate:</strong> {interestRate / 100}%
              </div>
              <div className="mb-4">
                <strong>Loan Start Date:</strong> {loanStartDate.toLocaleDateString()}
              </div>
              <div className="mb-4">
                <strong>Loan End Date:</strong> {loanEndDate.toLocaleDateString()}
              </div>
              <div className="mb-4">
                <strong>Total Repayment Amount:</strong> {formattedTotalRepaymentAmount} USDC
              </div>
              {error && (
                <div className="text-red-500 mt-4">Error: {error}</div>
              )}
              {transactionId && (
                <div className="mt-4">
                  Transaction ID: {transactionId}
                </div>
              )}
              {isConfirmed && (
                <div className="mt-4 text-green-500">
                  Loan Repaid Successfully!
                  <Button type="button" onClick={handleNavigateAfterTransaction} className="mt-2 w-full">
                    View Loan History
                  </Button>
                </div>
              )}
              <Button onClick={handleRepayLoan} disabled={isConfirming || isClicked} className="w-full">
                Repay Loan
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RepayLoan;

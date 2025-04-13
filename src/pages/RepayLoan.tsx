
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useMagnifyWorld } from "@/hooks/useMagnifyWorld";
import { LoanCard } from "@/components/LoanCard";
import { DefaultedLoanCard } from "@/components/DefaultedLoanCard";
import { useRepayLoan } from "@/hooks/useRepayLoan";
import { calculateRepaymentAmount } from "@/utils/feeUtils";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDefaultedLoans } from "@/hooks/useDefaultedLoans";
import { TransactionOverlay } from "@/components/TransactionOverlay";

const RepayLoan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const ls_wallet = localStorage.getItem("ls_wallet_address") || "";
  const { data, isLoading, refetch } = useMagnifyWorld(ls_wallet as `0x${string}`);
  const { repayLoan, transactionId, isConfirming, isConfirmed } = useRepayLoan();
  const { defaultedLoans, isLoading: isLoadingDefaulted, repayDefaultedLoan, hasDefaultedLoan, refetch: refetchDefaulted } = useDefaultedLoans(ls_wallet);
  const [loanDetails, setLoanDetails] = useState<{
    version: string | null;
    poolAddress: string | null;
    loanAmount: number;
    startTime: number;
    interestRate: number;
    loanPeriod: number;
    repayAmount: number;
  } | null>(null);

  // Process loan data into a more usable format
  useEffect(() => {
    if (data?.loan && data.loan.length >= 2) {
      const version = data.loan[0] ? data.loan[0] : null;
      const poolAddress = data.loan[1]?.poolAddress ? data.loan[1].poolAddress : null;
      
      const amount = typeof data.loan[1]?.amount === 'bigint' 
        ? Number(data.loan[1].amount) / 1e6 
        : 0;
        
      const startTime = typeof data.loan[1]?.startTime === 'number' 
        ? data.loan[1].startTime 
        : 0;
        
      const interestRate = typeof data.loan[1]?.interestRate === 'bigint' 
        ? Number(data.loan[1].interestRate) / 100 
        : 0;
        
      const loanPeriod = typeof data.loan[1]?.loanPeriod === 'bigint' 
        ? Number(data.loan[1].loanPeriod) 
        : 0;

      const repayAmount = calculateRepaymentAmount(amount, interestRate);

      setLoanDetails({
        version,
        poolAddress,
        loanAmount: amount,
        startTime,
        interestRate,
        loanPeriod,
        repayAmount
      });
    } else {
      setLoanDetails(null);
    }
  }, [data]);

  // Handle confirmation and redirect
  useEffect(() => {
    if (isConfirmed && transactionId) {
      const timeout = setTimeout(async () => {
        await refetch();
        await refetchDefaulted();
        toast({
          title: "Success",
          description: "Loan repaid successfully!",
        });
        navigate("/profile");
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isConfirmed, transactionId, refetch, refetchDefaulted, toast, navigate]);

  const handleRepayLoan = async () => {
    try {
      if (loanDetails?.poolAddress) {
        await repayLoan(loanDetails.poolAddress);
      } else {
        toast({
          title: "Error",
          description: "Unable to repay loan. Pool address not found.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Unable to repay loan.",
        variant: "destructive",
      });
    }
  };

  const handleRepayDefaultedLoan = async () => {
    try {
      await repayDefaultedLoan();
      await refetch();
      await refetchDefaulted();
    } catch (error: any) {
      console.error("Error repaying defaulted loan:", error);
      toast({
        title: "Error",
        description: error?.message || "Unable to repay defaulted loan.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Header title="Repay Loan" />
      
      {/* Transaction overlay for processing */}
      <TransactionOverlay
        isVisible={isConfirming}
        message="Processing your repayment, please do not leave this page until confirmation is complete."
      />
      
      {isLoading || isLoadingDefaulted ? (
        <div className="h-[calc(100vh-80px)]"></div>
      ) : hasDefaultedLoan ? (
        <div className="p-6 space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2 text-red-500">Defaulted Loan</h2>
            <p className="text-gray-600">
              You have a defaulted loan that needs to be repaid before you can request a new loan.
            </p>
          </div>

          {defaultedLoans.map((loan, index) => (
            <DefaultedLoanCard
              key={index}
              loan={loan}
              onRepay={handleRepayDefaultedLoan}
              isConfirming={isConfirming}
            />
          ))}
        </div>
      ) : data?.hasActiveLoan && loanDetails ? (
        <div className="p-6 space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">Active Loan</h2>
            <p className="text-gray-600">
              Repay your active loan to become eligible for a new loan.
            </p>
          </div>
          
          <LoanCard
            version={loanDetails.version || "V3"}
            amount={loanDetails.loanAmount}
            interestRate={loanDetails.interestRate}
            repayAmount={loanDetails.repayAmount}
            startTime={loanDetails.startTime}
            loanPeriod={loanDetails.loanPeriod}
            onRepay={handleRepayLoan}
            isLoading={isConfirming}
          />

          {transactionId && (
            <div className="glass-card p-4 mt-4">
              <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                Transaction ID:{" "}
                <span title={transactionId}>
                  {transactionId.slice(0, 10)}...{transactionId.slice(-10)}
                </span>
              </p>
              
              {isConfirmed && (
                <p className="text-green-500 font-semibold mt-2">
                  Transaction confirmed! Redirecting to profile...
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 space-y-6">
          <div className="glass-card p-6 text-center">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Active Loans</h3>
            <p className="text-gray-600 mb-4">
              You don't have any active loans to repay.
            </p>
            <Button onClick={() => navigate("/loan")} className="glass-button w-full sm:w-auto">
              Get a Loan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepayLoan;


import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import LoanCard from "@/components/LoanCard";
import { useRequestLoan } from "@/hooks/useRequestLoan";
import { TransactionOverlay } from "@/components/TransactionOverlay";
import { useRepayLoan } from "@/hooks/useRepayLoan"; // Fixed import

export default function RepayLoan() {
  const navigate = useNavigate();
  const { activeLoan, borrowerInfo, refreshLoanData } = useRequestLoan();
  const { repayLoan, isLoading, error, isSuccess, isPending } = useRepayLoan();
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    refreshLoanData();
  }, [refreshLoanData]);

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        navigate("/loan", { replace: true });
      }, 2000);
    }
  }, [isSuccess, navigate]);

  const handleRepayLoan = async () => {
    if (!borrowerInfo || !activeLoan || !borrowerInfo.contractAddress) return;

    try {
      setShowConfirmation(true);
      await repayLoan(
        borrowerInfo.contractAddress,
        {
          amount: activeLoan.loanAmount,
          startTime: activeLoan.startTimestamp,
          isActive: activeLoan.isActive,
          interestRate: activeLoan.interestRate,
          loanPeriod: activeLoan.loanPeriod
        },
        () => {
          // Success callback
          setShowConfirmation(false);
          refreshLoanData();
        },
        () => {
          // Transaction sent callback
        }
      );
    } catch (err: any) {
      console.error("Error repaying loan:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to repay loan",
        variant: "destructive",
      });
      setShowConfirmation(false);
    }
  };

  return (
    <div className="container py-8 max-w-lg mx-auto">
      <TransactionOverlay isVisible={isPending} message="Repaying your loan, please wait for confirmation..." />
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Repay Your Loan</CardTitle>
          <CardDescription className="text-center">
            Pay back your outstanding loan and associated interest
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {activeLoan ? (
            <LoanCard
              loan={activeLoan}
              borrowerInfo={borrowerInfo}
              showPayButton={false}
              showStatus={true}
            />
          ) : (
            <div className="text-center py-6 text-gray-500">
              {isLoading ? "Loading loan data..." : "No active loan found"}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
          <Button 
            onClick={handleRepayLoan} 
            disabled={!activeLoan || isLoading || isSuccess}
            className="w-full bg-[#8B5CF6] hover:bg-[#7c50e6]"
          >
            {isLoading ? "Processing..." : isSuccess ? "Repayment Successful!" : "Repay Loan"}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate("/loan")}
            className="w-full"
          >
            Back to Loan
          </Button>
          
          {error && (
            <div className="text-red-500 text-center text-sm">{error}</div>
          )}
          
          {isSuccess && (
            <div className="text-green-500 text-center text-sm">
              Loan successfully repaid! Redirecting...
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ChevronsLeft, ChevronsRight, Coins } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { getLoanById } from "@/lib/loanRequests";
import { Loan } from "@/types/supabase/loan";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/portfolio/LoadingState";
import { useRepayLoan } from "@/hooks/useRepayLoan";
import { format } from 'date-fns';

const RepayLoan = () => {
  const { id } = useParams();
  const isMobile = useIsMobile();

  const [loading, setLoading] = useState(true);
  const [loanData, setLoanData] = useState<Loan | null>(null);

  const {
    transactionHash,
    isLoading: isRepaying,
    error: repayError,
    repayLoan,
    receipt
  } = useRepayLoan();

  useEffect(() => {
    if (repayError) {
      toast({
        title: "Error repaying loan",
        description: repayError.message,
        variant: "destructive",
      });
    }
  }, [repayError]);

  useEffect(() => {
    if (receipt?.status === 1) {
      toast({
        title: "Loan Repaid Successfully",
        description: `Transaction Hash: ${transactionHash}`,
      });
    } else if (receipt?.status === 0) {
      toast({
        title: "Loan Repayment Failed",
        description: `Transaction Hash: ${transactionHash}`,
        variant: "destructive",
      });
    }
  }, [receipt, transactionHash]);

  useEffect(() => {
    const fetchLoanData = async () => {
      if (!id) {
        toast({
          title: "Loan ID not found",
          description: "Please provide a valid loan ID.",
          variant: "destructive",
        });
        return;
      }

      try {
        setLoading(true);
        const loan = await getLoanById(parseInt(id));

        if (!loan) {
          toast({
            title: "Loan not found",
            description: "The requested loan does not exist.",
            variant: "destructive",
          });
          return;
        }

        setLoanData(loan);
      } catch (error) {
        console.error("Error fetching loan data:", error);
        toast({
          title: "Error",
          description: "Failed to load loan data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLoanData();
  }, [id]);

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Repay Loan" />
        <main className="container max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
          <LoadingState message="Loading Loan Details" />
        </main>
      </div>
    );
  }

  // Convert number to BigInt for loanAmountDue
  const loanAmountDue = BigInt(loanData?.amount_due || 0);

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header title="Repay Loan" />

      <main className="container max-w-3xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        {loanData && (
          <>
            <Card className="mb-6 border border-[#8B5CF6]/20 overflow-hidden">
              <div className="bg-gradient-to-r from-[#8B5CF6]/10 to-[#6E59A5]/5 py-5 px-6 flex justify-center">
                <div className="flex items-center gap-3">
                  <div className="bg-[#8B5CF6]/20 rounded-full p-2 flex items-center justify-center">
                    <Coins className="h-5 w-5 sm:h-6 sm:w-6 text-[#8B5CF6]" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold">
                    Loan Details
                  </h1>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6">
              <Card className="w-full border border-[#8B5CF6]/20 overflow-hidden">
                <CardHeader className="pb-2 pt-4 bg-gradient-to-r from-[#8B5CF6]/10 to-[#6E59A5]/5">
                  <CardTitle className="text-xl flex items-center gap-2 justify-center">
                    Loan Information
                  </CardTitle>
                </CardHeader>
                <CardContent className={`${isMobile ? "px-3 py-2" : "pt-5"} space-y-3 sm:space-y-4`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Loan Amount</p>
                      <p className="text-sm sm:text-lg font-semibold">{formatValue(loanData.loan_amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Amount Due</p>
                      <p className="text-sm sm:text-lg font-semibold">{formatValue(loanData.amount_due)}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Interest Rate</p>
                      <p className="text-sm sm:text-lg font-semibold">{loanData.interest_rate}%</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Loan Start Date</p>
                      <p className="text-sm sm:text-lg font-semibold">{formatDate(loanData.loan_start_date)}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Loan End Date</p>
                      <p className="text-sm sm:text-lg font-semibold">{formatDate(loanData.loan_end_date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={() => repayLoan(loanAmountDue)}
                disabled={isRepaying}
                className="w-full"
              >
                {isRepaying ? "Repaying..." : "Repay Loan"}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default RepayLoan;

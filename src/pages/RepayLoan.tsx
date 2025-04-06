
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { LoanCard } from "@/components/LoanCard";
import useRequestLoan from "@/hooks/useRequestLoan";
import { TransactionOverlay } from "@/components/TransactionOverlay";
import { useRepayLoan } from "@/hooks/useRepayLoan";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  repaymentAmount: z.string().min(1, "Amount is required"),
});

export default function RepayLoan() {
  const navigate = useNavigate();
  const { activeLoan, borrowerInfo, refreshLoanData } = useRequestLoan();
  const { repayLoan, isLoading, error, isSuccess, isPending } = useRepayLoan();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repaymentAmount: "",
    },
  });

  useEffect(() => {
    refreshLoanData();
  }, [refreshLoanData]);

  useEffect(() => {
    if (activeLoan && activeLoan.loanAmount) {
      const interest = (activeLoan.loanAmount * activeLoan.interestRate) / 10000;
      const totalDue = activeLoan.loanAmount + interest;
      form.setValue("repaymentAmount", totalDue.toString());
    }
  }, [activeLoan, form]);

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        navigate("/loan", { replace: true });
      }, 2000);
    }
  }, [isSuccess, navigate]);

  const handleRepayLoan = async (values: z.infer<typeof formSchema>) => {
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

  const calculateTotalDue = () => {
    if (!activeLoan) return 0;
    const interest = (activeLoan.loanAmount * activeLoan.interestRate) / 10000;
    return activeLoan.loanAmount + interest;
  };

  return (
    <div className="container py-8 max-w-lg mx-auto">
      <TransactionOverlay isVisible={isPending} message="Repaying your loan, please wait for confirmation..." />
      
      <Card className="mb-8">
        <CardHeader className="bg-gradient-to-r from-[#1A1E8F]/10 via-[#5A1A8F]/10 to-[#A11F75]/10">
          <CardTitle className="text-2xl text-center bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] bg-clip-text text-transparent">
            Repay Your Loan
          </CardTitle>
          <CardDescription className="text-center">
            Pay back your outstanding loan and associated interest
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          {activeLoan ? (
            <>
              <LoanCard
                loan={activeLoan}
                borrowerInfo={borrowerInfo}
                showPayButton={false}
                showStatus={true}
              />
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium mb-2">Repayment Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Principal:</div>
                  <div className="text-right font-medium">${activeLoan.loanAmount.toFixed(2)}</div>
                  
                  <div className="text-gray-600">Interest ({activeLoan.interestRate / 100}%):</div>
                  <div className="text-right font-medium">
                    ${((activeLoan.loanAmount * activeLoan.interestRate) / 10000).toFixed(2)}
                  </div>
                  
                  <div className="text-gray-600 font-medium">Total Due:</div>
                  <div className="text-right font-bold">${calculateTotalDue().toFixed(2)}</div>
                </div>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleRepayLoan)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="repaymentAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repayment Amount (USDC)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01"
                            disabled={true}
                            className="bg-gray-100"
                          />
                        </FormControl>
                        <FormDescription>
                          This is the total amount due including interest
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit"
                    disabled={!activeLoan || isLoading || isSuccess}
                    className="w-full bg-[#8B5CF6] hover:bg-[#7c50e6]"
                  >
                    {isLoading ? "Processing..." : isSuccess ? "Repayment Successful!" : "Repay Loan"}
                  </Button>
                </form>
              </Form>
            </>
          ) : (
            <div className="text-center py-6 text-gray-500">
              {isLoading ? "Loading loan data..." : "No active loan found"}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
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

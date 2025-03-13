
import React from "react";
import { X, Check, ArrowRight } from "lucide-react";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useDemoData } from "@/providers/DemoDataProvider";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface LoanDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanAmount: number;
  loanDuration: number;
}

export function LoanDrawer({ open, onOpenChange, loanAmount, loanDuration }: LoanDrawerProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { requestLoan } = useDemoData();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [transactionId, setTransactionId] = React.useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);

      // Simulate a delay for transaction processing
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Use the tierId as 1 for device verification, 2 for orb verification
      const tierId = loanAmount > 1 ? 2 : 1;
      const txId = await requestLoan(tierId);
      
      setTransactionId(txId);
      setIsConfirmed(true);
      setIsProcessing(false);

      toast({
        title: "Loan Approved!",
        description: "Your loan has been successfully processed.",
      });
    } catch (error) {
      console.error("Error confirming loan:", error);
      toast({
        title: "Error",
        description: "Failed to process loan. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleComplete = () => {
    onOpenChange(false);
    navigate("/repay-loan");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-center text-xl font-semibold">
              Loan Application
            </DrawerTitle>
            <button 
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </DrawerHeader>
          
          <div className="px-4 py-2">
            <div className="my-4 space-y-4">
              {!isConfirmed ? (
                <>
                  <h3 className="text-lg font-medium">Transaction Details</h3>
                  <div className="space-y-2 rounded-lg border p-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount</span>
                      <span className="font-medium">${loanAmount} USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Interest Rate</span>
                      <span className="font-medium">5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-medium">{loanDuration} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Repayment</span>
                      <span className="font-medium">${(loanAmount * 1.05).toFixed(2)} USDC</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4 py-6">
                  <div className="rounded-full bg-green-100 p-3">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-center">Loan Approved!</h3>
                  <p className="text-sm text-gray-500 text-center">
                    Your loan of ${loanAmount} USDC has been approved and funds have been transferred to your wallet.
                  </p>
                  {transactionId && (
                    <div className="w-full mt-4">
                      <p className="text-xs text-gray-500">
                        Transaction ID:
                      </p>
                      <p className="text-xs font-mono bg-gray-100 p-2 rounded overflow-x-auto">
                        {transactionId}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <DrawerFooter>
            {!isConfirmed ? (
              <Button 
                onClick={handleConfirm} 
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? "Processing..." : "Confirm Loan"}
              </Button>
            ) : (
              <Button 
                onClick={handleComplete}
                className="w-full"
              >
                View Loan Details <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

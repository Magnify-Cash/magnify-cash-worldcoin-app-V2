
import { useState, useEffect } from "react";
import { Shield, Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useDemoData } from "@/providers/DemoDataProvider";
import { LoanDrawer } from "@/components/LoanDrawer";
import { useToast } from "@/hooks/use-toast";

const Loan = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  // Track if user just completed a loan request in this session
  const [justRequestedLoan, setJustRequestedLoan] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { demoData, requestLoan, originationFee } = useDemoData();

  // Extract user data
  const { isDeviceVerified, isOrbVerified, hasLoan } = demoData;
  const isVerified = isDeviceVerified || isOrbVerified;
  const isOrbTier = isOrbVerified && !isDeviceVerified;

  // Determine loan amount and duration based on verification level
  const loanAmount = isOrbVerified ? 10 : 1;
  const loanDuration = isOrbVerified ? 90 : 30;

  // Handle loan application
  const handleApplyLoan = () => {
    setIsDrawerOpen(true);
  };

  // Handle confirmation from the drawer
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
      setJustRequestedLoan(true);

      if(isOrbTier) {
        originationFee(false)
      } else {
        originationFee(true)
      }

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

  // Handle navigation after claiming loan
  const handleNavigateAfterTransaction = () => {
    navigate("/repay-loan");
  };

  return (
    <div className="min-h-screen">
      <Header title="Get a Loan" />
      
      {!isVerified ? (
        <div className="p-6 space-y-6 text-center">
          <h2 className="text-2xl font-semibold">You Don't Have the Required NFT</h2>
          <p>To be eligible for a loan, you need to own a specific NFT. Please upgrade your account.</p>
          <Button onClick={() => navigate("/upgrade-verification")} className="w-full">
            Upgrade Now
          </Button>
        </div>
      ) : hasLoan && !justRequestedLoan ? (
        <div className="p-6 space-y-6 text-center">
          <h2 className="text-2xl font-semibold">You already have an active loan</h2>
          <p>You currently have an active loan. Please repay it first.</p>
          <Button onClick={() => navigate("/repay-loan")} className="mt-4 w-full">
            Repay Loan
          </Button>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-center">Current Loan Eligibility</h2>

            <div className="mt-10">
              <div className="flex items-center">
                <Shield className="w-6 h-6 mr-2" />
                <span>{isOrbVerified ? "Orb Verified" : "Device Verified"}</span>
              </div>
              <div className="flex flex-col items-start space-y-3 my-3">
                <p className="text-gray-600">Loan Amount: ${loanAmount}</p>
                <p className="text-gray-600">Interest Rate: 17.5%</p>
                <p className="text-gray-600">Origination Fee: 10.0%</p>
                <p className="text-gray-600">Duration: {loanDuration} days</p>
              </div>
              <Button
                onClick={handleApplyLoan}
                className="w-full"
                disabled={isProcessing || isConfirmed}
              >
                {isProcessing ? "Confirming..." : isConfirmed ? "Confirmed" : "Apply Now"}
              </Button>
              <hr className="border-t border-gray-300 mt-4" />
            </div>
            
            {transactionId && (
              <div className="mt-4">
                <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                  Transaction ID:{" "}
                  <span title={transactionId}>
                    {transactionId.slice(0, 10)}...{transactionId.slice(-10)}
                  </span>
                </p>
              </div>
            )}

            {isProcessing && (
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
              <div className="mt-4">
                <div className="flex justify-center mb-4">
                </div>
                <p>Transaction confirmed!</p>
                <Button 
                  type="button" 
                  onClick={handleNavigateAfterTransaction} 
                  className="mt-4 w-full"
                >
                  View Loan Details <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <LoanDrawer 
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        loanAmount={loanAmount}
        loanDuration={loanDuration}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default Loan;

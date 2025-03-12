import { useState, useCallback } from "react";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import useRequestLoan from "@/hooks/useRequestLoan";
import { Button } from "@/components/ui/button";
import { useDemoData } from "@/providers/DemoDataProvider";

const Loan = () => {
  const [isClicked, setIsClicked] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { demoData } = useDemoData();
  const { requestNewLoan, transactionId, isConfirming, isConfirmed } = useRequestLoan();

  // Extract user data
  const { isDeviceVerified, isOrbVerified, hasLoan } = demoData;
  const isVerified = isDeviceVerified || isOrbVerified;

  // Determine loan amount and duration based on verification level
  const loanAmount = isOrbVerified ? 10 : 1;
  const loanDuration = isOrbVerified ? 90 : 30;

  // Handle loan application
  const handleApplyLoan = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (isClicked) return;
      setIsClicked(true);

      if (!isVerified) {
        toast({
          title: "Error",
          description: "Unable to apply for loan. Ensure you have a verified NFT.",
          variant: "destructive",
        });
        setIsClicked(false);
        return;
      }

      try {
        await requestNewLoan(BigInt(isOrbVerified ? 2 : 1));
      } catch (error: any) {
        console.error("Loan application error:", error);
        toast({
          title: "Error",
          description: error?.message || "Unable to request loan.",
          variant: "destructive",
        });
      } finally {
        setIsClicked(false);
      }
    },
    [isVerified, isOrbVerified, requestNewLoan, toast, isClicked]
  );

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
      ) : hasLoan ? (
        <div className="p-6 space-y-6 text-center">
          <h2 className="text-2xl font-semibold">You already have an active loan</h2>
          <p>You currently have an active loan. Please repay it first.</p>
          <Button onClick={() => navigate("/repay-loan")} className="mt-4 w-full">
            Repay Loan
          </Button>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          <div className="glass-card p-6 text-center">
            <h2 className="text-lg font-semibold">Loan Eligibility</h2>

            <div className="mt-10">
              <div className="flex items-center">
                <Shield className="w-6 h-6 mr-2" />
                <span>{isOrbVerified ? "Orb Verified Loan" : "Device Verified Loan"}</span>
              </div>
              <div className="mt-3">
                <p>Loan Amount: ${loanAmount} USDC</p>
                <p>Interest Rate: 5%</p>
                <p>Duration: {loanDuration} days</p>
              </div>
              <Button
                onClick={(event) => handleApplyLoan(event)}
                disabled={isClicked || isConfirming || isConfirmed}
                className="w-full mt-4"
              >
                {isConfirming ? "Confirming..." : isConfirmed ? "Confirmed" : "Apply Now"}
              </Button>
            </div>

            {transactionId && (
              <div className="mt-4">
                <p className="text-sm">
                  Transaction ID:{" "}
                  <span title={transactionId}>{transactionId.slice(0, 10)}...{transactionId.slice(-10)}</span>
                </p>
                {isConfirmed && (
                  <Button onClick={() => navigate("/repay-loan")} className="mt-2 w-full">
                    View Loan Details
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Loan;

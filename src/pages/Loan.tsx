
import { useState } from "react";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useDemoData } from "@/providers/DemoDataProvider";
import { LoanDrawer } from "@/components/LoanDrawer";

const Loan = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { demoData } = useDemoData();

  // Extract user data
  const { isDeviceVerified, isOrbVerified, hasLoan } = demoData;
  const isVerified = isDeviceVerified || isOrbVerified;

  // Determine loan amount and duration based on verification level
  const loanAmount = isOrbVerified ? 10 : 1;
  const loanDuration = isOrbVerified ? 90 : 30;

  // Handle loan application
  const handleApplyLoan = () => {
    setIsDrawerOpen(true);
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
                onClick={handleApplyLoan}
                className="w-full mt-4"
              >
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      )}

      <LoanDrawer 
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        loanAmount={loanAmount}
        loanDuration={loanDuration}
      />
    </div>
  );
};

export default Loan;

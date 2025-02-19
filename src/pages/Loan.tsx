import { useState, useCallback } from "react";
import { formatUnits } from "viem";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useToast } from "@/components/ui/use-toast";
import { useMagnifyWorld } from "@/hooks/useMagnifyWorld";
import useRequestLoan from "@/hooks/useRequestLoan";
import { Button } from "@/components/ui/button";

const Loan = () => {
  // hooks
  const { toast } = useToast();
  const navigate = useNavigate();
  const ls_wallet = localStorage.getItem("ls_wallet_address");
  const { data, isLoading, isError, refetch } = useMagnifyWorld(ls_wallet);
  const { requestNewLoan, error, transactionId, isConfirming, isConfirmed } = useRequestLoan();

  // state
  const hasActiveLoan = data?.loan[0] !== "";

  // Handle loan application
  const handleApplyLoan = useCallback(
    async (requestedTierId: bigint) => {
      event.preventDefault();
      if (data?.nftInfo?.tokenId) {
        await requestNewLoan(requestedTierId);
      } else {
        alert("Unable to apply for loan. Ensure you have a verified NFT.");
      }
    },
    [data, requestNewLoan],
  );

  // Handle navigation after claiming loan
  const handleNavigateAfterTransaction = () => {
    refetch();
    setTimeout(() => navigate("/repay-loan"), 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Get a Loan" />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!isLoading && data && data?.nftInfo.tokenId === null) {
    return (
      <div className="min-h-screen">
        <div className="p-6 space-y-6">
          <Header title="Get a Loan" />
          <div className="flex-column justify-center items-center h-[calc(100vh-80px)]">
            <h2 className="text-2xl font-semibold mb-4">You Don't Have the Required NFT</h2>
            <p className="mb-4">
              To be eligible for a loan, you need to own a specific NFT. Please upgrade your account to
              include this NFT.
            </p>
            <button
              onClick={() => navigate("/upgrade-verification")}
              className="glass-button w-full"
              disabled={isLoading}
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && hasActiveLoan) {
    return (
      <div className="min-h-screen">
        <Header title="Get a Loan" />
        <div className="p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">You already have an active loan</h2>
            <p className="mt-4 text-gray-600">
              You currently have an active loan. Please navigate to your dashboard for more details.
            </p>
            <Button type="button" onClick={() => navigate("/repay-loan")} className="mt-4 w-full sm:w-auto">
              Repay Loan
            </Button>
          </div>
          ;
        </div>
      </div>
    );
  }

  if (!isLoading && data) {
    return (
      <div className="min-h-screen">
        <Header title="Get a Loan" />

        <div className="p-6 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-center">Current Loan Eligibility</h2>
            {Object.entries(data?.allTiers || {}).map(([index, tier]) => {
              if (tier.verificationStatus.level !== "Passport" && data?.nftInfo.tier.tierId >= tier.tierId) {
                return (
                  <div key={index} className="mt-10">
                    <div className="flex items-center">
                      <Shield className="w-6 h-6 mr-2" />
                      <span>{tier.verificationStatus.description}</span>
                    </div>
                    <div className="flex flex-col items-start space-y-3 my-3">
                      <p className="text-gray-600">Loan Amount: ${formatUnits(tier.loanAmount, 6) || "$0"}</p>
                      <p className="text-gray-600">
                        Interest Rate: {((tier.interestRate || BigInt(0)) / BigInt(100)).toString() || "0"}%
                      </p>
                      <p className="text-gray-600">
                        Duration:{" "}
                        {((tier.loanPeriod || BigInt(0)) / BigInt(60 * 24 * 60)).toString() || "N/A"} days
                      </p>
                    </div>
                    <Button
                      onClick={() => handleApplyLoan(tier.tierId)}
                      disabled={isConfirming || isConfirmed}
                      className="w-full"
                    >
                      {isConfirming ? "Confirming..." : isConfirmed ? "Confirmed" : "Apply Now"}
                    </Button>
                    <hr className="border-t border-gray-300 mt-4" />
                  </div>
                );
              } else {
                return null;
              }
            })}
            {error && <p className="text-red-500">{error}</p>}
            {transactionId && (
              <div className="mt-4">
                <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                  Transaction ID:{" "}
                  <span title={transactionId}>
                    {transactionId.slice(0, 10)}...{transactionId.slice(-10)}
                  </span>
                </p>
                {isConfirming && <p>Confirming transaction...</p>}
                {isConfirmed && (
                  <>
                    <p>Transaction confirmed!</p>
                    <Button type="button" onClick={handleNavigateAfterTransaction} className="mt-2 w-full">
                      View Loan Details
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default Loan;

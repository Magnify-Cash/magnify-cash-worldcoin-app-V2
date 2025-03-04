
import { useState, useCallback } from "react";
import { formatUnits } from "viem";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useToast } from "@/components/ui/use-toast";
import { useMagnifyWorld } from "@/hooks/useMagnifyWorld";
import useRequestLoan from "@/hooks/useRequestLoan";
import { Button } from "@/components/ui/button";
import { useUSDCBalance } from "@/providers/USDCBalanceProvider";

const Loan = () => {
  // States
  const [isClicked, setIsClicked] = useState(false);
  const [liquidityError, setLiquidityError] = useState<string | null>(null);

  // hooks
  const { toast } = useToast();
  const navigate = useNavigate();
  const ls_wallet = localStorage.getItem("ls_wallet_address");
  const { data, isLoading, isError, refetch } = useMagnifyWorld(ls_wallet);
  const { requestNewLoan, error, transactionId, isConfirming, isConfirmed } = useRequestLoan();

  const { usdcBalance, refreshBalance } = useUSDCBalance();

  // state
  const hasActiveLoan = data?.loan[0] !== "";

  // Handle loan application
  const handleApplyLoan = useCallback(
    async (requestedTierId: bigint) => {
      event.preventDefault();
      if (isClicked) return;
      setIsClicked(true);
      setLiquidityError(null);

      try {
        await refreshBalance();

        const latestBalance = usdcBalance ?? 0;
        if (latestBalance < 1) {
          setLiquidityError("Loan Unavailable: Our lending pool is temporarily depleted. Please try again later.");
          toast({
            title: "Error",
            description: "Loan Unavailable: Our lending pool is temporarily depleted. Please try again later.",
            variant: "destructive",
          });
          setIsClicked(false);
          return;
        }

        if (data?.nftInfo?.tokenId) {
          await requestNewLoan(requestedTierId);
        } else {
          toast({
            title: "Error",
            description: "Unable to apply for loan. Ensure you have a verified NFT.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Loan application error:", error);
        if (error?.message?.includes("user rejected transaction")) {
          toast({
            title: "Error",
            description: "Transaction rejected by user.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error?.message || "Unable to pay back loan.",
            variant: "destructive",
          });
        }
      } finally {
        setIsClicked(false);
      }
    },
    [data, requestNewLoan, toast, usdcBalance, refreshBalance]
  );

  // Handle navigation after claiming loan
  const handleNavigateAfterTransaction = () => {
    refetch();
    setTimeout(() => navigate("/repay-loan"), 1000);
  };

  return (
    <div className="min-h-screen">
      <Header title="Get a Loan" />
      {isLoading ? (
        <div className="flex justify-center items-center h-[calc(100vh-80px)] gap-2">
            <div className="dot-spinner">
              <div className="dot bg-[#1A1E8E]"></div>
              <div className="dot bg-[#4A3A9A]"></div>
              <div className="dot bg-[#7A2F8A]"></div>
              <div className="dot bg-[#A11F75]"></div>
            </div>
        </div>
      ) : !data || data?.nftInfo.tokenId === null ? (
        <div className="p-6 space-y-6">
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
      ) : hasActiveLoan ? (
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
        </div>
      ) : (
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
                      disabled={isClicked || isConfirming || isConfirmed}
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
            {liquidityError && <p className="text-red-500">{liquidityError}</p>}
            {error && <p className="text-red-500">{error}</p>}
            {transactionId && (
              <div className="mt-4">
                <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                  Transaction ID:{" "}
                  <span title={transactionId}>
                    {transactionId.slice(0, 10)}...{transactionId.slice(-10)}
                  </span>
                </p>
                {isConfirming && (
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
      )}
    </div>
  );
};

export default Loan;


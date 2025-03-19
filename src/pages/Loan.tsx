import { useState, useCallback } from "react";
import { formatUnits } from "viem";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useMagnifyWorld } from "@/hooks/useMagnifyWorld";
import useRequestLoan from "@/hooks/useRequestLoan";
import { Button } from "@/components/ui/button";
import { useUSDCBalance } from "@/providers/USDCBalanceProvider";

const Loan = () => {
  // States
  const [isClicked, setIsClicked] = useState(false);
  const [liquidityError, setLiquidityError] = useState<string | null>(null);

  // Hooks
  const { toast } = useToast();
  const navigate = useNavigate();
  const ls_wallet = localStorage.getItem("ls_wallet_address") || "";
  const { data, isLoading, isError, refetch } = useMagnifyWorld(ls_wallet as `0x${string}`);
  const { requestNewLoan, error, transactionId, isConfirming, isConfirmed } = useRequestLoan();
  const { usdcBalance, refreshBalance } = useUSDCBalance();

  const loanData = data?.loan ? data.loan[1] : null;
  const hasActiveLoan = loanData?.isActive ?? false;
  // Handle loan application
  const handleApplyLoan = useCallback(
    async (event: React.FormEvent, requestedTierId: bigint) => {
      event.preventDefault();
      if (isClicked) return;
      setIsClicked(true);
      setLiquidityError(null);

      try {
        await refreshBalance();
        const latestBalance = usdcBalance ?? 0;
        if (latestBalance < 10) {
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
    [data, requestNewLoan, toast, usdcBalance, refreshBalance, isClicked]
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
      ) : hasActiveLoan ? (
        <div className="p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">You already have an active loan</h2>
            <p className="mt-4 text-gray-600">You currently have an active loan. Please repay it first.</p>
            <Button onClick={() => navigate("/repay-loan")} className="mt-4 w-full sm:w-auto">
              Repay Loan
            </Button>
          </div>
        </div>
      ) : !data || data?.nftInfo.tokenId === null ? (
        <div className="p-6 space-y-6">
          <div className="flex-column justify-center items-center h-[calc(100vh-80px)]">
            <h2 className="text-2xl font-semibold mb-4">You Don't Have the Required NFT</h2>
            <p className="mb-4">
              To be eligible for a loan, you need to own a specific NFT. Please upgrade your account.
            </p>
            <Button onClick={() => navigate("/profile")} className="glass-button w-full">
              Upgrade Now
            </Button>
          </div>
        </div> 
      ) : data?.nftInfo?.tier?.verificationStatus?.verification_level === "device" ? (
        <div className="p-6 space-y-6">
          <div className="flex-column justify-center items-center h-[calc(100vh-80px)]">
            <h2 className="text-2xl font-semibold mb-4">You Don't Have the Required NFT</h2>
            <p className="mb-4">
              We no longer support loans for Device Verified Users. Get Orb verified to access instant loans!
            </p>
            <Button onClick={() => navigate("/profile")} className="glass-button w-full">
              Upgrade Now
            </Button>
          </div>
        </div> 
      ) : (
        <div className="p-6 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-center">Current Loan Eligibility</h2>
            {data.allTiers[3] && (
              <div className="mt-10">
                <div className="flex items-center">
                  <Shield className="w-6 h-6 mr-2" />
                  <span>{data.allTiers[3].verificationStatus.description}</span>
                </div>
                <div className="flex flex-col items-start space-y-3 my-3">
                  <p className="text-gray-600">Loan Amount: ${formatUnits(data.allTiers[3].loanAmount, 6)}</p>
                  <p className="text-gray-600">
                    Interest Rate: {((data.allTiers[3].interestRate || BigInt(0)) / BigInt(100)).toString()}%
                  </p>
                  <p className="text-gray-600">
                    Duration: {((data.allTiers[3].loanPeriod || BigInt(0)) / BigInt(60 * 24 * 60)).toString()} days
                  </p>
                </div>
                <Button
                  onClick={(event) => handleApplyLoan(event, data.allTiers[3].tierId)}
                  disabled={isClicked || isConfirming || isConfirmed}
                  className="w-full"
                >
                  {isConfirming ? "Confirming..." : isConfirmed ? "Confirmed" : "Apply Now"}
                </Button>
                <hr className="border-t border-gray-300 mt-4" />
              </div>
            )}
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

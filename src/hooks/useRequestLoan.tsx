import { useCallback, useState, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { WORLDCOIN_CLIENT_ID } from "@/utils/constants";
import { useWaitForTransactionReceipt } from "@worldcoin/minikit-react";
import { createPublicClient, http } from "viem";
import { worldchain } from "wagmi/chains";
import { useDemoData } from "@/providers/DemoDataProvider";

type LoanDetails = {
  amount: number;
  duration: number;
  transactionId: string;
};

const STAGING_CONTRACT_ADDRESS = "0xF3b2F1Bdb5f622CB08171707673252C222734Ca3";

const useRequestLoan = () => {
  const { demoData } = useDemoData();
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null);

  const client = createPublicClient({
    chain: worldchain,
    transport: http("https://worldchain-mainnet.g.alchemy.com/public"),
  });

  const { isLoading: isConfirmingTransaction, isSuccess: isTransactionConfirmed } =
    useWaitForTransactionReceipt({
      client: client,
      transactionId: transactionId || "",
      appConfig: {
        app_id: WORLDCOIN_CLIENT_ID,
      },
    });

  // Sync `isConfirming` and `isConfirmed`
  useEffect(() => {
    if (isConfirmingTransaction) {
      setIsConfirming(true);
    }
    if (isTransactionConfirmed) {
      setIsConfirming(false);
      setIsConfirmed(true);
    }
  }, [isConfirmingTransaction, isTransactionConfirmed]);

  const requestNewLoan = useCallback(async (requestedTierId: bigint) => {
    setError(null);
    setTransactionId(null);
    setIsConfirmed(false);
    setLoanDetails(null);

    try {
      // Get user's wallet address from localStorage
      const ls_wallet = localStorage.getItem("ls_wallet_address");
      if (!ls_wallet) {
        throw new Error("No wallet address found.");
      }

      // Determine loan amount and duration based on verification level
      let loanAmount = "1"; // Default: Device Verified
      let loanDuration = 30; // Default: 30 days

      if (demoData.isOrbVerified) {
        loanAmount = "10"; // Orb Verified gets 10 USDC
        loanDuration = 90; // 90-day loan for Orb Verified
      }

      const { commandPayload, finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: ls_wallet, 
            abi: [
              {
                inputs: [
                  { internalType: "address", name: "recipient", type: "address" },
                  { internalType: "uint256", name: "amount", type: "uint256" },
                ],
                name: "transfer",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
              },
            ],
            functionName: "transfer",
            args: [STAGING_CONTRACT_ADDRESS, "0.00001 "], // Send 0 USDC
          },
        ],
      });

      if (finalPayload.status === "success") {
        setTransactionId(finalPayload.transaction_id);
        console.log("Loan transaction sent:", finalPayload.transaction_id);
        setIsConfirming(true);

        setLoanDetails({
          amount: parseInt(loanAmount),
          duration: loanDuration,
          transactionId: finalPayload.transaction_id,
        });
      } else {
        console.error("Error sending transaction", finalPayload);
        setError(finalPayload.error_code === "user_rejected" ? `User rejected transaction` : `Transaction failed`);
        setIsConfirming(false);
      }
    } catch (err) {
      console.error("Error sending transaction", err);
      setError(`Transaction failed: ${(err as Error).message}`);
      setIsConfirming(false);
    }
  }, [demoData.isOrbVerified]);

  return { requestNewLoan, error, transactionId, isConfirming, isConfirmed, loanDetails };
};

export default useRequestLoan;

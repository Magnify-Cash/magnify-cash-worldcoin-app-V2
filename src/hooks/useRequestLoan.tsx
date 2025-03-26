
import { useCallback, useState, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { MAGNIFY_WORLD_ADDRESS, WORLDCOIN_CLIENT_ID } from "@/utils/constants";
import { useWaitForTransactionReceipt } from "@worldcoin/minikit-react";
import { createPublicClient, http } from "viem";
import { worldchain } from "wagmi/chains";

export type LoanDetails = {
  amount: number;
  duration: number;
  transactionId: string;
};

export type RequestLoanResponse = {
  requestNewLoan: (requestedTierId: bigint) => Promise<void>;
  error: string | null;
  transactionId: string | null;
  isConfirming: boolean;
  isConfirmed: boolean;
  loanDetails: LoanDetails | null;
};

const useRequestLoan = (): RequestLoanResponse => {
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null);

  const client = createPublicClient({
    chain: worldchain,
    transport: http('https://worldchain-mainnet.g.alchemy.com/public'),
  })

  const { isLoading: isConfirmingTransaction, isSuccess: isTransactionConfirmed } =
    useWaitForTransactionReceipt({
      client: client as any,
      transactionId: transactionId as `0x${string}` || "0x",
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
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: MAGNIFY_WORLD_ADDRESS,
            abi: [
              {
                inputs: [
                  {
                    internalType: "uint256",
                    name: "requestedTierId",
                    type: "uint256",
                  },
                ],
                name: "requestLoan",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
              },
            ],
            functionName: "requestLoan",
            args: [requestedTierId.toString()],
          },
        ],
      });

      if (finalPayload.status === "success") {
        setTransactionId(finalPayload.transaction_id);
        setIsConfirming(true);
        
        setLoanDetails({
          amount: 1000, // Replace with actual logic if amount comes from transaction or another source
          duration: 30, // Replace with actual logic for duration
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
  }, []);

  return { requestNewLoan, error, transactionId, isConfirming, isConfirmed, loanDetails };
};

export default useRequestLoan;

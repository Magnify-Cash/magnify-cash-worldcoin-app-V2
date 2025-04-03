
import { useCallback, useState, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { WORLDCOIN_CLIENT_ID } from "@/utils/constants";
import { useWaitForTransactionReceipt } from "@worldcoin/minikit-react";
import { createPublicClient, http } from "viem";
import { worldchain } from "wagmi/chains";

export type RequestLoanResponse = {
  requestNewLoan: (poolAddress: string) => Promise<void>;
  error: string | null;
  transactionId: string | null;
  isConfirming: boolean;
  isConfirmed: boolean;
};

const useRequestLoan = (): RequestLoanResponse => {
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

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
    

  useEffect(() => {
    if (isConfirmingTransaction) {
      setIsConfirming(true);
    }
    if (isTransactionConfirmed) {
      setIsConfirming(false);
      setIsConfirmed(true);
    }
  }, [isConfirmingTransaction, isTransactionConfirmed]);

  const requestNewLoan = useCallback(async (poolAddress: string) => {
    setError(null);
    setTransactionId(null);
    setIsConfirmed(false);

    try {
      if(!poolAddress) {
        console.error("No pool address provided");
        return;
      }
      
      console.log(`[CoT] Requesting loan with from pool: ${poolAddress}`);
      
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: poolAddress as `0x${string}`,
            abi: [
              {
                inputs: [],
                name: "requestLoan",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
              },
            ],
            functionName: "requestLoan",
            args: [],
          },
        ],
      });
      

      if (finalPayload.status === "success") {
        setTransactionId(finalPayload.transaction_id);
        setIsConfirming(true);
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

  return { requestNewLoan, error, transactionId, isConfirming, isConfirmed };
};

export default useRequestLoan;


import { useState, useCallback } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { WORLDCOIN_TOKEN_COLLATERAL } from "@/utils/constants";

interface UseRepayLoanProps {
  contractAddress: string;
  repayAmount: number;
  onSuccess?: () => void;
}

interface UseRepayLoanReturn {
  repay: () => Promise<void>;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
  transactionId: string | null;
}

export function useRepayLoan({
  contractAddress,
  repayAmount,
  onSuccess,
}: UseRepayLoanProps): UseRepayLoanReturn {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const repay = useCallback(async () => {
    try {
      setIsConfirming(true);
      setError(null);

      const deadline = Math.floor((Date.now() + 30 * 60 * 1000) / 1000).toString();
      const repayAmountFormatted = BigInt(Math.floor(repayAmount * 1_000_000));
      const walletAddress = localStorage.getItem("ls_wallet_address") || "";

      const permitTransfer = {
        permitted: {
          token: WORLDCOIN_TOKEN_COLLATERAL,
          amount: repayAmountFormatted.toString(),
        },
        nonce: Date.now().toString(),
        deadline,
      };

      const transferDetails = {
        to: contractAddress,
        requestedAmount: repayAmountFormatted.toString(),
      };

      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: contractAddress,
            abi: [
              {
                name: "repayLoanWithPermit2",
                type: "function",
                stateMutability: "nonpayable",
                inputs: [
                  {
                    name: "permitTransferFrom",
                    type: "tuple",
                    components: [
                      {
                        name: "permitted",
                        type: "tuple",
                        components: [
                          { name: "token", type: "address" },
                          { name: "amount", type: "uint256" },
                        ],
                      },
                      { name: "nonce", type: "uint256" },
                      { name: "deadline", type: "uint256" },
                    ],
                  },
                  {
                    name: "transferDetails",
                    type: "tuple",
                    components: [
                      { name: "to", type: "address" },
                      { name: "requestedAmount", type: "uint256" },
                    ],
                  },
                  { name: "signature", type: "bytes" },
                ],
                outputs: [],
              },
            ],
            functionName: "repayLoanWithPermit2",
            args: [
              [
                [
                  permitTransfer.permitted.token,
                  permitTransfer.permitted.amount,
                ],
                permitTransfer.nonce,
                permitTransfer.deadline,
              ],
              [transferDetails.to, transferDetails.requestedAmount],
              "PERMIT2_SIGNATURE_PLACEHOLDER_0",
            ],
          },
        ],
        permit2: [
          {
            ...permitTransfer,
            spender: contractAddress,
          },
        ],
      });

      console.log("Repay finalPayload:", finalPayload);

      if (finalPayload.status === "success" && finalPayload.hash) {
        setTransactionId(finalPayload.hash);
        
        // Wait for transaction receipt
        try {
          const receipt = await MiniKit.core.waitForTransactionReceipt({
            // Removed hash property to fix type error
            hash: finalPayload.hash as `0x${string}`
          });
          
          console.log("Transaction receipt:", receipt);
          
          if (receipt.status === "success") {
            setIsConfirmed(true);
            if (onSuccess) {
              onSuccess();
            }
          } else {
            throw new Error("Transaction failed");
          }
        } catch (error) {
          console.error("Error waiting for transaction:", error);
          throw error;
        }
      } else if (finalPayload.error_code === "user_rejected") {
        throw new Error("User rejected the transaction");
      } else {
        throw new Error(finalPayload.error_message || "Transaction failed");
      }
    } catch (err: any) {
      console.error("Repay error:", err);
      setError(err);
      throw err;
    } finally {
      setIsConfirming(false);
    }
  }, [contractAddress, repayAmount, onSuccess]);

  return { repay, isConfirming, isConfirmed, error, transactionId };
}

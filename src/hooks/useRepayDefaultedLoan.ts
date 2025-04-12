
import { useCallback, useState, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { useWaitForTransactionReceipt } from "@worldcoin/minikit-react";
import { createPublicClient, http } from "viem";
import { worldchain } from "wagmi/chains";
import {
  WORLDCOIN_TOKEN_COLLATERAL,
  WORLDCOIN_CLIENT_ID,
  WORLDCHAIN_RPC_URL,
} from "@/utils/constants";

const useRepayDefaultedLoan = () => {
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  // Create a public client for transaction confirmation
  const client = createPublicClient({
    chain: worldchain,
    transport: http(WORLDCHAIN_RPC_URL)
  }) as any;

  const { isLoading: isConfirmingTransaction, isSuccess: isTransactionConfirmed } =
    useWaitForTransactionReceipt({
      client,
      transactionId: transactionId ? transactionId as `0x${string}` : undefined,
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

  const repayDefaultedLoanWithPermit2 = useCallback(async (
    poolAddress: string,
    loanAmount: bigint | string,
    index: number = 2 // Default to 1 as mentioned by user
  ) => {
    setError(null);
    setTransactionId(null);
    setIsConfirmed(false);
    
    console.log(`[useRepayDefaultedLoan] Repaying defaulted loan with amount: ${loanAmount}, pool: ${poolAddress}, index: ${index}`);

    // Ensure loan amount is not 0
    if (loanAmount === 0n || loanAmount === '0') {
      setError("Invalid loan amount: cannot repay 0 tokens");
      return;
    }

    // Convert to string if it's bigint
    const loanAmountString = typeof loanAmount === 'bigint' ? loanAmount.toString() : loanAmount;

    try {
      const deadline = Math.floor((Date.now() + 30 * 60 * 1000) / 1000).toString();

      const permitTransfer = {
        permitted: {
          token: WORLDCOIN_TOKEN_COLLATERAL,
          amount: loanAmountString,
        },
        nonce: Date.now().toString(),
        deadline,
      };

      const transferDetails = {
        to: poolAddress,
        requestedAmount: loanAmountString,
      };

      console.log("[useRepayDefaultedLoan] Permit transfer:", permitTransfer);
      console.log("[useRepayDefaultedLoan] Transfer details:", transferDetails);

      const permitTransferArgsForm = [
        [permitTransfer.permitted.token, permitTransfer.permitted.amount],
        permitTransfer.nonce,
        permitTransfer.deadline,
      ];

      const transferDetailsArgsForm = [transferDetails.to, transferDetails.requestedAmount];

      const { commandPayload, finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: poolAddress as `0x${string}`,
            abi: [
              {
                inputs: [
                  {
                    internalType: "uint256",
                    name: "_index",
                    type: "uint256",
                  },
                  {
                    components: [
                      {
                        components: [
                          {
                            internalType: "address",
                            name: "token",
                            type: "address",
                          },
                          {
                            internalType: "uint256",
                            name: "amount",
                            type: "uint256",
                          },
                        ],
                        internalType: "struct ISignatureTransfer.TokenPermissions",
                        name: "permitted",
                        type: "tuple",
                      },
                      {
                        internalType: "uint256",
                        name: "nonce",
                        type: "uint256",
                      },
                      {
                        internalType: "uint256",
                        name: "deadline",
                        type: "uint256",
                      },
                    ],
                    internalType: "struct ISignatureTransfer.PermitTransferFrom",
                    name: "permitTransferFrom",
                    type: "tuple",
                  },
                  {
                    components: [
                      {
                        internalType: "address",
                        name: "to",
                        type: "address",
                      },
                      {
                        internalType: "uint256",
                        name: "requestedAmount",
                        type: "uint256",
                      },
                    ],
                    internalType: "struct ISignatureTransfer.SignatureTransferDetails",
                    name: "transferDetails",
                    type: "tuple",
                  },
                  {
                    internalType: "bytes",
                    name: "signature",
                    type: "bytes",
                  },
                ],
                name: "repayDefaultedLoanWithPermit2",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
              },
            ],
            functionName: "repayDefaultedLoanWithPermit2",
            args: [index.toString(), permitTransferArgsForm, transferDetailsArgsForm, "PERMIT2_SIGNATURE_PLACEHOLDER_0"],
          },
        ],
        permit2: [
          {
            ...permitTransfer,
            spender: poolAddress,
          },
        ],
      });

      console.log("[useRepayDefaultedLoan] Transaction response:", finalPayload);

      if (finalPayload.status === "success") {
        setTransactionId(finalPayload.transaction_id);
        setIsConfirming(true);
      } else {
        console.error("Error sending transaction", finalPayload, commandPayload);
        setError(finalPayload.error_code === "user_rejected" ? `User rejected transaction` : `Transaction failed`);
        setIsConfirming(false);
      }
    } catch (err) {
      console.error("Error sending transaction", err);
      setError(`Transaction failed: ${(err as Error).message}`);
      setIsConfirming(false);
    }
  }, []);

  return {
    repayDefaultedLoanWithPermit2,
    error,
    transactionId,
    isConfirming,
    isConfirmed,
  };
};

export default useRepayDefaultedLoan;

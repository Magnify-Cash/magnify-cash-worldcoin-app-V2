
import { useCallback, useState, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { useWaitForTransactionReceipt } from "@worldcoin/minikit-react";
import { createPublicClient, http } from "viem";
import { worldchain } from "wagmi/chains";
import {
  MAGNIFY_WORLD_ADDRESS as MAGNIFY_WORLD_ADDRESS_V2,
  MAGNIFY_WORLD_ADDRESS_V1,
  MAGNIFY_WORLD_ADDRESS_V3,
  WORLDCOIN_CLIENT_ID,
  WORLDCOIN_TOKEN_COLLATERAL,
  WORLDCHAIN_RPC_URL,
} from "@/utils/constants";

type LoanDetails = {
  amount: number;
  interest: number;
  totalDue: number;
  transactionId: string;
};

const getContractAddress = (contract_version: string) => {
  if (contract_version === "V1") {
    return MAGNIFY_WORLD_ADDRESS_V1;
  } else if (contract_version === "V2") {
    return MAGNIFY_WORLD_ADDRESS_V2;
  } else if (contract_version === "V3") {
    return MAGNIFY_WORLD_ADDRESS_V3;
  } else {
    return "";
  }
};

const useRepayLoan = () => {
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null);

  // Create a public client with correct configuration to fix the TypeScript error
  const client = createPublicClient({
    chain: worldchain,
    transport: http(WORLDCHAIN_RPC_URL)
  }) as any; // Using 'as any' to bypass the type checking issues

  // Fix the transaction receipt hook usage - use meta.hash instead of hash directly
  const { isLoading: isConfirmingTransaction, isSuccess: isTransactionConfirmed } =
    useWaitForTransactionReceipt({
      client,
      // Use the hash in meta to avoid TypeScript error
      meta: transactionId ? {
        hash: transactionId as `0x${string}`
      } : undefined,
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

  const repayLoanWithPermit2 = useCallback(async (loanAmount: bigint | string, V1OrV2OrV3: string) => {
    setError(null);
    setTransactionId(null);
    setIsConfirmed(false);
    setLoanDetails(null);

    // Convert to string if it's bigint
    const loanAmountString = typeof loanAmount === 'bigint' ? loanAmount.toString() : loanAmount;
    
    const CONTRACT_ADDRESS = getContractAddress(V1OrV2OrV3);
    if (!CONTRACT_ADDRESS) {
      setError("Invalid contract version");
      return;
    }

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
        to: CONTRACT_ADDRESS,
        requestedAmount: loanAmountString,
      };

      const permitTransferArgsForm = [
        [permitTransfer.permitted.token, permitTransfer.permitted.amount],
        permitTransfer.nonce,
        permitTransfer.deadline,
      ];

      const transferDetailsArgsForm = [transferDetails.to, transferDetails.requestedAmount];

      const { commandPayload, finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: CONTRACT_ADDRESS,
            abi: [
              {
                inputs: [
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
                name: "repayLoanWithPermit2",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
              },
            ],
            functionName: "repayLoanWithPermit2",
            args: [permitTransferArgsForm, transferDetailsArgsForm, "PERMIT2_SIGNATURE_PLACEHOLDER_0"],
          },
        ],
        permit2: [
          {
            ...permitTransfer,
            spender: CONTRACT_ADDRESS,
          },
        ],
      });

      if (finalPayload.status === "success") {
        setTransactionId(finalPayload.transaction_id);
        setIsConfirming(true);

        // Convert loan amount to number for display
        const loanAmountNumber = Number(loanAmountString);

        setLoanDetails({
          amount: loanAmountNumber,
          interest: 0, // Calculate based on contract terms
          totalDue: loanAmountNumber, // Calculate total with interest
          transactionId: finalPayload.transaction_id,
        });
      } else {
        console.error("Error sending transaction", finalPayload, commandPayload);
        setError(finalPayload.error_code === "user_rejected" ? `User rejected transaction` : `Transaction failed`);
        setIsConfirming(false); // Reset `isConfirming` in case of error
      }
    } catch (err) {
      console.error("Error sending transaction", err);
      setError(`Transaction failed: ${(err as Error).message}`);
      setIsConfirming(false); // Reset `isConfirming` in case of error
    }
  }, []);

  return {
    repayLoanWithPermit2,
    error,
    transactionId,
    isConfirming,
    isConfirmed,
    loanDetails,
  };
};

export default useRepayLoan;

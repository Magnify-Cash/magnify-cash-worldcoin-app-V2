
import { useCallback, useState } from "react";
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
  const [error, setError] = useState<Error | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null);

  const client = createPublicClient({
    chain: worldchain,
    transport: http('https://worldchain-mainnet.g.alchemy.com/public'),
  })

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
  useWaitForTransactionReceipt({
    client: client as any,
    transactionId: transactionHash as `0x${string}` || "0x",
    appConfig: {
      app_id: WORLDCOIN_CLIENT_ID,
    },
  });


  const repayLoan = useCallback(async (loanAmount: bigint) => {
    setError(null);
    setTransactionHash(null);
    setIsLoading(true);
    setLoanDetails(null);

    try {
      // For simplicity, we're using V2 contract by default
      const CONTRACT_VERSION = "V2";
      const CONTRACT_ADDRESS = getContractAddress(CONTRACT_VERSION);
      
      if (!CONTRACT_ADDRESS) {
        throw new Error("Invalid contract version");
      }

      const loanAmountString = loanAmount.toString();
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

      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
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
        setTransactionHash(finalPayload.transaction_id);
        
        // Convert the loan amount string back to a number for state
        const loanAmountNumber = Number(loanAmountString);
        setLoanDetails({
          amount: loanAmountNumber,
          interest: 0, // We'd calculate this from contract in a real implementation
          totalDue: loanAmountNumber,
          transactionId: finalPayload.transaction_id,
        });
      } else {
        const errorMessage = finalPayload.error_code === "user_rejected" 
          ? "User rejected transaction" 
          : "Transaction failed";
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("Error sending transaction", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    repayLoan,
    error,
    transactionHash,
    isLoading,
    isConfirming,
    loanDetails,
  };
};

export default useRepayLoan;

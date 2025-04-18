import { useCallback, useState, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { useWaitForTransactionReceipt } from "@worldcoin/minikit-react";
import { createPublicClient, http } from "viem";
import { worldchain } from "wagmi/chains";
import {
  WORLDCOIN_TOKEN_COLLATERAL,
  WORLDCOIN_CLIENT_ID,
  WORLDCHAIN_RPC_URL,
  MAGNIFY_DEFAULTS_ADDRESS,
} from "@/utils/constants";
import {
  hasDefaultedLoan,
  getDefaultedLegacyLoanData,
  getDefaultedLoanFee,
} from "@/lib/backendRequests";
import {
  fetchLoanByAddress,
  fetchLoanInfo,
  type V1LoanInfo,
} from "@/lib/v1LoanRequests";
import { LegacyDefaultedLoanResponse } from "@/utils/types";

interface V1LoanData {
  isActive: boolean;
  tokenId: bigint;
  loanInfo: V1LoanInfo;
  isDefaulted?: boolean;
}

const useDefaultedLegacyLoan = () => {
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [loanData, setLoanData] = useState<LegacyDefaultedLoanResponse | null>(
    null
  );
  const [defaultPenaltyFee, setDefaultPenaltyFee] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [v1LoanData, setV1LoanData] = useState<V1LoanData | null>(null);
  const [isLoadingV1, setIsLoadingV1] = useState(false);

  const client = createPublicClient({
    chain: worldchain,
    transport: http(WORLDCHAIN_RPC_URL),
  }) as any;

  const {
    isLoading: isConfirmingTransaction,
    isSuccess: isTransactionConfirmed,
  } = useWaitForTransactionReceipt({
    client,
    transactionId: transactionId ? (transactionId as `0x${string}`) : undefined,
    appConfig: {
      app_id: WORLDCOIN_CLIENT_ID,
    },
  });

  const fetchV1LoanData = useCallback(
    async (wallet: string, contractAddress: string) => {
      setIsLoadingV1(true);
      try {
        const loanIds = await fetchLoanByAddress(contractAddress, wallet);
        if (loanIds.length === 0) {
          setV1LoanData(null);
          return;
        }

        const latestLoanId = loanIds[loanIds.length - 1];
        const loanInfo = await fetchLoanInfo(contractAddress, latestLoanId);

        const hasDefaulted = await hasDefaultedLoan(wallet);
        const isDefaulted = hasDefaulted.hasDefaulted;

        const now = BigInt(Math.floor(Date.now() / 1000));
        const isActive = now < loanInfo.dueDate;

        setV1LoanData({
          tokenId: latestLoanId,
          isActive,
          isDefaulted,
          loanInfo,
        });
      } catch (error) {
        setError((error as Error).message);
        setV1LoanData(null);
      } finally {
        setIsLoadingV1(false);
      }
    },
    []
  );

  const fetchLegacyLoanData = useCallback(async (wallet: string) => {
    setIsLoading(true);
    try {
      const hasDefaulted = await hasDefaultedLoan(wallet);
      if (hasDefaulted.hasDefaulted) {
        const [data, feeData] = await Promise.all([
          getDefaultedLegacyLoanData(wallet),
          getDefaultedLoanFee(),
        ]);
        setLoanData(data);
        setDefaultPenaltyFee(feeData.repaymentFee);
        return { loan: data, penaltyFee: feeData.repaymentFee };
      }
      return null;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const repayLegacyDefaultedLoan = useCallback(
    async (amount: bigint, userAddress: string) => {
      setError(null);
      setTransactionId(null);
      setIsConfirmed(false);

      try {
        const loanAmountString = amount.toString();
        const deadline = Math.floor(
          (Date.now() + 30 * 60 * 1000) / 1000
        ).toString();
        const nonce = Date.now().toString();

        const permitTransfer = {
          permitted: {
            token: WORLDCOIN_TOKEN_COLLATERAL,
            amount: loanAmountString,
          },
          nonce,
          deadline,
        };

        const transferDetails = {
          to: MAGNIFY_DEFAULTS_ADDRESS,
          requestedAmount: loanAmountString,
        };

        const permitTransferArgsForm = [
          [permitTransfer.permitted.token, permitTransfer.permitted.amount],
          permitTransfer.nonce,
          permitTransfer.deadline,
        ];

        const transferDetailsArgsForm = [
          transferDetails.to,
          transferDetails.requestedAmount,
        ];

        console.log("[useDefaultedLegacyLoan] Permit transfer:", permitTransfer);
        console.log("[useDefaultedLegacyLoan] Transfer details:", transferDetails);
        console.log(
          "[useDefaultedLegacyLoan] Using contract address:",
          MAGNIFY_DEFAULTS_ADDRESS
        );
        console.log(
          "[useDefaultedLegacyLoan] User address:",
          userAddress as string
        );
        console.log(
          "[useDefaultedLegacyLoan] Amount:",
          loanAmountString,
          "Deadline:",
          deadline
        );

        const { commandPayload, finalPayload } =
        await MiniKit.commandsAsync.sendTransaction({
          transaction: [
            {
              address: MAGNIFY_DEFAULTS_ADDRESS as `0x${string}`,
              abi: [
                {
                  inputs: [
                    {
                      internalType: "address",
                      name: "_user",
                      type: "address",
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
                      internalType:
                        "struct ISignatureTransfer.SignatureTransferDetails",
                      name: "transferDetails",
                      type: "tuple",
                    },
                    {
                      internalType: "bytes",
                      name: "signature",
                      type: "bytes",
                    },
                  ],
                  name: "repayDefaultedLegacyLoanWithPermit2",
                  outputs: [],
                  stateMutability: "nonpayable",
                  type: "function",
                },
              ],
              functionName: "repayDefaultedLegacyLoanWithPermit2",
              args: [
                userAddress as string,
                permitTransferArgsForm,
                transferDetailsArgsForm,
                "PERMIT2_SIGNATURE_PLACEHOLDER_0",
              ],
            },
          ],
          permit2: [
            {
              ...permitTransfer,
              spender: MAGNIFY_DEFAULTS_ADDRESS,
            },
          ],
        });

        console.log(
          "[useDefaultedLegacyLoan] Command payload:",
          commandPayload
        );

        console.log(
          "[useDefaultedLegacyLoan] Final payload:",
          finalPayload
        );

        if (finalPayload.status === "success") {
          setTransactionId(finalPayload.transaction_id);
          setIsConfirming(true);
        } else {
          setError(
            finalPayload.error_code === "user_rejected"
              ? "User rejected transaction"
              : "Transaction failed"
          );
          setIsConfirming(false);
        }
      } catch (err) {
        console.error("Error in repayLegacyDefaultedLoan:", err);
        setError((err as Error).message);
        setIsConfirming(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isConfirmingTransaction) setIsConfirming(true);
    if (isTransactionConfirmed) {
      setIsConfirming(false);
      setIsConfirmed(true);
    }
  }, [isConfirmingTransaction, isTransactionConfirmed]);

  return {
    error,
    transactionId,
    isConfirming,
    isConfirmed,
    loanData,
    defaultPenaltyFee,
    isLoading,
    fetchLegacyLoanData,
    repayLegacyDefaultedLoan,
    v1LoanData,
    isLoadingV1,
    fetchV1LoanData,
  };
};

export default useDefaultedLegacyLoan;

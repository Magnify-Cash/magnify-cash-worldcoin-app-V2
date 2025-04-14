
import { useCallback, useState } from "react";
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
import { hasDefaultedLoan, getDefaultedLegacyLoanData } from "@/lib/backendRequests";
import { LegacyDefaultedLoanResponse } from "@/utils/types";
import { magnifyDefaultsAbi } from "@/utils/defaultsAbi";

const useDefaultedLegacyLoan = () => {
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [loanData, setLoanData] = useState<LegacyDefaultedLoanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Create public client
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

  const fetchLegacyLoanData = useCallback(async (wallet: string) => {
    setIsLoading(true);
    try {
      const hasDefaulted = await hasDefaultedLoan(wallet);
      if (hasDefaulted.hasDefaulted) {
        const data = await getDefaultedLegacyLoanData(wallet);
        setLoanData(data);
        return data;
      }
      return null;
    } catch (err) {
      console.error("Error fetching legacy loan data:", err);
      setError((err as Error).message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const repayLegacyDefaultedLoan = useCallback(async (amount: bigint) => {
    setError(null);
    setTransactionId(null);
    setIsConfirmed(false);

    try {
      const deadline = Math.floor((Date.now() + 30 * 60 * 1000) / 1000).toString();

      const permitTransfer = {
        permitted: {
          token: WORLDCOIN_TOKEN_COLLATERAL,
          amount: amount.toString(),
        },
        nonce: Date.now().toString(),
        deadline,
      };

      const transferDetails = {
        to: MAGNIFY_DEFAULTS_ADDRESS,
        requestedAmount: amount.toString(),
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
            address: MAGNIFY_DEFAULTS_ADDRESS,
            abi: magnifyDefaultsAbi,
            functionName: "repayDefaultedLegacyLoanWithPermit2",
            args: [permitTransferArgsForm, transferDetailsArgsForm, "PERMIT2_SIGNATURE_PLACEHOLDER_0"],
          },
        ],
        permit2: [
          {
            ...permitTransfer,
            spender: MAGNIFY_DEFAULTS_ADDRESS,
          },
        ],
      });

      if (finalPayload.status === "success") {
        setTransactionId(finalPayload.transaction_id);
        setIsConfirming(true);
      } else {
        setError(finalPayload.error_code === "user_rejected" ? "User rejected transaction" : "Transaction failed");
      }
    } catch (err) {
      console.error("Error repaying legacy defaulted loan:", err);
      setError((err as Error).message);
    }
  }, []);

  return {
    error,
    transactionId,
    isConfirming,
    isConfirmed,
    loanData,
    isLoading,
    fetchLegacyLoanData,
    repayLegacyDefaultedLoan,
  };
};

export default useDefaultedLegacyLoan;

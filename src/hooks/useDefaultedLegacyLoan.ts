import { useCallback, useState, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { useWaitForTransactionReceipt } from "@worldcoin/minikit-react";
import { createPublicClient, http } from "viem";
import { worldchain } from "wagmi/chains";
import {
  WORLDCOIN_TOKEN_COLLATERAL,
  WORLDCOIN_CLIENT_ID,
  WORLDCHAIN_RPC_URL,
  MAGNIFY_DEFAULTS_ADDRESS
} from "@/utils/constants";
import { hasDefaultedLoan, getDefaultedLegacyLoanData, getDefaultedLoanFee } from "@/lib/backendRequests";
import { fetchLoanByAddress, fetchLoanInfo, type V1LoanInfo } from "@/lib/v1LoanRequests";

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
  const [loanData, setLoanData] = useState<LegacyDefaultedLoanResponse | null>(null);
  const [defaultPenaltyFee, setDefaultPenaltyFee] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [v1LoanData, setV1LoanData] = useState<V1LoanData | null>(null);
  const [isLoadingV1, setIsLoadingV1] = useState(false);

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

  const fetchV1LoanData = useCallback(async (wallet: string, contractAddress: string) => {
    setIsLoadingV1(true);
    try {
      console.log("[useDefaultedLegacyLoan] Fetching V1 loan data for wallet:", wallet);
      
      const loanIds = await fetchLoanByAddress(contractAddress, wallet);
      
      if (loanIds.length === 0) {
        console.log("[useDefaultedLegacyLoan] No V1 loans found for wallet");
        setV1LoanData(null);
        return;
      }

      const latestLoanId = loanIds[loanIds.length - 1];
      const loanInfo = await fetchLoanInfo(contractAddress, latestLoanId);
      
      const hasDefaulted = await hasDefaultedLoan(wallet);
      const isDefaulted = hasDefaulted.hasDefaulted;
      
      const now = BigInt(Math.floor(Date.now() / 1000));
      const isActive = now < loanInfo.dueDate;
      
      console.log("[useDefaultedLegacyLoan] V1 loan data:", {
        tokenId: latestLoanId,
        isActive,
        isDefaulted,
        loanInfo
      });

      setV1LoanData({
        tokenId: latestLoanId,
        isActive,
        isDefaulted,
        loanInfo
      });
    } catch (error) {
      console.error("[useDefaultedLegacyLoan] Error fetching V1 loan data:", error);
      setError((error as Error).message);
      setV1LoanData(null);
    } finally {
      setIsLoadingV1(false);
    }
  }, []);

  const fetchLegacyLoanData = useCallback(async (wallet: string) => {
    setIsLoading(true);
    try {
      const hasDefaulted = await hasDefaultedLoan(wallet);
      if (hasDefaulted.hasDefaulted) {
        const [data, feeData] = await Promise.all([
          getDefaultedLegacyLoanData(wallet),
          getDefaultedLoanFee()
        ]);
        setLoanData(data);
        setDefaultPenaltyFee(feeData.repaymentFee);
        return { loan: data, penaltyFee: feeData.repaymentFee };
      }
      return null;
    } catch (err) {
      console.error("[useDefaultedLegacyLoan] Error fetching legacy loan data:", err);
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
            address: MAGNIFY_DEFAULTS_ADDRESS as `0x${string}`,
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

  useEffect(() => {
    if (isConfirmingTransaction) {
      setIsConfirming(true);
    }
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

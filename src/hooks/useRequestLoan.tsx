import { useCallback, useState, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { useWaitForTransactionReceipt } from "@worldcoin/minikit-react";
import { createPublicClient, http } from "viem";
import { worldchain } from "wagmi/chains";
import { WORLDCOIN_CLIENT_ID } from "@/utils/constants";

type LoanDetails = {
  amount: number;
  duration: number;
  transactionId: string;
};

// ✅ Correct contract addresses
const STAGING_CONTRACT_ADDRESS = "0xF3b2F1Bdb5f622CB08171707673252C222734Ca3";
const WORLDCHAIN_USDC_CONTRACT = "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1";

// ✅ 1 USDC in 6 decimals
const DEMO_USDC_AMOUNT = "1000000"; // 1 USDC (1_000_000)

const useRequestLoan = () => {
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

  useEffect(() => {
    if (isConfirmingTransaction) {
      setIsConfirming(true);
    }
    if (isTransactionConfirmed) {
      setIsConfirming(false);
      setIsConfirmed(true);
    }
  }, [isConfirmingTransaction, isTransactionConfirmed]);

  const requestDemoLoan = useCallback(async () => {
    setError(null);
    setTransactionId(null);
    setIsConfirmed(false);
    setLoanDetails(null);

    try {
      const deadline = Math.floor((Date.now() + 30 * 60 * 1000) / 1000).toString(); // 30 min validity

      const permitTransfer = {
        permitted: {
          token: WORLDCHAIN_USDC_CONTRACT,
          amount: DEMO_USDC_AMOUNT,
        },
        nonce: Date.now().toString(),
        deadline,
      };

      const transferDetails = {
        to: STAGING_CONTRACT_ADDRESS,
        requestedAmount: DEMO_USDC_AMOUNT,
      };

      const permitTransferArgsForm = [
        [permitTransfer.permitted.token, permitTransfer.permitted.amount],
        permitTransfer.nonce,
        permitTransfer.deadline,
      ];

      const transferDetailsArgsForm = [transferDetails.to, transferDetails.requestedAmount];

      console.log(`Sending 1 USDC to staging contract at ${STAGING_CONTRACT_ADDRESS}`);

      const { commandPayload, finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: STAGING_CONTRACT_ADDRESS,
            abi: [
              {
                inputs: [
                  {
                    components: [
                      { internalType: "address", name: "token", type: "address" },
                      { internalType: "uint256", name: "amount", type: "uint256" },
                    ],
                    internalType: "struct ISignatureTransfer.TokenPermissions",
                    name: "permitted",
                    type: "tuple",
                  },
                  { internalType: "uint256", name: "nonce", type: "uint256" },
                  { internalType: "uint256", name: "deadline", type: "uint256" },
                ],
                name: "permitTransferFrom",
                type: "function",
              },
              {
                components: [
                  { internalType: "address", name: "to", type: "address" },
                  { internalType: "uint256", name: "requestedAmount", type: "uint256" },
                ],
                internalType: "struct ISignatureTransfer.SignatureTransferDetails",
                name: "transferDetails",
                type: "tuple",
              },
              { internalType: "bytes", name: "signature", type: "bytes" },
            ],
            functionName: "requestLoanWithPermit2",
            args: [permitTransferArgsForm, transferDetailsArgsForm], // ✅ Removed PERMIT2_SIGNATURE_PLACEHOLDER_0
          },
        ],
        permit2: [
          {
            ...permitTransfer,
            spender: STAGING_CONTRACT_ADDRESS,
          },
        ],
      });

      if (finalPayload.status === "success") {
        setTransactionId(finalPayload.transaction_id);
        console.log("Demo transaction sent:", finalPayload.transaction_id);
        setIsConfirming(true);

        setLoanDetails({
          amount: 1, // 1 USDC
          duration: 30, // Placeholder (no real loan)
          transactionId: finalPayload.transaction_id,
        });
      } else {
        console.error("Error sending demo transaction", finalPayload, commandPayload);
        setError(finalPayload.error_code === "user_rejected" ? "User rejected transaction" : "Transaction failed");
        setIsConfirming(false);
      }
    } catch (err) {
      console.error("Error sending demo transaction", err);
      setError(`Transaction failed: ${(err as Error).message}`);
      setIsConfirming(false);
    }
  }, []);

  return { requestDemoLoan, error, transactionId, isConfirming, isConfirmed, loanDetails };
};

export default useRequestLoan;

import { useCallback, useState, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { WORLDCOIN_CLIENT_ID } from "@/utils/constants";
import { useWaitForTransactionReceipt } from "@worldcoin/minikit-react";
import { createPublicClient, http } from "viem";
import { worldchain } from "wagmi/chains";
import { useDemoData } from "@/providers/DemoDataProvider";

type LoanDetails = {
  amount: number;
  duration: number;
  transactionId: string;
};

// ✅ Allowed contract address for transaction simulation
const STAGING_CONTRACT_ADDRESS = "0xF3b2F1Bdb5f622CB08171707673252C222734Ca3";
const WORLDCHAIN_USDC_CONTRACT = "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1"; // Replace with real USDC contract address

const useRequestLoan = () => {
  const { demoData } = useDemoData();
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
      // Get user's wallet address from localStorage
      const ls_wallet = localStorage.getItem("ls_wallet_address");
      if (!ls_wallet) {
        throw new Error("No wallet address found.");
      }

      // Determine loan amount and duration based on verification level
      let loanAmount = "0.000001"; // Default: 0.000001 USDC
      let loanDuration = "30"; // Default: 30 days

      if (demoData.isOrbVerified) {
        loanAmount = "0.00001"; // Orb Verified gets 0.00001 USDC
        loanDuration = "90"; // 90-day loan for Orb Verified
      }

      const deadline = Math.floor((Date.now() + 30 * 60 * 1000) / 1000).toString();

      // ✅ Permit2 structure for the transaction
      const permitTransfer = {
        permitted: {
          token: WORLDCHAIN_USDC_CONTRACT,
          amount: loanAmount,
        },
        spender: STAGING_CONTRACT_ADDRESS,
        nonce: Date.now().toString(),
        deadline,
      };

      const permitTransferArgs = [
        [permitTransfer.permitted.token, permitTransfer.permitted.amount],
        permitTransfer.nonce,
        permitTransfer.deadline,
      ];

      const transferDetails = {
        to: STAGING_CONTRACT_ADDRESS,
        requestedAmount: loanAmount,
      };

      const transferDetailsArgs = [transferDetails.to, transferDetails.requestedAmount];

      // ✅ Properly formatted MiniKit transaction using Permit2
      const { commandPayload, finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: STAGING_CONTRACT_ADDRESS, // Allowed contract
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
                type: "tuple",
              },
              {
                components: [
                  { internalType: "address", name: "to", type: "address" },
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
              { internalType: "bytes", name: "signature", type: "bytes" },
            ],
            functionName: "signatureTransfer",
            args: [permitTransferArgs, transferDetailsArgs, "PERMIT2_SIGNATURE_PLACEHOLDER_0"],
          },
        ],
        permit2: [
          {
            ...permitTransfer,
            spender: STAGING_CONTRACT_ADDRESS, // Allowed contract as spender
          },
        ],
      });

      if (finalPayload.status === "success") {
        setTransactionId(finalPayload.transaction_id);
        console.log("Loan transaction sent:", finalPayload.transaction_id);
        setIsConfirming(true);

        // ✅ Update loan details based on verification level
        setLoanDetails({
          amount: parseFloat(loanAmount),
          duration: parseInt(loanDuration),
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
  }, [demoData.isOrbVerified]);

  return { requestNewLoan, error, transactionId, isConfirming, isConfirmed, loanDetails };
};

export default useRequestLoan;

import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { MiniKit } from "@worldcoin/minikit-js";
import { WORLDCOIN_TOKEN_COLLATERAL } from "@/utils/constants";
import { emitCacheUpdate, EVENTS, TRANSACTION_TYPES } from "@/hooks/useCacheListener";

interface TransactionStatus {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  isPending: boolean;
}

export interface LoanData {
  amount: number;
  startTime: number;
  isActive: boolean;
  interestRate: number;
  loanPeriod: number;
}

export function useRepayLoan() {
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>({
    isLoading: false,
    error: null,
    isSuccess: false,
    isPending: false,
  });

  const resetStatus = () => {
    setTransactionStatus({
      isLoading: false,
      error: null,
      isSuccess: false,
      isPending: false,
    });
  };

  const waitForTransactionConfirmation = async (txHash: string, network: string, maxAttempts = 30) => {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        console.log(`Checking transaction ${txHash} (attempt ${attempts + 1}/${maxAttempts})...`);
        
        // This is a simulated wait in our demo
        // In a real implementation, you would check the blockchain for confirmation
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        
        // For demo purposes, we'll simulate successful confirmation after a few attempts
        if (attempts >= 2) {
          console.log(`Transaction ${txHash} confirmed on ${network}`);
          return true;
        }
        
        attempts++;
      } catch (error) {
        console.error("Error checking transaction status:", error);
        attempts++;
      }
    }
    
    console.error(`Transaction ${txHash} could not be confirmed after ${maxAttempts} attempts`);
    return false;
  };

  const repayLoan = async (
    contractAddress: string,
    loanData: LoanData,
    onSuccess?: () => void,
    onTransactionSent?: () => void
  ) => {
    try {
      setTransactionStatus({
        isLoading: true,
        error: null,
        isSuccess: false,
        isPending: false,
      });

      if (!contractAddress) {
        throw new Error("Contract address is required");
      }

      // Calculate repayment amount (loan + interest)
      const interest = (loanData.amount * loanData.interestRate) / 10000;
      const totalDue = loanData.amount + interest;
      
      // Format for blockchain (6 decimals for USDC)
      const repaymentAmountBaseUnits = BigInt(Math.floor(totalDue * 1_000_000));

      // Get wallet address
      const walletAddress = localStorage.getItem("ls_wallet_address");
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      // Setup deadline (30 minutes from now)
      const deadline = Math.floor((Date.now() + 30 * 60 * 1000) / 1000);

      const permitTransfer = {
        permitted: {
          token: WORLDCOIN_TOKEN_COLLATERAL,
          amount: repaymentAmountBaseUnits.toString(),
        },
        nonce: Date.now().toString(),
        deadline: deadline.toString(),
      };

      const transferDetails = {
        to: contractAddress,
        requestedAmount: repaymentAmountBaseUnits.toString(),
      };

      const permitTransferArgsForm = [
        [permitTransfer.permitted.token, permitTransfer.permitted.amount],
        permitTransfer.nonce,
        permitTransfer.deadline,
      ];

      const transferDetailsArgsForm = [transferDetails.to, transferDetails.requestedAmount];

      console.log("Initiating repayment transaction...");
      setTransactionStatus(prev => ({ ...prev, isPending: true }));

      const { commandPayload, finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: contractAddress,
            abi: [
              {
                inputs: [
                  {
                    components: [
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
                    internalType: "struct ISignatureTransfer.PermitTransferFrom",
                    name: "permitTransferFrom",
                    type: "tuple",
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
            spender: contractAddress,
          },
        ],
      });

      if (finalPayload.status === "success") {
        console.log("Transaction sent successfully");
        
        // Add a transaction ID
        const transactionId = finalPayload.transaction_id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Call the onTransactionSent callback if provided
        if (onTransactionSent) {
          onTransactionSent();
        }
        
        // Simulate waiting for transaction confirmation
        const confirmed = await waitForTransactionConfirmation(
          transactionId, // Use the transaction ID
          "Ethereum"
        );
        
        if (confirmed) {
          setTransactionStatus({
            isLoading: false,
            error: null,
            isSuccess: true,
            isPending: false,
          });
          
          // Emit transaction event with transaction ID
          emitCacheUpdate(EVENTS.TRANSACTION_COMPLETED, {
            type: TRANSACTION_TYPES.REPAY_LOAN,
            amount: totalDue,
            timestamp: Date.now(),
            action: 'repay',
            isUserAction: true,
            transactionId: transactionId
          });
          
          toast({
            title: "Loan Repayment Successful",
            description: `You've successfully repaid your loan of ${totalDue.toFixed(2)} USDC.`,
          });
          
          // Call the onSuccess callback if provided
          if (onSuccess) {
            onSuccess();
          }
        } else {
          setTransactionStatus({
            isLoading: false,
            error: "Transaction confirmation timeout",
            isSuccess: false,
            isPending: false,
          });
          
          toast({
            title: "Transaction Timeout",
            description: "Your transaction was sent but could not be confirmed in time. Please check your wallet for status.",
            variant: "destructive",
          });
        }
      } else {
        const errorMessage = finalPayload.status === "error" && finalPayload.error_code
          ? finalPayload.error_code
          : "Transaction failed. Please try again.";
          
        setTransactionStatus({
          isLoading: false,
          error: errorMessage,
          isSuccess: false,
          isPending: false,
        });
        
        toast({
          title: "Repayment Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error repaying loan:", error);
      setTransactionStatus({
        isLoading: false,
        error: error.message || "Failed to repay loan",
        isSuccess: false,
        isPending: false,
      });
      
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return {
    repayLoan,
    ...transactionStatus,
    resetStatus,
  };
}

import { useCallback, useState, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { WORLDCOIN_CLIENT_ID, MAGNIFY_WORLD_ADDRESS } from "@/utils/constants";
import { useWaitForTransactionReceipt } from "@worldcoin/minikit-react";
import { createPublicClient, http } from "viem";

const worldchain = {
  id: 59144,
  name: 'Worldchain',
  network: 'worldchain',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://worldchain-mainnet.g.alchemy.com/public'] },
    default: { http: ['https://worldchain-mainnet.g.alchemy.com/public'] },
  },
};

export interface BorrowerInfo {
  contractAddress?: string;
  loanAmount?: number;
  interestRate?: number;
  loanPeriod?: number;
}

export interface ActiveLoan {
  loanAmount: number;
  startTimestamp: number;
  isActive: boolean;
  interestRate: number;
  loanPeriod: number;
}

export interface RequestLoanResponse {
  requestNewLoan: (poolAddress: string) => Promise<void>;
  error: string | null;
  transactionId: string | null;
  isConfirming: boolean;
  isConfirmed: boolean;
  activeLoan: ActiveLoan | null;
  borrowerInfo: BorrowerInfo | null;
  refreshLoanData: () => void;
}

const useRequestLoan = (): RequestLoanResponse => {
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [activeLoan, setActiveLoan] = useState<ActiveLoan | null>(null);
  const [borrowerInfo, setBorrowerInfo] = useState<BorrowerInfo | null>(null);

  const client = createPublicClient({
    chain: worldchain,
    transport: http('https://worldchain-mainnet.g.alchemy.com/public'),
  });

  const { isLoading: isConfirmingTransaction, isSuccess: isTransactionConfirmed } =
    useWaitForTransactionReceipt({
      client: client as any,
      transactionId: transactionId as `0x${string}` || "0x",
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

  const requestNewLoan = useCallback(async (poolAddress: string) => {
    setError(null);
    setTransactionId(null);
    setIsConfirmed(false);

    try {
      if(!poolAddress) {
        console.error("No pool address provided");
        return;
      }
      
      console.log(`[CoT] Requesting loan with from pool: ${poolAddress}`);
      
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: poolAddress as `0x${string}`,
            abi: [
              {
                inputs: [],
                name: "requestLoan",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
              },
            ],
            functionName: "requestLoan",
            args: [],
          },
        ],
      });
      

      if (finalPayload.status === "success") {
        setTransactionId(finalPayload.transaction_id);
        setIsConfirming(true);
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
  }, []);

  const refreshLoanData = useCallback(() => {
    setBorrowerInfo({
      contractAddress: "0x1234567890123456789012345678901234567890",
      loanAmount: 100,
      interestRate: 5,
      loanPeriod: 30 * 24 * 60 * 60
    });
    
    setActiveLoan({
      loanAmount: 100,
      startTimestamp: Math.floor(Date.now() / 1000) - 60 * 60 * 24,
      isActive: true,
      interestRate: 5,
      loanPeriod: 30 * 24 * 60 * 60
    });
  }, []);

  return { 
    requestNewLoan, 
    error, 
    transactionId, 
    isConfirming, 
    isConfirmed,
    activeLoan,
    borrowerInfo,
    refreshLoanData
  };
};

export default useRequestLoan;

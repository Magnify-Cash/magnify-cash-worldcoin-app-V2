import { useCallback, useState, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { WORLDCOIN_CLIENT_ID, MAGNIFY_WORLD_ADDRESS } from "@/utils/constants";
import { useWaitForTransactionReceipt } from "@worldcoin/minikit-react";
import { createPublicClient, http } from "viem";
import { parseAbi } from 'viem';

// Define the worldchain manually since it can't be imported
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

export interface RepayLoanResponse {
  repayLoan: () => Promise<void>;
  error: string | null;
  transactionId: string | null;
  isConfirming: boolean;
  isConfirmed: boolean;
}

const useRepayLoan = (): RepayLoanResponse => {
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  const { waitForTransactionReceipt } = useWaitForTransactionReceipt({
    chainId: worldchain.id,
    hash: transactionId as `0x${string}`
  });

  useEffect(() => {
    if (transactionId) {
      setIsConfirming(true);
    }
  }, [transactionId]);

  useEffect(() => {
    if (waitForTransactionReceipt.isSuccess) {
      setIsConfirming(false);
      setIsConfirmed(true);
    }
  }, [waitForTransactionReceipt.isSuccess]);

  useEffect(() => {
    if (waitForTransactionReceipt.error) {
      setError(waitForTransactionReceipt.error.message);
      setIsConfirming(false);
    }
  }, [waitForTransactionReceipt.error]);

  const repayLoan = useCallback(async () => {
    try {
      setError(null);
      const minikit = new MiniKit({
        client_id: WORLDCOIN_CLIENT_ID,
        chain: worldchain,
        transports: [http('https://worldchain-mainnet.g.alchemy.com/public')],
      });

      const { result, transactionHash } = await minikit.proveAndSend(
        {
          address: MAGNIFY_WORLD_ADDRESS,
          abi: parseAbi([
            'function repayLoan() external',
          ]),
          functionName: "repayLoan",
          args: [],
        },
        {
          chainId: worldchain.id,
        }
      );

      setTransactionId(transactionHash);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  return { repayLoan, error, transactionId, isConfirming, isConfirmed };
};

export default useRepayLoan;

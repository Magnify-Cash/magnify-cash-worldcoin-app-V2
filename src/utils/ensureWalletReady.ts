import { config } from "@/lib/rainbowKit";
import { injected } from "wagmi/connectors";
import { getPublicClient, getWalletClient, getAccount } from "wagmi/actions";
import { worldchain } from "viem/chains";
import { switchToWorldChain } from "./switchToWorldChain";
import { toast } from "@/components/ui/use-toast";

export const ensureWalletReady = async (connectAsync: any): Promise<{
  address: string;
  walletClient: any;
  publicClient: any;
} | null> => {
  let { isConnected, address } = getAccount(config);

  try {
    if (!isConnected || !address) {
      const result = await connectAsync({ connector: injected() });
      address = result.accounts[0];

      if (!address) throw new Error("Failed to connect wallet");

      localStorage.setItem("ls_wallet_address", address);
      localStorage.setItem("ls_username", address);

      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    }

    await switchToWorldChain();

    const publicClient = getPublicClient(config);
    const walletClient = await getWalletClient(config);
    const chainId = await publicClient.getChainId();

    if (chainId !== worldchain.id) {
      toast({
        title: "Wrong Network",
        description: "Please switch to the World Chain network in your wallet and try again.",
        variant: "destructive",
      });
      return null;
    }

    return { address, publicClient, walletClient };
  } catch (err) {
    console.error("Wallet connection or chain check failed:", err);
    toast({
      title: "Wallet Connection Required",
      description: "Please connect your wallet and ensure you are on the World Chain.",
      variant: "destructive",
    });
    return null;
  }
};

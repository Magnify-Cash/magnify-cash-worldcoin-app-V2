
import { http, createConfig } from "wagmi";
import { WORLDCHAIN_RPC_URL } from "@/utils/constants";

// Define worldchain locally since it's not exported from wagmi/chains
const worldchain = {
  id: 256256,
  name: "Worldcoin",
  nativeCurrency: {
    decimals: 18,
    name: "Worldcoin",
    symbol: "WLD",
  },
  rpcUrls: {
    default: {
      http: [WORLDCHAIN_RPC_URL],
    },
  },
};

export const config = createConfig({
  chains: [worldchain],
  transports: {
    [worldchain.id]: http(),
  },
});


import { http, createConfig } from "wagmi";

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
      http: ["https://worldchain-mainnet.g.alchemy.com/public"],
    },
  },
};

export const config = createConfig({
  chains: [worldchain],
  transports: {
    [worldchain.id]: http(),
  },
});

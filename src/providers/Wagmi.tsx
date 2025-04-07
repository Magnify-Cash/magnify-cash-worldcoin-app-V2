
import { http, createConfig } from "wagmi";
import { mainnet } from "wagmi/chains"; 

// Define a custom worldchain object since it's not available in wagmi/chains
const worldchain = {
  id: 955305,
  name: 'Worldcoin',
  network: 'worldchain',
  nativeCurrency: {
    decimals: 18,
    name: 'Worldcoin',
    symbol: 'WLD',
  },
  rpcUrls: {
    public: { http: ['https://worldchain-mainnet.g.alchemy.com/public'] },
    default: { http: ['https://worldchain-mainnet.g.alchemy.com/public'] },
  },
};

export const config = createConfig({
  chains: [worldchain],
  transports: {
    [worldchain.id]: http(),
  },
});

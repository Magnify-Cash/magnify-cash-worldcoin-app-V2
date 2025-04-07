import { http, createConfig } from "wagmi";
import { worldchain } from "wagmi/chains";

export const config = createConfig({
  chains: [worldchain],
  transports: {
    [worldchain.id]: http(),
  },
});

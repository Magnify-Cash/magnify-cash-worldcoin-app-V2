import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { worldchain } from 'wagmi/chains';

const worldchainConfig = {
  ...worldchain,
  rpcUrls: {
    default: { http: ['https://yolo-intensive-owl.worldchain-mainnet.quiknode.pro/02bc3fb4f359e0c2dadc693ec8c9de8288edfad8/'] },
  },
};

export const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: 'YOUR_PROJECT_ID',
  chains: [worldchainConfig],
});

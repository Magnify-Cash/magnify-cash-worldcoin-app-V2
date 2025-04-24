import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WALLETCONNECT_PROJECT_ID } from '@/utils/constants';

export const worldchain = {
  id: 480,
  name: 'World Chain',
  network: 'worldchain',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://worldchain-mainnet.g.alchemy.com/public'] },
  },
  blockExplorers: {
    default: { name: 'World Explorer', url: 'https://worldscan.org' },
  },
  testnet: false,
};

export const config = getDefaultConfig({
  appName: 'Magnify.Cash',
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [worldchain],
  ssr: true,
});

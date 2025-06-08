const WORLDCHAIN_PARAMS = {
    chainId: "0x1e0",
    chainName: 'World Chain',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://yolo-intensive-owl.worldchain-mainnet.quiknode.pro/02bc3fb4f359e0c2dadc693ec8c9de8288edfad8/'],
    blockExplorerUrls: ['https://worldscan.org'],
  };
  
export const switchToWorldChain = async () => {
  try {
    await window.ethereum?.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x1E0',
        chainName: 'World Chain',
        rpcUrls: ['https://yolo-intensive-owl.worldchain-mainnet.quiknode.pro/02bc3fb4f359e0c2dadc693ec8c9de8288edfad8/'],
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
        blockExplorerUrls: ['https://worldchain-mainnet.explorer.alchemy.com'],
      }],
    });
  } catch (error) {
    console.error('Failed to add World Chain:', error);
  }
};
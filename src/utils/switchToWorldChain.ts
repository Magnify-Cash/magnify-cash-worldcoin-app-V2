const WORLDCHAIN_PARAMS = {
    chainId: "0x1e0",
    chainName: 'World Chain',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://worldchain-mainnet.g.alchemy.com/public'],
    blockExplorerUrls: ['https://worldscan.org'],
  };
  
export const switchToWorldChain = async () => {
    const ethereum = window.ethereum;
  
    if (!ethereum?.request) {
      throw new Error("Wallet provider not found");
    }
  
    try {
      // Try to switch chain
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: WORLDCHAIN_PARAMS.chainId }],
      });
    } catch (switchError: any) {
      // If not added yet
      if (switchError.code === 4902) {
        try {
          // Try to add the chain
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [WORLDCHAIN_PARAMS],
          });
        } catch (addError) {
          console.error("Failed to add World Chain:", addError);
          throw new Error("Please add World Chain manually in your wallet.");
        }
      } else {
        throw switchError;
      }
    }
  };